document.addEventListener("DOMContentLoaded", () => {
    // Copy buttons logic
    const copyBtns = document.querySelectorAll('.copy-btn, .copy-link-btn, #copy-shadow-link');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const linkText = btn.dataset.copyText || 'shadowshare.site/yourname';
            navigator.clipboard.writeText(linkText).then(() => {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => btn.innerHTML = original, 2000);
            });
        });
    });

    // Auto-update year in footer
    const yearEls = document.querySelectorAll('#current-year');
    yearEls.forEach(el => el.textContent = new Date().getFullYear());
});
