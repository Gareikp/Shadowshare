(function () {
  const firebaseApp = firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(window.firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  if (auth.setPersistence) {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  }

  const normalizeUsername = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
  };

  const getCurrentUserProfile = async (uid) => {
    if (!uid) return null;
    const profile = await db.collection("users").doc(uid).get();
    return profile.exists ? profile.data() : null;
  };

  async function resolveUsernameToUid(username) {
    const normalized = normalizeUsername(username);
    if (!normalized) return null;

    const usernameDoc = await db.collection("usernames").doc(normalized).get();
    if (!usernameDoc.exists) return null;

    return usernameDoc.data().uid || null;
  }

  async function createUserProfile(uid, payload) {
    const profile = {
      uid,
      email: payload.email,
      username: normalizeUsername(payload.username),
      displayName: payload.displayName || payload.username || "Shadow User",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("users").doc(uid).set(profile, { merge: true });
    await db.collection("usernames").doc(profile.username).set({ uid }, { merge: true });
    return profile;
  }

  async function attachSignupForm() {
    const form = document.getElementById("signup-form");
    if (!form) return;

    const messageNode = document.getElementById("auth-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const displayName = String(formData.get("displayName") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const username = normalizeUsername(formData.get("username"));
      const password = String(formData.get("password") || "");

      if (!displayName || !email || !username || password.length < 6) {
        if (messageNode) {
          messageNode.textContent = "Please enter a valid display name, email, username, and a password with at least 6 characters.";
          messageNode.classList.add("error");
        }
        return;
      }

      try {
        if (messageNode) {
          messageNode.textContent = "Creating your account...";
          messageNode.classList.remove("error");
        }

        const usernameExists = await db.collection("usernames").doc(username).get();
        if (usernameExists.exists) {
          throw new Error("That username is already taken.");
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await createUserProfile(userCredential.user.uid, {
          email,
          username,
          displayName
        });

        if (messageNode) {
          messageNode.textContent = "Account created! Redirecting to your dashboard...";
          messageNode.classList.remove("error");
        }

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      } catch (error) {
        if (messageNode) {
          messageNode.textContent = error.message || "Unable to create account right now.";
          messageNode.classList.add("error");
        }
      }
    });
  }

  async function attachLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    const messageNode = document.getElementById("auth-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      if (!email || !password) {
        if (messageNode) {
          messageNode.textContent = "Please enter your email and password.";
          messageNode.classList.add("error");
        }
        return;
      }

      try {
        if (messageNode) {
          messageNode.textContent = "Signing you in...";
          messageNode.classList.remove("error");
        }

        await auth.signInWithEmailAndPassword(email, password);
        if (messageNode) {
          messageNode.textContent = "Logged in successfully.";
        }

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 600);
      } catch (error) {
        if (messageNode) {
          messageNode.textContent = error.message || "Incorrect email or password.";
          messageNode.classList.add("error");
        }
      }
    });
  }

  async function attachMessageForm() {
    const form = document.getElementById("message-form");
    if (!form) return;

    const recipientNode = document.getElementById("recipient-username");
    const statusNode = document.getElementById("message-status");
    const recipientParam = new URLSearchParams(window.location.search).get("user");

    if (recipientNode) {
      const username = recipientParam || "your-shadow";
      recipientNode.textContent = `Sending to @${normalizeUsername(username)}`;
      document.getElementById("recipientUsername")?.value = normalizeUsername(username);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const recipientUsername = normalizeUsername(document.getElementById("recipientUsername")?.value || recipientParam || "");
      const messageText = document.getElementById("message")?.value.trim() || "";

      if (!recipientUsername) {
        if (statusNode) {
          statusNode.textContent = "A user name is required to send a message.";
          statusNode.classList.add("error");
        }
        return;
      }

      if (!messageText) {
        if (statusNode) {
          statusNode.textContent = "Please write a message before sending.";
          statusNode.classList.add("error");
        }
        return;
      }

      try {
        if (statusNode) {
          statusNode.textContent = "Sending your message...";
          statusNode.classList.remove("error");
        }

        const recipientUid = await resolveUsernameToUid(recipientUsername);
        if (!recipientUid) {
          throw new Error("That user has not created a ShadowShare profile yet.");
        }

        await db.collection("messages").add({
          recipientUid,
          recipientUsername,
          senderUid: auth.currentUser ? auth.currentUser.uid : null,
          senderName: auth.currentUser ? (auth.currentUser.displayName || "Anonymous") : "Anonymous",
          message: messageText,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          isAnonymous: true,
          status: "new"
        });

        if (statusNode) {
          statusNode.textContent = "Your message was sent successfully.";
          statusNode.classList.remove("error");
        }

        form.reset();
        const mainField = document.getElementById("message");
        if (mainField) mainField.focus();
      } catch (error) {
        if (statusNode) {
          statusNode.textContent = error.message || "Something went wrong while sending the message.";
          statusNode.classList.add("error");
        }
      }
    });
  }

  async function renderDashboard() {
    const dashboardList = document.getElementById("dashboard-message-list");
    const emptyState = document.getElementById("dashboard-empty");
    const statusNode = document.getElementById("dashboard-status");
    const logoutButton = document.getElementById("logout-btn");

    if (!dashboardList) return;

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (statusNode) {
          statusNode.textContent = "You are not signed in yet.";
        }
        if (emptyState) {
          emptyState.hidden = false;
          emptyState.textContent = "Sign in to view your anonymous messages.";
        }
        if (logoutButton) logoutButton.hidden = true;
        dashboardList.innerHTML = "";
        return;
      }

      if (statusNode) {
        statusNode.textContent = "Loading your messages...";
      }

      try {
        const profile = await getCurrentUserProfile(user.uid);
        const username = profile && profile.username ? `@${profile.username}` : "your inbox";

        if (statusNode) {
          statusNode.textContent = `Welcome ${username}`;
        }

        const snapshot = await db
          .collection("messages")
          .where("recipientUid", "==", user.uid)
          .orderBy("createdAt", "desc")
          .get();

        if (snapshot.empty) {
          if (emptyState) {
            emptyState.hidden = false;
            emptyState.textContent = "No messages yet. Share your shadow link and start receiving feedback.";
          }
          dashboardList.innerHTML = "";
          return;
        }

        if (emptyState) emptyState.hidden = true;

        dashboardList.innerHTML = "";
        snapshot.forEach((doc) => {
          const data = doc.data();
          const item = document.createElement("article");
          item.className = "message-item";

          const createdAt = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
          const dateLabel = createdAt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          });

          item.innerHTML = `
            <div class="message-topline">
              <span class="tag subtle">Anonymous</span>
              <span class="time">${dateLabel}</span>
            </div>
            <p>"${(data.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</p>
          `;
          dashboardList.appendChild(item);
        });
      } catch (error) {
        if (statusNode) {
          statusNode.textContent = "Unable to load messages right now.";
        }
        if (emptyState) {
          emptyState.hidden = false;
          emptyState.textContent = error.message || "Please try again later.";
        }
      }
    });

    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        await auth.signOut();
        window.location.href = "login.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    attachSignupForm();
    attachLoginForm();
    attachMessageForm();
    renderDashboard();
  });

  window.shadowshareAuth = {
    auth,
    db,
    normalizeUsername,
    resolveUsernameToUid,
    getCurrentUserProfile,
    createUserProfile
  };
})();
