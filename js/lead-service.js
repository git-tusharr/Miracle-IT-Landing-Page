/**
 * MIRACLE IT CAREER ACADEMY — LEAD SERVICE ABSTRACTION
 * 
 * Handles counselling booking lead submissions.
 * Designed for future connection to CRM, Google Sheets, or REST API.
 * In demo mode, simulates a realistic async network request and returns
 * a structured success response.
 */

const LeadService = {
  /**
   * Submits counselling lead data
   * @param {Object} leadData - Cleaned lead payload including UTM attribution
   * @returns {Promise<Object>} Response object indicating success or error
   */
  async submitCounsellingForm(leadData) {
    // Check if a real backend API URL is configured
    const apiUrl = window.SITE_CONFIG?.apiBaseUrl;

    console.log('[LeadService] Received lead submission request:', leadData);

    // If future backend is active and not default placeholder:
    if (apiUrl && apiUrl !== '/api/counselling') {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(leadData)
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          leadId: data.leadId || `LEAD-${Date.now()}`,
          message: 'Your career counselling visit request has been received.'
        };
      } catch (networkError) {
        console.error('[LeadService] Backend API request failed:', networkError);
        throw new Error('Unable to connect to the booking server. Please call or message on WhatsApp directly.');
      }
    }

    // Demo Mode Simulation:
    // Simulates 600ms network roundtrip with guaranteed failure-safe demo response
    await new Promise(resolve => setTimeout(resolve, 600));

    // Storing lead in localStorage for local demo inspection
    try {
      const existingLeads = JSON.parse(localStorage.getItem('miracle_demo_leads') || '[]');
      existingLeads.unshift({
        id: `DEMO-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        ...leadData
      });
      localStorage.setItem('miracle_demo_leads', JSON.stringify(existingLeads.slice(0, 20)));
    } catch (storageErr) {
      console.warn('[LeadService] Could not store local demo lead:', storageErr);
    }

    return {
      success: true,
      leadId: `DEMO-${Date.now()}`,
      message: 'Your career counselling visit request has been received.',
      demoMode: true
    };
  }
};

// Global shorthand
async function submitCounsellingForm(formData) {
  return LeadService.submitCounsellingForm(formData);
}

// Expose globally
if (typeof window !== 'undefined') {
  window.LeadService = LeadService;
  window.submitCounsellingForm = submitCounsellingForm;
}
