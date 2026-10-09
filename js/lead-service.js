/**
 * MIRACLE IT CAREER ACADEMY — UNIFIED LEAD SERVICE & GOOGLE SHEETS INTEGRATION
 * 
 * Target Google Sheet ID: 1jy2KDHKzhQgPWjUD90pHB5GJnV1fP8yVAhnMug7soRU
 * Google Apps Script Web App: https://script.google.com/macros/s/AKfycbwLa3GqHoqBezeVhbgcxA4onWtGOlLfvGsXv4Jq62ozjzx2aO2MlPFBvqcl2G3eHaWEOA/exec
 * 
 * Verifies that submissions are recorded by Google Sheets backend.
 * Avoids duplicate conversion events and safely redirects users to /thank-you/.
 */

(() => {
  'use strict';

  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwLa3GqHoqBezeVhbgcxA4onWtGOlLfvGsXv4Jq62ozjzx2aO2MlPFBvqcl2G3eHaWEOA/exec';
  const GOOGLE_SHEET_ID = '1jy2KDHKzhQgPWjUD90pHB5GJnV1fP8yVAhnMug7soRU';

  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'];

  function getCookie(name) {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function getAttributionData() {
    const data = {};
    try {
      const params = new URLSearchParams(window.location.search);
      ATTR_KEYS.forEach(key => {
        const urlVal = params.get(key);
        if (urlVal) {
          sessionStorage.setItem('mi_' + key, urlVal);
        }
        data[key] = sessionStorage.getItem('mi_' + key) || urlVal || '';
      });

      if (!sessionStorage.getItem('mi_landing')) {
        sessionStorage.setItem('mi_landing', window.location.href);
      }
      data.landing_url = sessionStorage.getItem('mi_landing') || window.location.href;
      data.referrer = document.referrer || 'direct';
      data.fbp = getCookie('_fbp');
      data.fbc = getCookie('_fbc') || (data.fbclid ? `fb.1.${Date.now()}.${data.fbclid}` : '');
    } catch (_) {
      data.landing_url = window.location.href;
      data.referrer = document.referrer || 'direct';
    }
    return data;
  }

  function normalizePhoneNumber(raw) {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits;
  }

  function getThankYouUrl(payload) {
    // Determine relative path to /thank-you/
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const segments = currentPath.split('/').filter(Boolean);
    let basePath = '/thank-you/';

    // Fallback relative path calculation if not at domain root
    if (window.location.protocol === 'file:') {
      const depth = Math.max(0, segments.length - 1);
      basePath = (depth > 0 ? '../'.repeat(depth) : './') + 'thank-you/';
    }

    const params = new URLSearchParams();
    if (payload.name) params.set('name', payload.name);
    if (payload.course) params.set('course', payload.course);
    if (payload.phone) params.set('phone', payload.phone);

    // Forward UTM parameters to thank you page
    ATTR_KEYS.forEach(key => {
      if (payload[key]) params.set(key, payload[key]);
    });

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  const LeadService = {
    ENDPOINT: GOOGLE_APPS_SCRIPT_URL,
    SHEET_ID: GOOGLE_SHEET_ID,

    /**
     * Submit lead payload to Google Sheets and verify success
     * @param {Object} rawData 
     * @returns {Promise<{success: boolean, payload: Object, thankYouUrl: string}>}
     */
    async submitCounsellingForm(rawData) {
      console.log('[LeadService] Processing lead submission:', rawData);

      const attribution = getAttributionData();
      const cleanPhone = normalizePhoneNumber(rawData.phone || rawData.phoneNumber || '');

      const normalized = {
        name: (rawData.name || rawData.fullName || '').trim(),
        phone: cleanPhone ? (cleanPhone.length === 10 ? `+91 ${cleanPhone}` : cleanPhone) : '',
        raw_phone: cleanPhone,
        email: (rawData.email || '').trim(),
        course: rawData.course || rawData.courseInterest || 'Career Counselling & Lab Demo',
        status: rawData.status || rawData.educationBackground || rawData.currentEducation || 'Interested Student',
        batch: rawData.batch || rawData.preferredTiming || rawData.preferredVisitTime || rawData.preferredVisitDay || 'Flexible',
        submitted_at: new Date().toISOString(),
        sheet_id: GOOGLE_SHEET_ID,
        city: rawData.city || 'Bhopal',
        page_source: rawData.pageSource || rawData.page_source || window.location.pathname,
        ...attribution
      };

      // Perform verified Google Apps Script submission
      let verified = false;
      let lastError = null;

      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(normalized)
        });

        if (!response.ok) {
          throw new Error(`Google Apps Script HTTP ${response.status}`);
        }

        const responseText = (await response.text()).trim();
        if (responseText === 'ok' || responseText.toLowerCase().includes('success')) {
          verified = true;
        } else {
          throw new Error(`Backend verification failed. Received response: "${responseText}"`);
        }
      } catch (err) {
        lastError = err;
        console.error('[LeadService] Submission error:', err);
      }

      if (!verified) {
        throw new Error(lastError?.message || 'Submission could not be verified by Google Sheets backend.');
      }

      // Track Meta Pixel Lead event ONLY upon verified confirmation
      if (typeof window.fbq === 'function') {
        try {
          window.fbq('track', 'Lead', {
            content_name: normalized.course,
            content_category: normalized.status,
            currency: 'INR',
            value: 0
          });
        } catch (pixelErr) {
          console.warn('[LeadService] Meta Pixel track warning:', pixelErr);
        }
      }

      // Track Custom Analytics event
      if (typeof window.trackEvent === 'function') {
        try {
          window.trackEvent('lead_submitted', {
            course: normalized.course,
            status: normalized.status
          });
        } catch (_) {}
      }

      // Cache submission locally for thank-you personalization
      try {
        sessionStorage.setItem('mi_last_lead', JSON.stringify(normalized));
      } catch (_) {}

      const thankYouUrl = getThankYouUrl(normalized);

      return {
        success: true,
        payload: normalized,
        thankYouUrl
      };
    },

    /**
     * Helper to navigate to the Thank-You page
     */
    redirectToThankYou(payload, delay = 200) {
      const url = getThankYouUrl(payload);
      setTimeout(() => {
        window.location.href = url;
      }, delay);
    }
  };

  // Global exposure
  window.LeadService = LeadService;
  window.submitCounsellingForm = (data) => LeadService.submitCounsellingForm(data);
})();
