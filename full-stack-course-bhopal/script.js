document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.applySiteConfig === 'function') {
    window.applySiteConfig(document);
  }
  if (typeof window.Analytics?.initCTATracking === 'function') {
    window.Analytics.initCTATracking(document);
  }
  if (typeof window.trackEvent === 'function') {
    window.trackEvent('view_course', { course: 'Full Stack Web Development' });
  }
});
