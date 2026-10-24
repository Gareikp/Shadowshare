import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const shadowLinkDisplay = document.getElementById("shadow-link-display");
  const messagesContainer = document.getElementById("messages-container");
  const copyBtn = document.getElementById("copyShadowLink");
  const copyText = document.getElementById("copyText");
  const messageCountBadge = document.getElementById("messageCount");
  const userEmailDisplay = document.getElementById("user-email-display");
  const logoutBtn = document.getElementById("logout-btn");
  const toast = document.getElementById("toast");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (userEmailDisplay && user.email) {
      userEmailDisplay.textContent = user.email;
    }

    const basePath = window.location.pathname.substring(
      0,
      window.location.pathname.lastIndexOf("/")
    ) || "";

    const userUrl = `${window.location.origin}${basePath}/send.html?to=${user.uid}`;

    if (shadowLinkDisplay) {
      shadowLinkDisplay.textContent = userUrl;
    }

    if (copyBtn && shadowLinkDisplay) {
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(shadowLinkDisplay.textContent.trim());

          if (copyText) {
            copyText.textContent = "Copied!";
          }

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
        } catch (error) {
          console.error("Copy failed:", error);

          if (toast) {
            toast.textContent = "Copy failed";
            toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
            toast.classList.add("translate-y-0", "opacity-100");

            setTimeout(() => {
              toast.classList.remove("translate-y-0", "opacity-100");
              toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
            }, 2500);
          }
        }
      };
    }

    try {
      await user.getIdToken(true);

      const q = query(
        collection(db, "messages"),
        where("recipientUid", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);

      if (messagesContainer) {
        messagesContainer.innerHTML = "";
      }

      const totalMessages = querySnapshot.size;

      if (messageCountBadge) {
        messageCountBadge.textContent = `${totalMessages} Whisper${totalMessages === 1 ? "" : "s"}`;
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
        const messageText = data.message || data.text || "Empty whisper";

        const messageCard = document.createElement("div");
        messageCard.className =
          "bg-midnight-900 border border-white/10 p-5 rounded-2xl shadow-md transition-all hover:border-purple-500/40 mb-3 text-left";

        let timeString = "Just now";
        if (data.createdAt && data.createdAt.toDate) {
          timeString = data.createdAt
            .toDate()
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }

        messageCard.innerHTML = `
          <p class="text-sm text-gray-200 leading-relaxed break-words">${escapeHTML(messageText)}</p>
          <div class="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
            <span><i class="far fa-clock mr-1 text-purple-400"></i>${timeString}</span>
            <span class="text-purple-400 font-medium">Anonymous</span>
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
            Error loading data: ${escapeHTML(error.message || "")}
          </div>
        `;
      }
    }
  });

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

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, (tag) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    return map[tag] || tag;
  });
}
