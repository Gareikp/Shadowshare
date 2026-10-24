document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const copyBtn = document.getElementById('copyDemoBtn');
  const copyText = document.getElementById('copyBtnText');
  const demoLink = document.getElementById('demoLink');

  if (copyBtn && demoLink) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(demoLink.textContent);
        copyText.textContent = 'Shadow Link copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyText.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2500);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });
  }

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});
