    // Safely generate URL supporting GitHub Pages subfolders & root domains
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) || '';
    const userUrl = `${window.location.origin}${basePath}/send.html?to=${user.uid}`;
    
    if (shadowLinkDisplay) {
      shadowLinkDisplay.textContent = userUrl;
    }

    // Fetch Whispers from Firestore
    try {
      await user.getIdToken(true);

      const q = query(
        collection(db, "messages"),
        where("recipientUid", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      
      // Clear the "Scanning..." placeholder
      if (messagesContainer) {
        messagesContainer.innerHTML = ""; 
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
        messageCard.className = "bg-midnight-900 border border-white/10 p-5 rounded-2xl shadow-md transition-all hover:border-purple-500/40 mb-3 text-left";
        
        let timeString = "Just now";
        if (data.createdAt && data.createdAt.toDate) {
          timeString = data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        messageCard.innerHTML = `
          <p class="text-sm text-gray-200 leading-relaxed break-words">${escapeHTML(data.message || data.text || "Empty whisper")}</p>
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
