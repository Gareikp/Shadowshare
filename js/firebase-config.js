import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLaEyyIHNsicYmA0SgyW9GH9wpd2kZqJ0",
  authDomain: "shadowshare-1.firebaseapp.com",
  projectId: "shadowshare-1",
  storageBucket: "shadowshare-1.firebasestorage.app",
  messagingSenderId: "925340395957",
  appId: "1:925340395957:web:eee578a59bc898337411fc",
  measurementId: "G-6BLY1Z9HZE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseConfig = firebaseConfig;

export { app, analytics, auth, db, firebaseConfig };",
  authDomain: "shadowshare-1.firebaseapp.com",
  projectId: "shadowshare-1",
  storageBucket: "shadowshare-1.firebasestorage.app",
  messagingSenderId: "925340395957",
  appId: "1:925340395957:web:eee578a59bc898337411f",
  measurementId: "G-6BLY1Z9HZE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
