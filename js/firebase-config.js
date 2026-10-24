import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
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

export const auth = getAuth(app);
export const db = getFirestore(app);
