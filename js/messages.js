import { auth, db } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUser = urlParams.get('user');
        const recipientName = document.getElementById('recipient-name');
        if (targetUser && recipientName) recipientName.textContent = `Sending to @${targetUser}`;

        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageText = document.getElementById('message-text').value;
            const submitBtn = messageForm.querySelector('button[type="submit"]');
            if (!targetUser) return alert("Invalid link: No user specified.");
            try {
                submitBtn.innerHTML = 'Sending...';
                const usernameQuery = query(collection(db, "usernames"), where("__name__", "==", targetUser));
                const usernameSnap = await getDocs(usernameQuery);
                if (usernameSnap.empty) throw new Error("That user has not created a ShadowShare profile yet.");
                
                const recipientUid = usernameSnap.docs[0].data().uid;
                await addDoc(collection(db, "messages"), {
                    text: messageText,
                    recipientUid: recipientUid,
                    createdAt: serverTimestamp()
                });
                messageForm.reset();
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                setTimeout(() => submitBtn.innerHTML = 'Send anonymously', 3000);
            } catch (error) {
                alert(error.message);
                submitBtn.innerHTML = 'Send anonymously';
            }
        });
    }

    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        onAuthStateChanged(auth, async (user) => {
            if (!user) return window.location.href = 'login.html';
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if(userDoc.exists()) {
                    const username = userDoc.data().username;
                    const link = window.location.origin + '/Shadowshare/message.html?user=' + username;
                    const linkDisplay = document.getElementById('shadow-link-display');
                    if(linkDisplay) linkDisplay.textContent = link;
                    const copyBtn = document.getElementById('copy-shadow-link');
                    if(copyBtn) copyBtn.setAttribute('data-copy-text', link);
                }
                const q = query(collection(db, "messages"), where("recipientUid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                let messages = [];
                querySnapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() }));
                messages.sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                });
                const loadingText = document.getElementById('loading-text');
                if (loadingText) loadingText.style.display = 'none';
                if (messages.length === 0) {
                    messagesContainer.innerHTML = '<p style="color:var(--text-secondary);">No messages yet. Share your link!</p>';
                    return;
                }
                messagesContainer.innerHTML = '';
                messages.forEach(msg => {
                    const dateStr = msg.createdAt ? msg.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';
                    messagesContainer.innerHTML += `
                        <div class="message-card" style="margin-bottom: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color);">
                            <div class="message-header" style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">
                                <span>Anonymous</span>
                                <span>${dateStr}</span>
                            </div>
                            <div class="message-body" style="color:var(--text-primary);">
                                <p>"${msg.text}"</p>
                            </div>
                        </div>
                    `;
                });
            } catch (error) {
                console.error(error);
                if (document.getElementById('loading-text')) document.getElementById('loading-text').textContent = "Error loading messages.";
            }
        });
    }
});
