import { auth, db } from "./firebase-config.js";

(function () {
  const normalizeUsername = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
  };

  const displayStatus = (node, message, isError = false) => {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle("error", isError);
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
      createdAt: new Date()
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

      const displayName = document.getElementById("displayName").value.trim();
      const email = document.getElementById("email").value.trim();
      const username = normalizeUsername(document.getElementById("username").value);
      const password = document.getElementById("password").value;

      if (!displayName || !email || !username || password.length < 6) {
        displayStatus(messageNode, "Please enter a valid display name, email, username, and a password with at least 6 characters.", true);
        return;
      }

      try {
        displayStatus(messageNode, "Creating account...", false);

        const usernameExists = await db.collection("usernames").doc(username).get();
        if (usernameExists.exists) {
          throw new Error("That username is already taken.");
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await createUserProfile(userCredential.user.uid, { email, username, displayName });

        displayStatus(messageNode, "Account created! Redirecting...", false);
        setTimeout(() => window.location.href = "dashboard.html", 800);
      } catch (error) {
        displayStatus(messageNode, error.message || "Unable to create account right now.", true);
      }
    });
  }

  async function attachLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    const messageNode = document.getElementById("auth-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        displayStatus(messageNode, "Please enter your email and password.", true);
        return;
      }

      try {
        displayStatus(messageNode, "Signing you in...", false);
        await auth.signInWithEmailAndPassword(email, password);
        displayStatus(messageNode, "Logged in successfully.", false);
        setTimeout(() => window.location.href = "dashboard.html", 600);
      } catch (error) {
        displayStatus(messageNode, error.message || "Incorrect email or password.", true);
      }
    });
  }

  async function attachMessageForm() {
    const form = document.getElementById("message-form");
    if (!form) return;

    const recipientNode = document.getElementById("recipient-username");
    const statusNode = document.getElementById("message-status");
    const params = new URLSearchParams(window.location.search);
    const recipientValue = params.get("user") || "your-shadow";
    const recipientUser = normalizeUsername(recipientValue);

    if (recipientNode) {
      recipientNode.textContent = `Sending to @${recipientUser}`;
    }

    const hiddenRecipient = document.getElementById("recipientUsername");
    if (hiddenRecipient) {
      hiddenRecipient.value = recipientUser;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const recipient = normalizeUsername(document.getElementById("recipientUsername")?.value || "");
      const messageText = document.getElementById("message").value.trim();

      if (!recipient) {
        displayStatus(statusNode, "A recipient username is required.", true);
        return;
      }

      if (!messageText) {
        displayStatus(statusNode, "Please write a message before sending.", true);
        return;
      }

      try {
        displayStatus(statusNode, "Sending message...", false);

        const recipientUid = await resolveUsernameToUid(recipient);
        if (!recipientUid) {
          throw new Error("That user has not created a ShadowShare profile yet.");
        }

        await db.collection("messages").add({
          recipientUid,
          recipientUsername: recipient,
          senderUid: auth.currentUser ? auth.currentUser.uid : null,
          senderName: auth.currentUser ? auth.currentUser.displayName || "Anonymous" : "Anonymous",
          message: messageText,
          createdAt: new Date(),
          isAnonymous: true,
          status: "new"
        });

        displayStatus(statusNode, "Message sent successfully.", false);
        form.reset();
      } catch (error) {
        displayStatus(statusNode, error.message || "Unable to send message.", true);
      }
    });
  }

  async function renderDashboard() {
    const listNode = document.getElementById("dashboard-message-list");
    const emptyNode = document.getElementById("dashboard-empty");
    const statusNode = document.getElementById("dashboard-status");
    const logoutBtn = document.getElementById("logout-btn");

    if (!listNode) return;

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (statusNode) statusNode.textContent = "You are not signed in.";
        if (emptyNode) {
          emptyNode.hidden = false;
          emptyNode.textContent = "Please log in to view your inbox.";
        }
        if (logoutBtn) logoutBtn.hidden = true;
        listNode.innerHTML = "";
        return;
      }

      try {
        const profile = await getCurrentUserProfile(user.uid);
        const handle = profile && profile.username ? `@${profile.username}` : "@your-inbox";

        const handleNode = document.getElementById("user-handle");
        if (handleNode) handleNode.textContent = handle;

        if (statusNode) statusNode.textContent = "Loading your messages...";

        const snapshot = await db
          .collection("messages")
          .where("recipientUid", "==", user.uid)
          .orderBy("createdAt", "desc")
          .get();

        if (snapshot.empty) {
          if (emptyNode) {
            emptyNode.hidden = false;
            emptyNode.textContent = "No messages yet. Share your shadow link to start receiving feedback.";
          }
          listNode.innerHTML = "";
          return;
        }

        if (emptyNode) emptyNode.hidden = true;
        listNode.innerHTML = "";

        snapshot.forEach((doc) => {
          const data = doc.data();
          const article = document.createElement("article");
          article.className = "message-item";

          const createdAt = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
          article.innerHTML = `
            <div class="message-topline">
              <span class="tag subtle">Anonymous</span>
              <span class="time">${createdAt.toLocaleDateString()}</span>
            </div>
            <p>"${(data.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</p>
          `;
          listNode.appendChild(article);
        });
      } catch (error) {
        if (statusNode) statusNode.textContent = "Unable to load messages right now.";
        if (emptyNode) {
          emptyNode.hidden = false;
          emptyNode.textContent = error.message || "Please try again later.";
        }
      }
    });

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
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

  window.shadowshareFirebase = {
    auth,
    db,
    normalizeUsername,
    resolveUsernameToUid,
    getCurrentUserProfile,
    createUserProfile
  };
})();
