// A/L ICT Tamil Medium Notes Hub - Main JavaScript File

document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     Telegram Mini App Initialization
  ========================================================= */
  const tg = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData ? window.Telegram.WebApp : null;

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
  }

  // Haptic feedback helper
  const impact = (style = 'light') => {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style);
  };

  /* =========================================================
     Bottom Navigation & Active States
  ========================================================= */
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
    '/about': 'nav-more',
    '/about.html': 'nav-more',
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

  /* =========================================================
     Section Expand / Collapse (Accordions)
  ========================================================= */
  const initAccordions = () => {
    // 1. Main Sections (e.g., Year/Unit Wrappers)
    document.querySelectorAll('.section-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-target');
        const wrapper = document.getElementById(targetId);
        if (!wrapper) return;
        
        const isCollapsed = wrapper.classList.contains('collapsed');
        wrapper.classList.toggle('collapsed');
        
        // Update button icon and aria
        const btn = toggle.querySelector('.pdf-toggle-btn') || toggle; 
        if (btn && btn.setAttribute) {
          btn.setAttribute('aria-expanded', String(isCollapsed));
          const icon = btn.querySelector('.toggle-icon');
          if (icon) icon.style.transform = isCollapsed ? 'rotate(180deg)' : '';
        }
        impact('light');
      });
    });

    // 2. Inner PDF Cards (Detailed description drops)
    document.querySelectorAll('.pdf-toggle-btn').forEach(btn => {
      // Don't bind again if it's part of a section-toggle
      if (btn.closest('.section-toggle')) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        
        const body = document.getElementById(targetId);
        if (!body) return;

        const isExpanded = body.classList.contains('expanded');
        body.classList.toggle('expanded');
        
        btn.setAttribute('aria-expanded', String(!isExpanded));
        const icon = btn.querySelector('.toggle-icon');
        if (icon) icon.style.transform = !isExpanded ? 'rotate(180deg)' : '';
        impact('light');
      });
    });
  };

  // Attach haptics to generic buttons
  document.querySelectorAll('.btn, .nav-item').forEach(el => {
    el.addEventListener('click', () => impact('light'));
  });

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
