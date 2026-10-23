document.addEventListener('DOMContentLoaded', () => {
    const yearNode = document.getElementById('current-year');
    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const linkText = 'shadowshare.site/yourname';
            try {
                await navigator.clipboard.writeText(linkText);
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = original;
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

            alert(`Preview: ${text.slice(0, 120)}${text.length > 120 ? '...' : ''}`);
        });
    }

    const form = document.querySelector('.shadow-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const message = form.querySelector('#message')?.value.trim();
            if (!message) {
                form.querySelector('#message')?.focus();
                return;
            }

            const button = form.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Sent anonymously';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                form.reset();
            }, 1800);
        });
    }
});
