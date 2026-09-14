/**
 * MIRACLE IT CAREER ACADEMY — ANALYTICS & EVENT TRACKING ABSTRACTION
 * 
 * Provides a unified, safe event bus for conversion and engagement tracking.
 * Ready for future integration with Google Analytics 4 (gtag), Meta Pixel (fbq),
 * and server-side Conversions API (CAPI).
 * 
 * Strict Rule: Never fires form_submit prematurely on page load.
 */

const Analytics = {
  /**
   * Tracks an event across configured providers or logs safely to console
   * @param {string} eventName - e.g. "page_view", "cta_click", "form_start", "form_submit"
   * @param {Object} data - Contextual data payload
   */
  trackEvent(eventName, data = {}) {
    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      ...data
    };

    // Safe Console Logger for Testing & Debugging
    console.groupCollapsed(`%c[Miracle Analytics] Event: ${eventName}`, 'color: #1D4ED8; font-weight: bold;');
    console.log('Payload:', payload);
    console.groupEnd();

    // Hook for Google Analytics 4 (if gtag is loaded)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, data);
    }

    // Hook for Meta Pixel (if fbq is loaded)
    if (typeof window.fbq === 'function') {
      if (eventName === 'form_submit') {
        window.fbq('track', 'Lead', data);
      } else if (eventName === 'cta_click') {
        window.fbq('trackCustom', 'CTAClick', data);
      } else {
        window.fbq('trackCustom', eventName, data);
      }
    }

    // Dispatch Custom Event to document for external listeners
    try {
      const customEvt = new CustomEvent('miracle_analytics', { detail: payload });
      document.dispatchEvent(customEvt);
    } catch (e) {}
  },

  /**
   * Initializes automatic tracking for CTA elements bearing [data-track-cta]
   */
  initCTATracking(scope = document) {
    scope.querySelectorAll('[data-track-cta]').forEach(cta => {
      // Avoid duplicate listener bindings
      if (cta.dataset.trackingAttached) return;
      cta.dataset.trackingAttached = 'true';

      cta.addEventListener('click', () => {
        const ctaType = cta.getAttribute('data-track-cta') || 'general_cta';
        const ctaText = (cta.innerText || cta.getAttribute('aria-label') || '').trim().substring(0, 50);
        const ctaLocation = cta.closest('section, header, footer')?.id || 'page';

        Analytics.trackEvent('cta_click', {
          cta_type: ctaType,
          cta_text: ctaText,
          section: ctaLocation
        });
      });
    });
  }
};

// Global shorthand function
function trackEvent(eventName, data = {}) {
  Analytics.trackEvent(eventName, data);
}

// Expose globally
if (typeof window !== 'undefined') {
  window.Analytics = Analytics;
  window.trackEvent = trackEvent;
}
