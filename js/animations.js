/* ============================================================
   FILE: js/animations.js
   Intersection Observer — scroll-reveal, skill bars,
   counters, parallax
   ============================================================ */

(function () {
  'use strict';

  // ---- Scroll Reveal ----
  function initReveal() {
    const revealEls = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children'
    );

    if (revealEls.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  // ---- Animated Counters ----
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
  }

  // ---- Skill Bars ----
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (bars.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = fill.dataset.width || '0%';
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach((bar) => observer.observe(bar));
  }

  // ---- Parallax (subtle) ----
  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (parallaxEls.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function onScroll() {
      const scrollY = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed  = parseFloat(el.dataset.parallax) || 0.3;
        const rect   = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (window.innerHeight / 2 - center) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial
  }

  // ---- Marquee / horizontal scroll text ----
  function initMarquee() {
    const marquees = document.querySelectorAll('.marquee-track');
    marquees.forEach((track) => {
      // Clone content for seamless loop
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentElement.appendChild(clone);
    });
  }

  // ---- Typing effect ----
  function initTyping() {
    const typers = document.querySelectorAll('[data-type]');
    typers.forEach((el) => {
      const words  = el.dataset.type.split(',').map(s => s.trim());
      const speed  = parseInt(el.dataset.typeSpeed, 10) || 100;
      const pause  = parseInt(el.dataset.typePause, 10) || 1800;
      let wordIdx  = 0;
      let charIdx  = 0;
      let deleting = false;

      function tick() {
        const word = words[wordIdx];
        if (deleting) {
          charIdx--;
          el.textContent = word.slice(0, charIdx);
          if (charIdx === 0) {
            deleting = false;
            wordIdx  = (wordIdx + 1) % words.length;
            setTimeout(tick, 400);
            return;
          }
          setTimeout(tick, speed / 2);
        } else {
          charIdx++;
          el.textContent = word.slice(0, charIdx);
          if (charIdx === word.length) {
            deleting = true;
            setTimeout(tick, pause);
            return;
          }
          setTimeout(tick, speed);
        }
      }

      tick();
    });
  }

  // ---- Tilt card effect ----
  function initTilt() {
    const tiltEls = document.querySelectorAll('[data-tilt]');
    if (window.matchMedia('(hover: none)').matches) return;

    tiltEls.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        const intensity = parseFloat(el.dataset.tilt) || 8;

        el.style.transform = `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ---- FAQ Accordion ----
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach((i) => i.classList.remove('open'));
        // Open clicked (unless it was already open)
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ---- Filter tabs ----
  function initFilterTabs() {
    const tabGroups = document.querySelectorAll('[data-filter-group]');
    tabGroups.forEach((group) => {
      const tabs  = group.querySelectorAll('.filter-tab');
      const items = group.dataset.filterTarget
        ? document.querySelectorAll(group.dataset.filterTarget)
        : [];

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');

          const filter = tab.dataset.filter;
          items.forEach((item) => {
            const show = filter === 'all' || item.dataset.category === filter;
            item.style.opacity    = show ? '1' : '0';
            item.style.transform  = show ? 'scale(1)' : 'scale(0.95)';
            item.style.pointerEvents = show ? 'auto' : 'none';
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.display    = show ? '' : 'none';
          });
        });
      });
    });
  }

  // ---- Smooth nav highlight (scroll-spy) ----
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}` || href.endsWith(`#${id}`));
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach((s) => observer.observe(s));
  }

  // ---- Init all ----
  function init() {
    initReveal();
    initCounters();
    initSkillBars();
    initParallax();
    initMarquee();
    initTyping();
    initTilt();
    initFAQ();
    initFilterTabs();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
