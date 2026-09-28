/**
 * PROBLEM COMPONENT CONTROLLER — ULTRA CLEAN & LIGHTWEIGHT
 * Handles card interactions, analytics tracking, and mobile smooth scroll
 */

function initProblem(container = document) {
  const section = container.querySelector('#problem') || document.querySelector('#problem');
  if (!section) return;

  const cards = section.querySelectorAll('.problem-card');
  const scrollDots = section.querySelectorAll('.problem-dot');

  // Mobile horizontal scroll indicator sync (if cards grid is scrolled horizontally on small viewports)
  if (scrollDots.length && cards.length) {
    scrollDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const targetCard = cards[idx];
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          scrollDots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }
      });
    });
  }

  // Card CTA click tracking
  const ctaLinks = section.querySelectorAll('[data-track-cta]');
  ctaLinks.forEach(cta => {
    cta.addEventListener('click', () => {
      const ctaName = cta.getAttribute('data-track-cta');
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          event: 'problem_cta_click',
          cta_name: ctaName
        });
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.initProblem = initProblem;
}
