import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  doc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const usernameInput = document.getElementById("signup-username");
      const emailInput = document.getElementById("signup-email");
      const passwordInput = document.getElementById("signup-password");
      const errorDiv = document.getElementById("signup-error");

      const showError = (msg) => {
        if (errorDiv) {
          errorDiv.textContent = msg;
          errorDiv.classList.remove("hidden");
        }
      };

      const username = usernameInput?.value.trim() || "";
      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value.trim() || "";

      if (!username || !email || !password) {
        showError("Please fill in all fields.");
        return;
      }

      const handle = username.toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
        showError("Username must be 3-20 characters: letters, numbers, underscore.");
        return;
      }

      // Step 1: create the auth account
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Sign up error:", error);
        if (error.code === "auth/email-already-in-use") {
          showError("This email is already registered. Try signing in.");
        } else if (error.code === "auth/weak-password") {
          showError("Password must be at least 6 characters.");
        } else {
          showError(error.message || "Sign up failed.");
        }
        return;
      }

      // Step 2: reserve the username + save profile (atomic)
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "usernames", handle), { uid: cred.user.uid });
        batch.set(doc(db, "users", cred.user.uid), { username: handle });
        await batch.commit(); // fails entirely if the username already exists

        await updateProfile(cred.user, { displayName: handle });
        window.location.replace("dashboard.html");
      } catch (error) {
        console.error("Username error:", error);
        try {
          await deleteUser(cred.user); // undo the account so the email isn't wasted
        } catch (e) {
          console.error("Cleanup failed:", e);
        }
        showError("That username is taken. Try another.");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");
      const errorDiv = document.getElementById("login-error");

      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value.trim() || "";

      if (!email || !password) {
        if (errorDiv) {
          errorDiv.textContent = "Please enter your email and password.";
          errorDiv.classList.remove("hidden");
        }
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.replace("dashboard.html");
      } catch (error) {
        console.error("Login error:", error);

        if (errorDiv) {
          errorDiv.textContent = "Invalid email or password.";
          errorDiv.classList.remove("hidden");
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        await signOut(auth);
        window.location.replace("index.html");
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }
});
