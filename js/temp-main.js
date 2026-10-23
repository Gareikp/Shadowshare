document.addEventListener('DOMContentLoaded', () => {
    const yearNode = document.getElementById('current-year');
    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        const linkText = copyBtn.dataset.copyText || 'shadowshare.site/yourname';

        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(linkText);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            } catch (error) {
                copyBtn.textContent = 'Copy unavailable';
            }
        });
    }

    const previewButton = document.getElementById('preview-message');
    const messageField = document.getElementById('message');
    if (previewButton && messageField) {
        previewButton.addEventListener('click', () => {
            const text = messageField.value.trim();
            if (!text) {
                messageField.focus();
                return;
            }

            const previewText = text.length > 120 ? `${text.slice(0, 120)}...` : text;
            alert(`Preview: ${previewText}`);
        });
    }

    const form = document.querySelector('.shadow-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const messageInput = form.querySelector('#message');
            const message = messageInput?.value.trim();

            if (!message) {
                messageInput?.focus();
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) {
                form.reset();
                return;
            }

            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-check"></i> Sent anonymously';
            submitButton.disabled = true;

            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                form.reset();
            }, 1800);
        });
    }
});
