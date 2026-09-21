/**
 * FINAL CTA COMPONENT CONTROLLER
 */
function initFinalCta(container = document) {
  if (typeof window.initCounsellingForm === 'function') {
    window.initCounsellingForm(container);
  }
}

if (typeof window !== 'undefined') {
  window.initFinalCta = initFinalCta;
}
