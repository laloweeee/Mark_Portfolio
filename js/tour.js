/* ============================================================
   FILE: js/tour.js
   First-Visit Tour Guide — saved to localStorage so it only
   runs once. Shows spotlight + tooltip stepping through
   key page elements.
   ============================================================ */

// User guide (first-visit tour) disabled
// (function () {
//   'use strict';
//   ...existing code...
// })();
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Welcome tour');

    overlay.innerHTML = `
      <div id="tour-spotlight"></div>
      <div id="tour-tooltip" role="document">
        <div class="tour-arrow" id="tour-arrow"></div>
        <div class="tour-step-label" id="tour-step-label"></div>
        <div class="tour-title"     id="tour-title"></div>
        <div class="tour-text"      id="tour-text"></div>
        <div class="tour-footer">
          <span class="tour-progress" id="tour-progress"></span>
          <div class="tour-btns">
            <button class="tour-btn tour-btn-skip" id="tour-btn-skip">Skip tour</button>
            <button class="tour-btn tour-btn-next" id="tour-btn-next">Next →</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function Tour(steps) {
    this.steps   = steps;
    this.current = 0;
    this.overlay  = null;
    this.spotlight = null;
    this.tooltip   = null;
    this.arrow     = null;
  }

  Tour.prototype.init = function () {
    this.overlay   = buildTourDOM();
    this.spotlight = document.getElementById('tour-spotlight');
    this.tooltip   = document.getElementById('tour-tooltip');
    this.arrow     = document.getElementById('tour-arrow');

    document.getElementById('tour-btn-next').addEventListener('click', () => this.advance());
    document.getElementById('tour-btn-skip').addEventListener('click', () => this.end());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape')  this.end();
      if (e.key === 'ArrowRight' || e.key === 'Enter') this.advance();
    });

    // Prevent scroll while tour open
    document.body.style.overflow = 'hidden';

    this.showStep(0);
  };

  Tour.prototype.showStep = function (index) {
    const step = this.steps[index];
    if (!step) { this.end(); return; }

    // Update text
    document.getElementById('tour-step-label').textContent = `Step ${index + 1} of ${this.steps.length}`;
    document.getElementById('tour-title').textContent    = step.title;
    document.getElementById('tour-text').textContent     = step.text;
    document.getElementById('tour-progress').textContent = `${index + 1} / ${this.steps.length}`;
    document.getElementById('tour-btn-next').textContent =
      index === this.steps.length - 1 ? 'Finish ✓' : 'Next →';

    if (step.placement === 'center' || !step.target) {
      this._positionCenter();
    } else {
      const el = document.querySelector(step.target);
      if (el) {
        this._positionAroundElement(el, step.placement);
      } else {
        this._positionCenter();
      }
    }
  };

  Tour.prototype._positionCenter = function () {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // No spotlight for center
    this.spotlight.style.cssText = `
      top: 0; left: 0; width: 0; height: 0;
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.82);
      border-radius: 0;
    `;

    this.arrow.className = 'tour-arrow';
    this.arrow.style.display = 'none';

    const tw = 300;
    const th = 200; // approx
    this.tooltip.style.cssText = `
      top: ${vh / 2 - 120}px;
      left: ${vw / 2 - tw / 2}px;
      opacity: 1;
      transform: translateY(0);
    `;
  };

  Tour.prototype._positionAroundElement = function (el, placement) {
    const rect = el.getBoundingClientRect();
    const padding = 10;

    // Spotlight
    this.spotlight.style.cssText = `
      top:    ${rect.top    - padding}px;
      left:   ${rect.left   - padding}px;
      width:  ${rect.width  + padding * 2}px;
      height: ${rect.height + padding * 2}px;
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.78);
      border-radius: 8px;
    `;

    const tooltipW = 280;
    const tooltipH = 190; // approx
    const margin   = 16;
    let top, left;

    // Arrow
    this.arrow.style.display = 'block';

    if (placement === 'bottom') {
      top  = rect.bottom + padding + margin;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      this.arrow.className = 'tour-arrow arrow-top';
    } else if (placement === 'top') {
      top  = rect.top - padding - margin - tooltipH;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      this.arrow.className = 'tour-arrow arrow-bottom';
    } else if (placement === 'right') {
      top  = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + padding + margin;
      this.arrow.className = 'tour-arrow arrow-left';
    } else { // left
      top  = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - padding - margin - tooltipW;
      this.arrow.className = 'tour-arrow arrow-right';
    }

    // Clamp within viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(16, Math.min(left, vw - tooltipW - 16));
    top  = Math.max(16, Math.min(top,  vh - tooltipH - 16));

    this.tooltip.style.cssText = `
      top:  ${top}px;
      left: ${left}px;
      opacity: 1;
      transform: translateY(0);
    `;

    // Scroll element into view
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  Tour.prototype.advance = function () {
    this.current++;
    if (this.current >= this.steps.length) {
      this.end();
    } else {
      this.showStep(this.current);
    }
  };

  Tour.prototype.end = function () {
    markTourDone();
    document.body.style.overflow = '';
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.transition = 'opacity 0.4s';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
      }, 450);
    }
  };

  // ---- Auto-init on DOMContentLoaded ----
  function init() {
    if (!shouldShowTour()) return;

    // Small delay so page animations settle first
    setTimeout(function () {
      const steps = window.TOUR_STEPS || DEFAULT_STEPS;
      const tour  = new Tour(steps);
      tour.init();
    }, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual trigger (e.g. a "Take tour again" button)
  window.startTour = function (customSteps) {
    localStorage.removeItem(STORAGE_KEY);
    const steps = customSteps || window.TOUR_STEPS || DEFAULT_STEPS;
    const tour  = new Tour(steps);
    tour.init();
  };

})();
