import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value.trim();
      const errorDiv = document.getElementById('signup-error');

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error("Sign up error:", error);
        if (errorDiv) {
          errorDiv.textContent = error.message;
          errorDiv.classList.remove('hidden');
        }
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const errorDiv = document.getElementById('login-error');

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error("Login error:", error);
        if (errorDiv) {
          errorDiv.textContent = "Invalid email or password.";
          errorDiv.classList.remove('hidden');
        }
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = 'index.html';
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }
});
