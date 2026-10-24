import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recipientUid = urlParams.get("to");

  const form = document.getElementById("send-form");
  const messageInput = document.getElementById("message-input");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  const toast = document.getElementById("toast");

  if (!recipientUid) {
    if (messageInput) {
      messageInput.disabled = true;
      messageInput.placeholder = "Invalid link: Recipient missing.";
    }
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    submitBtn.disabled = true;
    btnText.textContent = "Sending...";

    try {
      await addDoc(collection(db, "messages"), {
        recipientUid: recipientUid,
        message: text,
        createdAt: serverTimestamp()
      });

      messageInput.value = "";
      btnText.textContent = "Send Whisper";
      submitBtn.disabled = false;

      // Show success toast
      if (toast) {
        toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
        toast.classList.add("translate-y-0", "opacity-100");
        setTimeout(() => {
          toast.classList.remove("translate-y-0", "opacity-100");
          toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      btnText.textContent = "Send Whisper";
      submitBtn.disabled = false;
      alert("Failed to send whisper. Please try again.");
    }
  });
});
