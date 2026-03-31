// A/L ICT Tamil Medium Notes Hub - Main JavaScript File

document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     Mobile Navigation Toggle
  ========================================================= */
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = navLinks.classList.contains('show');
      navLinks.classList.toggle('show');
      mobileMenuBtn.innerHTML = isExpanded 
        ? '<i class="fa-solid fa-bars"></i>' 
        : '<i class="fa-solid fa-xmark"></i>';
    });
  }


  /* =========================================================
     PDF Card Expand / Collapse Toggle
  ========================================================= */
  document.querySelectorAll('.pdf-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const body = document.getElementById(targetId);
      if (!body) return;

      const isExpanded = body.classList.contains('expanded');

      body.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', String(!isExpanded));
      btn.setAttribute('aria-label', isExpanded ? 'Show details' : 'Hide details');
    });
  });


  /* =========================================================
     Service Worker Registration for PWA / Offline usage
  ========================================================= */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
});
