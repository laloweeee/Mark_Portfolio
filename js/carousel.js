/* ============================================================
   FILE: js/carousel.js
   Drag + Touch Carousel with Auto-play, Dots, Buttons
   ============================================================ */

(function () {
  'use strict';

  class Carousel {
    constructor(element) {
      this.wrap       = element;
      this.track      = element.querySelector('.carousel-track');
      this.slides     = Array.from(element.querySelectorAll('.carousel-slide'));
      this.btnPrev    = element.querySelector('.carousel-btn-prev');
      this.btnNext    = element.querySelector('.carousel-btn-next');
      this.dotsWrap   = element.querySelector('.carousel-dots');
      this.autoplayInterval = parseInt(element.dataset.autoplay) || 0;
      this.loop       = element.dataset.loop !== 'false';
      this.gap        = 24; // matches CSS gap

      this.currentIndex = 0;
      this.isDragging   = false;
      this.startX       = 0;
      this.currentTranslate = 0;
      this.prevTranslate    = 0;
      this.autoplayTimer    = null;
      this.visibleCount = this._getVisibleCount();

      this._init();
    }

    _getVisibleCount() {
      const w = this.wrap.getBoundingClientRect().width;
      // Read from data attribute, default 1
      const perView = parseInt(this.wrap.dataset.perView) || 1;
      return Math.max(1, perView);
    }

    _init() {
      if (this.slides.length === 0) return;

      this._buildDots();
      this._bindEvents();
      this._update();

      if (this.autoplayInterval > 0) {
        this._startAutoplay();
      }

      // Pause on hover
      this.wrap.addEventListener('mouseenter', () => this._stopAutoplay());
      this.wrap.addEventListener('mouseleave', () => {
        if (this.autoplayInterval > 0) this._startAutoplay();
      });

      // Rebuild on resize
      window.addEventListener('resize', () => {
        this.visibleCount = this._getVisibleCount();
        this._update();
      });
    }

    _buildDots() {
      if (!this.dotsWrap) return;
      this.dotsWrap.innerHTML = '';
      const count = this.loop
        ? this.slides.length
        : Math.ceil(this.slides.length / Math.max(1, this.visibleCount));

      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => this.goTo(i));
        this.dotsWrap.appendChild(dot);
      }
    }

    _bindEvents() {
      if (this.btnPrev) {
        this.btnPrev.addEventListener('click', () => this.prev());
      }
      if (this.btnNext) {
        this.btnNext.addEventListener('click', () => this.next());
      }

      // Drag (mouse)
      this.track.addEventListener('mousedown',  (e) => this._dragStart(e.clientX));
      window.addEventListener('mousemove',      (e) => this._dragMove(e.clientX));
      window.addEventListener('mouseup',        ()  => this._dragEnd());

      // Touch
      this.track.addEventListener('touchstart', (e) => this._dragStart(e.touches[0].clientX), { passive: true });
      this.track.addEventListener('touchmove',  (e) => this._dragMove(e.touches[0].clientX),  { passive: true });
      this.track.addEventListener('touchend',   ()  => this._dragEnd());
    }

    _dragStart(x) {
      this.isDragging = true;
      this.startX = x;
      this.prevTranslate = this.currentTranslate;
      this.track.classList.add('dragging');
    }

    _dragMove(x) {
      if (!this.isDragging) return;
      const delta = x - this.startX;
      this.currentTranslate = this.prevTranslate + delta;
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    _dragEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.track.classList.remove('dragging');

      const movedBy = this.currentTranslate - this.prevTranslate;
      if (movedBy < -60) {
        this.next();
      } else if (movedBy > 60) {
        this.prev();
      } else {
        this._update();
      }
    }

    _getSlideWidth() {
      const slide = this.slides[0];
      if (!slide) return 0;
      return slide.getBoundingClientRect().width + this.gap;
    }

    _update() {
      const slideW = this._getSlideWidth();
      const offset = -this.currentIndex * slideW;
      this.currentTranslate = offset;
      this.track.style.transform = `translateX(${offset}px)`;

      // Update dots
      if (this.dotsWrap) {
        const dots = this.dotsWrap.querySelectorAll('.carousel-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === this.currentIndex));
      }

      // Update buttons
      if (this.btnPrev) this.btnPrev.disabled = !this.loop && this.currentIndex === 0;
      if (this.btnNext) this.btnNext.disabled = !this.loop && this.currentIndex >= this.slides.length - 1;
    }

    goTo(index) {
      const max = this.slides.length - 1;
      if (this.loop) {
        this.currentIndex = ((index % this.slides.length) + this.slides.length) % this.slides.length;
      } else {
        this.currentIndex = Math.max(0, Math.min(index, max));
      }
      this._update();
    }

    next() { this.goTo(this.currentIndex + 1); }
    prev() { this.goTo(this.currentIndex - 1); }

    _startAutoplay() {
      this._stopAutoplay();
      this.autoplayTimer = setInterval(() => this.next(), this.autoplayInterval);
    }

    _stopAutoplay() {
      clearInterval(this.autoplayTimer);
    }
  }

  // --- Auto-init all carousels on DOM ready ---
  function initCarousels() {
    document.querySelectorAll('.carousel-wrap').forEach((el) => {
      if (!el.dataset.carouselInit) {
        el.dataset.carouselInit = 'true';
        el._carousel = new Carousel(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

  // Expose globally so pages can re-init after dynamic content
  window.initCarousels = initCarousels;
  window.Carousel = Carousel;

})();
