import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const usernameInput = document.getElementById('signup-username');
      const emailInput = document.getElementById('signup-email');
      const passwordInput = document.getElementById('signup-password');
      const errorDiv = document.getElementById('signup-error');

      const username = usernameInput?.value.trim() || '';
      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value.trim() || '';

      if (!username || !email || !password) {
        if (errorDiv) {
          errorDiv.textContent = 'Please fill in all fields.';
          errorDiv.classList.remove('hidden');
        }
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        window.location.replace('dashboard.html');
      } catch (error) {
        console.error('Sign up error:', error);
        if (errorDiv) {
          errorDiv.textContent = error.message;
          errorDiv.classList.remove('hidden');
        }
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const errorDiv = document.getElementById('login-error');

      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value.trim() || '';

      if (!email || !password) {
        if (errorDiv) {
          errorDiv.textContent = 'Please enter your email and password.';
          errorDiv.classList.remove('hidden');
        }
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.replace('dashboard.html');
      } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) {
          errorDiv.textContent = 'Invalid email or password.';
          errorDiv.classList.remove('hidden');
        }
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        await signOut(auth);
        window.location.replace('index.html');
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }
});
