/* ============================================================
   FILE: js/main.js
   Global init: Loader, Navbar, Mobile Menu, Active Nav,
   Contact Form handler, misc interactions
   ============================================================ */

(function () {
  'use strict';

  // ---- Page Loader ----
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 600);
    });

    // Fallback: hide after 3s in case load event fires late
    setTimeout(() => {
      if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }, 3000);
  }

  // ---- Navbar scroll behavior ----
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Inner pages have no #hero — keep glassmorphism on at all times
    const isInnerPage = !document.getElementById('hero');

    function onScroll() {
      if (isInnerPage || window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile hamburger menu ----
  function initMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const overlay   = document.querySelector('.nav-mobile-overlay');
    if (!hamburger || !overlay) return;

    function toggleMenu() {
      const isOpen = hamburger.classList.toggle('open');
      overlay.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    }

    hamburger.addEventListener('click', toggleMenu);
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Toggle navigation');

    // Close on overlay link click
    overlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        toggleMenu();
      }
    });
  }

  // ---- Highlight current page nav link ----
  function initActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile-overlay a').forEach((link) => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ---- Smooth scroll for anchor links ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height'), 10) || 80;
          const y = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }

  // ---- Contact form submit (client-side demo) ----
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn    = form.querySelector('button[type="submit"]');
      const original = btn.textContent;

      // Disable while "sending"
      btn.disabled   = true;
      btn.textContent = 'Sending…';

      setTimeout(() => {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#2d6a4f';
        form.reset();

        setTimeout(() => {
          btn.disabled   = false;
          btn.textContent = original;
          btn.style.background = '';
        }, 3500);
      }, 1500);
    });
  }

  // ---- Hero text reveal on index.html ----
  function initHeroReveal() {
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => {
      line.style.animationDelay = `${0.3 + i * 0.15}s`;
    });
  }

  // ---- Number counter fallback (if animations.js not loaded) ----
  function initCountersFallback() {
    if (window._countersInitialized) return;
    // handled by animations.js
  }

  // ---- Back to top button ----
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Prefers reduced motion ----
  function respectReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--transition',      'none');
      document.documentElement.style.setProperty('--transition-md',   'none');
      document.documentElement.style.setProperty('--transition-slow', 'none');
    }
  }

  // ---- Init all ----
  function init() {
    respectReducedMotion();
    initLoader();
    initNavbar();
    initMobileMenu();
    initActiveNav();
    initSmoothScroll();
    initContactForm();
    initHeroReveal();
    initBackToTop();
    initServicesPreviewGradient();
  }

  // ---- Scroll-driven gradient: Services Preview, Work, Testimonials ----
  function initServicesPreviewGradient() {
    const sections = document.querySelectorAll('#services-preview, #work, #testimonials, .section-gradient');
    if (!sections.length) return;

    const update = () => {
      const vh = window.innerHeight;
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height * 0.4)));
        // stop moves from 100% (all blue) → 50% (half blue, half black) as section scrolls in
        const stop = Math.round(100 - progress * 50);
        const gradient = `linear-gradient(to bottom, #5A6F8E 0%, #000000 ${stop}%)`;
        section.style.setProperty('background', gradient, 'important');
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
