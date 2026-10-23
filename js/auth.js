import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.toLowerCase();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = signupForm.querySelector('button');
            try {
                submitBtn.textContent = 'Creating...';
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCred.user.uid), { username, email });
                await setDoc(doc(db, "usernames", username), { uid: userCred.user.uid });
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(error.message);
                submitBtn.textContent = 'Create Account';
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }
    document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', () => {
        signOut(auth).then(() => window.location.href = 'index.html');
    }));
});
