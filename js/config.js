/**
 * MIRACLE IT CAREER ACADEMY — CENTRAL CONFIGURATION
 * 
 * Update this single file to change academy business details across
 * all pages, components, headers, footers, forms, and CTA buttons.
 * 
 * Note: Unverified details have clear placeholders for the client to supply.
 */

const SITE_CONFIG = {
  // Business Identity
  academyName: "Miracle IT Career Academy",
  tagline: "Career-Focused IT Learning & Practical Guidance",
  city: "Bhopal",
  state: "Madhya Pradesh",

  // Contact Details [CLIENT TO VERIFY]
  // Update these when official numbers are assigned:
  phone: "+919876543210", // [CLIENT TO VERIFY: Official Contact Number]
  phoneDisplay: "+91 98765 43210", // Formatted display text
  phoneDisplayPlaceholder: "[CLIENT TO VERIFY: Phone]",
  
  whatsapp: "+919876543210", // [CLIENT TO VERIFY: Official WhatsApp Number with country code]
  whatsappDisplay: "+91 98765 43210",
  whatsappDefaultMessage: "Hello Miracle IT, I want to book a free career counselling visit in Bhopal.",

  // Physical Location & Directions [M.P. Nagar, Bhopal]
  locationHub: "M.P. Nagar, Bhopal",
  address: "Plot No. [CLIENT TO VERIFY: Plot/Building], Zone-II, M.P. Nagar, Bhopal, Madhya Pradesh 462011",
  addressShort: "Zone-II, M.P. Nagar, Bhopal (M.P.)",
  landmark: "Near Sargam Cinema / Chetak Bridge [CLIENT TO VERIFY]",
  
  // Google Maps & Directions Link
  directionsUrl: "https://maps.google.com/?q=M.P.+Nagar,+Bhopal,+Madhya+Pradesh",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14668.618683504856!2d77.4300!3d23.2330!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c4266395b0577%3A0xe54d8689ff8dbf9!2sMaharana+Pratap+Nagar%2C+Bhopal%2C+Madhya+Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",

  // Visiting & Operating Hours
  counsellingHours: "Monday to Saturday: 10:00 AM – 7:00 PM (Sunday by appointment) [CLIENT TO VERIFY]",
  batchTimings: "Morning, Afternoon & Weekend Batches Available",

  // API Integration Endpoint for Future CRM / Backend
  apiBaseUrl: "/api/counselling", // Hook for future backend POST /api/counselling

  // URLs & Relative Paths
  urls: {
    home: "/",
    counsellingLanding: "/career-counselling-bhopal/",
    visitPage: "/visit-bhopal/",
    thankYou: "/thank-you/",
    courses: {
      fullStack: "/full-stack-course-bhopal/",
      dataAnalytics: "/data-analytics-course-bhopal/",
      aiMl: "/ai-ml-course-bhopal/",
      cybersecurity: "/cybersecurity-course-bhopal/",
      cloudDevops: "/cloud-devops-course-bhopal/"
    }
  }
};

/**
 * Automatically applies configuration values to any DOM elements
 * carrying data-config-* attributes.
 * 
 * Usage:
 *  - <span data-config-text="phoneDisplay"></span>
 *  - <a data-config-href="phone">Call Us</a> (automatically adds tel:)
 *  - <a data-config-href="whatsapp">WhatsApp</a> (automatically builds WhatsApp link)
 *  - <a data-config-href="directionsUrl">Get Directions</a>
 *  - <span data-config-text="address"></span>
 */
function applySiteConfig(scope = document) {
  // Populate text elements
  scope.querySelectorAll('[data-config-text]').forEach(el => {
    const key = el.getAttribute('data-config-text');
    if (SITE_CONFIG[key] !== undefined) {
      el.textContent = SITE_CONFIG[key];
    }
  });

  // Populate phone call links
  scope.querySelectorAll('[data-config-phone]').forEach(el => {
    const cleanNumber = SITE_CONFIG.phone.replace(/[^0-9+]/g, '');
    el.setAttribute('href', `tel:${cleanNumber}`);
  });

  // Populate WhatsApp links
  scope.querySelectorAll('[data-config-whatsapp]').forEach(el => {
    const cleanNumber = SITE_CONFIG.whatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(SITE_CONFIG.whatsappDefaultMessage);
    el.setAttribute('href', `https://wa.me/${cleanNumber}?text=${msg}`);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  // Populate Directions links
  scope.querySelectorAll('[data-config-directions]').forEach(el => {
    el.setAttribute('href', SITE_CONFIG.directionsUrl);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  // Populate general hrefs
  scope.querySelectorAll('[data-config-href]').forEach(el => {
    const key = el.getAttribute('data-config-href');
    if (SITE_CONFIG[key]) {
      el.setAttribute('href', SITE_CONFIG[key]);
    }
  });
}

// Expose globally
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
  window.applySiteConfig = applySiteConfig;
}
