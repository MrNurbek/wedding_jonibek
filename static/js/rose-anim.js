'use strict';
/* ============================================================
   ROSE GARDEN — Parallax & Petal Animations
   ============================================================ */

/* ---------- Parallax scroll for corner roses ---------- */
(function () {
  const corners = {
    tl: document.getElementById('rose-tl'),
    tr: document.getElementById('rose-tr'),
    bl: document.getElementById('rose-bl'),
    br: document.getElementById('rose-br'),
  };

  const isMobile = window.innerWidth <= 768;
  if (isMobile) return; // skip heavy parallax on mobile for performance

  let ticking = false;

  function parallax() {
    const sy = window.scrollY;
    if (corners.tl) corners.tl.style.transform = `translateY(${sy * 0.08}px)`;
    if (corners.tr) corners.tr.style.transform = `translateY(${sy * 0.06}px)`;
    if (corners.bl) corners.bl.style.transform = `translateY(${sy * -0.05}px)`;
    if (corners.br) corners.br.style.transform = `translateY(${sy * -0.07}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });

  // expose for unlock callback
  window.parallaxTick = parallax;
})();

/* ---------- Petal rain (only on cover & hero) ---------- */
(function () {
  const rain = document.getElementById('petal-rain');
  if (!rain) return;

  const cover = document.getElementById('cover');

  // Stop petal rain when cover is gone
  const obs = new MutationObserver(() => {
    if (cover && cover.style.display === 'none') {
      rain.style.display = 'none';
      obs.disconnect();
    }
  });
  if (cover) obs.observe(cover, { attributes: true, attributeFilter: ['style'] });
})();

/* ---------- Section rose reveal via IntersectionObserver ---------- */
(function () {
  const sectionRoses = document.querySelectorAll('.section-rose');
  if (!sectionRoses.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('rose-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  sectionRoses.forEach(r => obs.observe(r));
})();
