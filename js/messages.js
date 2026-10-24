// js/messages.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const shadowLinkDisplay = document.getElementById("shadow-link-display");
  const messagesContainer = document.getElementById("messages-container");
  const copyBtn = document.getElementById("copyShadowLink");
  const copyText = document.getElementById("copyText");
  const messageCountBadge = document.getElementById("messageCount");
  const userEmailDisplay = document.getElementById("user-email-display");
  const logoutBtn = document.getElementById("logout-btn");
  const toast = document.getElementById("toast");

  // Auth State Observer
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Display user email safely
    if (userEmailDisplay && user.email) {
      userEmailDisplay.textContent = user.email;
    }

    // Safely generate URL supporting GitHub Pages subfolders & root domains
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) || '';
    const userUrl = `${window.location.origin}${basePath}/send.html?to=${user.uid}`;
    
    if (shadowLinkDisplay) {
      shadowLinkDisplay.textContent = userUrl;
    }

    // Copy Button Handler with Toast Feedback
    if (copyBtn && shadowLinkDisplay) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(shadowLinkDisplay.textContent.trim());
        if (copyText) copyText.textContent = "Copied!";
        copyBtn.classList.add("bg-emerald-600");

        if (toast) {
          toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
          toast.classList.add("translate-y-0", "opacity-100");
          setTimeout(() => {
            toast.classList.remove("translate-y-0", "opacity-100");
            toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
          }, 2500);
        }

        setTimeout(() => {
          if (copyText) copyText.textContent = "Copy Link";
          copyBtn.classList.remove("bg-emerald-600");
        }, 2000);
      };
    }

    // Fetch Whispers from Firestore
    try {
      const q = query(
        collection(db, "messages"),
        where("recipientUid", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      
      if (messagesContainer) {
        messagesContainer.innerHTML = ""; // Clear loading state
      }

      const totalMessages = querySnapshot.size;

      // Update message count badge
      if (messageCountBadge) {
        messageCountBadge.textContent = `${totalMessages} Whisper${totalMessages === 1 ? '' : 's'}`;
      }

      if (totalMessages === 0) {
        if (messagesContainer) {
          messagesContainer.innerHTML = `
            <div class="text-center py-12">
              <div class="w-12 h-12 rounded-2xl bg-midnight-700 border border-white/10 flex items-center justify-center text-gray-400 mx-auto mb-4">
                <i class="fas fa-ghost text-xl"></i>
              </div>
              <p class="text-sm text-gray-400 font-medium">No whispers found yet. Share your link!</p>
            </div>
          `;
        }
        return;
      }

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const messageCard = document.createElement("div");
        messageCard.className = "bg-midnight-900 border border-white/10 p-5 rounded-2xl shadow-md transition-all hover:border-purple-500/40";
        
        messageCard.innerHTML = `
          <p class="text-sm text-gray-200 leading-relaxed break-words">${escapeHTML(data.text || data.message || "Empty whisper")}</p>
          <div class="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
            <span><i class="far fa-clock mr-1 text-purple-400"></i>Anonymous</span>
          </div>
        `;
        if (messagesContainer) {
          messagesContainer.appendChild(messageCard);
        }
      });

    } catch (error) {
      console.error("Error fetching messages:", error);
      if (messagesContainer) {
        messagesContainer.innerHTML = `
          <div class="text-center py-8 text-red-400 text-xs">
            Failed to load your Shadowbox data. Check Firestore configuration.
          </div>
        `;
      }
    }
  });

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.onclick = async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (error) {
        console.error("Sign out error:", error);
      }
    };
  }
});

// Helper to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
