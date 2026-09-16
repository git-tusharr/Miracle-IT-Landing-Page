/**
 * PROOF COMPONENT CONTROLLER — KINETIC LOGO MARQUEE
 * Features:
 * - Touch start / end pause support for mobile users
 * - Smooth desktop hover pause sync
 */
function initProof(container = document) {
  const section = container.querySelector('.proof-section');
  if (!section) return;

  if (section.dataset.proofInitialized === 'true') return;
  section.dataset.proofInitialized = 'true';

  const tracks = section.querySelectorAll('.marquee-track');
  tracks.forEach(track => {
    // Mobile touch pause / resume
    track.addEventListener('touchstart', () => {
      track.style.animationPlayState = 'paused';
    }, { passive: true });

    track.addEventListener('touchend', () => {
      track.style.animationPlayState = 'running';
    }, { passive: true });

    track.addEventListener('touchcancel', () => {
      track.style.animationPlayState = 'running';
    }, { passive: true });
  });
}

if (typeof window !== 'undefined') {
  window.initProof = initProof;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initProof());
  } else {
    initProof();
  }
}
