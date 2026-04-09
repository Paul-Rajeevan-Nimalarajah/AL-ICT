// A/L ICT Tamil Medium Notes Hub - Main JavaScript File

document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     Section Expand / Collapse (Accordion for Units/Years)
  ========================================================= */
  const initAccordions = () => {
    document.querySelectorAll('.section-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-target');
        const wrapper = document.getElementById(targetId);
        if (!wrapper) return;
        
        const isCollapsed = wrapper.classList.contains('collapsed');
        
        // Optional: Close others
        // document.querySelectorAll('.section-collapse-wrapper').forEach(w => {
        //   if (w !== wrapper) w.classList.add('collapsed');
        // });
        
        wrapper.classList.toggle('collapsed');
        
        // Update button icon and aria
        const btn = toggle.querySelector('.pdf-toggle-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', String(isCollapsed));
          btn.setAttribute('aria-label', isCollapsed ? 'Hide section' : 'Show section');
          const icon = btn.querySelector('.toggle-icon');
          if (icon) icon.style.transform = isCollapsed ? 'rotate(180deg)' : '';
        }
      });
    });
  };

  /* =========================================================
     Telegram Mini App Initialization & Navigation
  ========================================================= */
  const tg = window.Telegram ? window.Telegram.WebApp : null;

  if (tg) {
    tg.ready();
    tg.expand();
    
    // Show back button if not on homepage
    const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (!isHome) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => window.history.back());
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
      // Grouping under More
      '/tuition': 'nav-more',
      '/tuition.html': 'nav-more',
      '/online-ide': 'nav-more',
      '/online-ide.html': 'nav-more',
      '/contact': 'nav-more',
      '/contact.html': 'nav-more'
    };
    
    // Highlight active tab
    Object.keys(navItems).forEach(key => {
      if (path === key || path.endsWith(key)) {
        const el = document.getElementById(navItems[key]);
        if (el) el.classList.add('active');
      }
    });

    // More Menu Toggle
    const moreBtn = document.getElementById('nav-more');
    const moreMenu = document.getElementById('more-menu-overlay');
    
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        moreMenu.classList.toggle('show');
        impact('medium');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!moreBtn.contains(e.target) && !moreMenu.contains(e.target)) {
          moreMenu.classList.remove('show');
        }
      });
    }

    // Haptic feedback helper
    const impact = (style = 'light') => {
      if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
    }

    // Attach listeners
    document.querySelectorAll('.btn, .pdf-toggle-btn, .nav-item, .section-toggle').forEach(el => {
      el.addEventListener('click', () => impact('light'));
    });
  }

  // Initialize
  initAccordions();

  /* =========================================================
     Service Worker Registration (PWA)
  ========================================================= */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed:', err));
    });
  }
});
