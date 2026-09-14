/**
 * MIRACLE IT CAREER ACADEMY — UTM TRACKING & ATTRIBUTION
 * 
 * Captures marketing campaign parameters (utm_source, utm_medium, utm_campaign,
 * utm_term, utm_content) from URL query strings and persists them in sessionStorage.
 * Automatically injects them into hidden form fields for CRM & lead tracking.
 */

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

function captureUTMs() {
  if (typeof window === 'undefined') return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const capturedData = {};
    let hasNewParams = false;

    UTM_PARAMS.forEach(param => {
      const val = urlParams.get(param);
      if (val) {
        capturedData[param] = val;
        sessionStorage.setItem(`miracle_${param}`, val);
        hasNewParams = true;
      }
    });

    // Record landing timestamp & referrer if not yet set
    if (!sessionStorage.getItem('miracle_first_touch_time')) {
      sessionStorage.setItem('miracle_first_touch_time', new Date().toISOString());
      sessionStorage.setItem('miracle_referrer', document.referrer || 'direct');
      sessionStorage.setItem('miracle_landing_url', window.location.href);
    }
  } catch (err) {
    console.warn('UTM tracking storage unavailable:', err);
  }
}

/**
 * Retrieves all stored attribution data
 * @returns {Object} Object with captured UTM and attribution parameters
 */
function getStoredAttribution() {
  const attribution = {};
  try {
    UTM_PARAMS.forEach(param => {
      attribution[param] = sessionStorage.getItem(`miracle_${param}`) || '';
    });
    attribution.referrer = sessionStorage.getItem('miracle_referrer') || '';
    attribution.firstTouchTime = sessionStorage.getItem('miracle_first_touch_time') || '';
    attribution.landingUrl = sessionStorage.getItem('miracle_landing_url') || '';
  } catch (err) {
    console.warn('Error reading stored attribution:', err);
  }
  return attribution;
}

/**
 * Injects stored attribution values into hidden form inputs
 * @param {HTMLFormElement} formElement 
 */
function populateFormUTMs(formElement) {
  if (!formElement) return;
  const attribution = getStoredAttribution();

  Object.keys(attribution).forEach(key => {
    let input = formElement.querySelector(`input[name="${key}"]`);
    if (!input && attribution[key]) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      formElement.appendChild(input);
    }
    if (input) {
      input.value = attribution[key];
    }
  });
}

// Auto-run on script load
captureUTMs();

// Expose globally
if (typeof window !== 'undefined') {
  window.captureUTMs = captureUTMs;
  window.getStoredAttribution = getStoredAttribution;
  window.populateFormUTMs = populateFormUTMs;
}
