import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dashboard / Shadowbox Logic
  const loadingText = document.getElementById('loading-text');
  const messagesContainer = document.getElementById('messages-container');
  const shadowLinkDisplay = document.getElementById('shadow-link-display');
  const copyShadowLinkBtn = document.getElementById('copyShadowLink');

  if (messagesContainer || shadowLinkDisplay) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = 'login.html';
        return;
      }

      const username = user.displayName || user.email.split('@')[0];
      const userShadowLink = `shadowshare.site/${username}`;

      if (shadowLinkDisplay) {
        shadowLinkDisplay.textContent = userShadowLink;
      }

      if (copyShadowLinkBtn) {
        copyShadowLinkBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(userShadowLink);
            copyShadowLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
              copyShadowLinkBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2500);
          } catch (err) {
            console.error('Failed to copy link:', err);
          }
        });
      }

      await loadWhispers(user.uid);
    });
  }

  // 2. Drop a Whisper Form Logic
  const whisperForm = document.getElementById('shadowForm');
  const whisperText = document.getElementById('whisperText');
  const veilNotice = document.getElementById('veilNotice');
  const MAX_CHARS = 300;

  if (whisperText && veilNotice) {
    whisperText.addEventListener('input', () => {
      const currentLength = whisperText.value.length;
      if (currentLength >= MAX_CHARS - 30) {
        veilNotice.classList.remove('hidden');
      } else {
        veilNotice.classList.add('hidden');
      }
    });
  }

  if (whisperForm) {
    whisperForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = whisperText.value.trim();
      if (!text) return;

      const urlParams = new URLSearchParams(window.location.search);
      const recipientUid = urlParams.get('to');

      if (!recipientUid) {
        alert("Invalid Shadow Link. Cannot deliver whisper.");
        return;
      }

      try {
        await addDoc(collection(db, "messages"), {
          recipientUid: recipientUid,
          text: text,
          createdAt: serverTimestamp()
        });

        alert("Whisper dropped successfully into the shadows!");
        whisperText.value = '';
        veilNotice.classList.add('hidden');
      } catch (error) {
        console.error("Error dropping whisper:", error);
        alert("Failed to drop whisper. Please try again.");
      }
    });
  }

  async function loadWhispers(uid) {
    try {
      const q = query(collection(db, "messages"), where("recipientUid", "==", uid));
      const querySnapshot = await getDocs(q);

      let whispers = [];
      querySnapshot.forEach((document) => {
        whispers.push({ id: document.id, ...document.data() });
      });

      whispers.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      if (loadingText) loadingText.style.display = 'none';

      if (whispers.length === 0) {
        messagesContainer.innerHTML = `
          <div class="form-status" style="text-align: center; padding: 2rem;">
            <i class="fas fa-ghost" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-primary);"></i>
            <p>Your Shadowbox is quiet. Share your Shadow Link to get whispers.</p>
          </div>
        `;
        return;
      }

      messagesContainer.innerHTML = '';
      whispers.forEach((whisper) => {
        const card = document.createElement('div');
        card.className = 'whisper-card';
        card.innerHTML = `
          <p class="whisper-text">${escapeHtml(whisper.text)}</p>
          <div class="whisper-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
            <span class="whisper-time">${formatTime(whisper.createdAt)}</span>
            <button class="fade-btn" data-id="${whisper.id}" style="background: none; border: none; color: #ff5555; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fas fa-trash-alt"></i> Fade
            </button>
          </div>
        `;
        messagesContainer.appendChild(card);
      });

      document.querySelectorAll('.fade-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const messageId = e.currentTarget.getAttribute('data-id');
          if (confirm("Fade this whisper? It will vanish into the shadows.")) {
            await fadeWhisper(messageId, e.currentTarget.closest('.whisper-card'));
          }
        });
      });

    } catch (error) {
      console.error("Error loading whispers:", error);
      if (loadingText) loadingText.textContent = "Failed to load your Shadowbox.";
    }
  }

  async function fadeWhisper(messageId, cardElement) {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      cardElement.style.opacity = '0';
      setTimeout(() => cardElement.remove(), 300);
    } catch (error) {
      console.error("Error fading whisper:", error);
      alert("Could not fade this whisper. Try again.");
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
});
