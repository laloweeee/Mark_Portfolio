/* ============================================================
   FILE: js/cursor.js
   Background spotlight hover effect
   ============================================================ */

(function () {
  'use strict';

  // Skip on touch-only devices
  if (window.matchMedia('(hover: none)').matches) return;

  const spotlight = document.getElementById('cursor-spotlight');
  if (!spotlight) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let spotX  = mouseX;
  let spotY  = mouseY;
  let rafId  = null;

  function lerp(a, b, n) {
    return a + (b - a) * n;
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    spotlight.style.opacity = '1';
  });

  function loop() {
    spotX = lerp(spotX, mouseX, 0.06);
    spotY = lerp(spotY, mouseY, 0.06);
    spotlight.style.left = spotX + 'px';
    spotlight.style.top  = spotY + 'px';
    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
})();
