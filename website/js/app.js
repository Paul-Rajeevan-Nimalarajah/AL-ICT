  /* =========================================================
     Section Expand / Collapse (Accordion for Units/Years)
  ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-target');
        const wrapper = document.getElementById(targetId);
        if (!wrapper) return;
        const expanded = !wrapper.classList.contains('collapsed');
        document.querySelectorAll('.section-collapse-wrapper').forEach(w => {
          if (w !== wrapper) w.classList.add('collapsed');
        });
        wrapper.classList.toggle('collapsed');
        // Update button icon and aria
        const btn = toggle.querySelector('.pdf-toggle-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', String(!expanded));
          btn.setAttribute('aria-label', expanded ? 'Show section' : 'Hide section');
          const icon = btn.querySelector('.toggle-icon');
          if (icon) icon.style.transform = expanded ? '' : 'rotate(180deg)';
        }
      });
    });
  });
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
     Telegram Mini App Initialization
  ========================================================= */
  const tg = window.Telegram ? window.Telegram.WebApp : null;

  if (tg) {
    tg.ready();
    tg.expand();
    
    // Show back button if not on homepage
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });
    } else {
      tg.BackButton.hide();
    }

    // Active state for bottom nav
    const path = window.location.pathname;
    const navItems = {
      '/': 'nav-home',
      '/index.html': 'nav-home',
      '/notes': 'nav-notes',
      '/notes.html': 'nav-notes',
      '/past-papers': 'nav-past',
      '/past-papers.html': 'nav-past',
      '/model-papers': 'nav-model',
      '/model-papers.html': 'nav-model',
      '/online-ide': 'nav-ide',
      '/online-ide.html': 'nav-ide'
    };
    
    const activeId = navItems[path];
    if (activeId) {
      const activeEl = document.getElementById(activeId);
      if (activeEl) activeEl.classList.add('active');
    }

    // Haptic feedback helper
    const impact = (style = 'medium') => {
      if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
    }

    // Add haptics to all buttons and nav items
    document.querySelectorAll('.btn, .pdf-toggle-btn, .nav-item').forEach(btn => {
      btn.addEventListener('click', () => impact('light'));
    });
  }

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
