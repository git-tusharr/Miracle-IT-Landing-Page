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

  // Contact Details
  phone: "+917880003127", // Official Contact Helpline
  phoneDisplay: "+91 78800 03127", // Formatted display text
  bhopalLandline: "0755-4907790",
  email: "info@miracleinfoserv.com",
  
  whatsapp: "+917880003127", // Official WhatsApp Number with country code
  whatsappDisplay: "+91 78800 03127",
  whatsappDefaultMessage: "Hello Miracle IT, I want to book a free career counselling visit in Bhopal.",

  // Physical Location & Directions [M.P. Nagar, Bhopal Main Campus]
  locationHub: "M.P. Nagar, Bhopal",
  address: "Plot No.80, 3rd Floor, Aakriti Complex, Zone-2, M.P.Nagar, Bhopal, M.P.",
  addressShort: "Zone-2, M.P. Nagar, Bhopal (M.P.)",
  landmark: "Near Sargam Cinema & Chetak Bridge • Aakriti Complex Zone-2",
  
  // Google Maps & Directions Link
  directionsUrl: "https://maps.google.com/?q=Plot+No.80,+Aakriti+Complex,+Zone-2,+M.P.+Nagar,+Bhopal",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14668.618683504856!2d77.4300!3d23.2330!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c4266395b0577%3A0xe54d8689ff8dbf9!2sMaharana+Pratap+Nagar%2C+Bhopal%2C+Madhya+Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",

  // Visiting & Operating Hours
  counsellingHours: "Monday to Saturday: 10:00 AM – 7:00 PM (Sunday by appointment)",
  batchTimings: "Morning, Afternoon & Weekend Batches Available",

  // All Training Centers & Regional Network
  centers: [
    {
      city: "Bhopal",
      type: "Main Campus & Head Office",
      address: "Plot No.80, 3rd Floor, Aakriti Complex, Zone-2, M.P.Nagar, Bhopal, M.P.",
      phone: "0755-4907790",
      mapUrl: "https://maps.google.com/?q=Plot+No.80,+Aakriti+Complex,+Zone-2,+M.P.+Nagar,+Bhopal"
    },
    {
      city: "Jabalpur",
      type: "Regional Center",
      address: "2nd Floor, In front of Maruti Suzuki Showroom, Jabalpur Hospital Road, Napier Town, Jabalpur, M.P.",
      phone: "0761-4920378",
      mapUrl: "https://maps.google.com/?q=Miracle+IT+Career+Academy,+Jabalpur+Hospital+Road,+Napier+Town,+Jabalpur,+Madhya+Pradesh"
    },
    {
      city: "Gwalior",
      type: "Regional Center",
      address: "A-8, 201, 2nd Floor, Opp. Aditya College, City Center, Gwalior, M.P.",
      phone: "0751-4901188",
      mapUrl: "https://maps.google.com/?q=Miracle+IT+Career+Academy,+A-8,+201,+City+Center,+Gwalior,+Madhya+Pradesh"
    },
    {
      city: "Ratlam",
      type: "Regional Center",
      address: "76, B-Plaza, First Floor, T.I.Y Road Corner, Above Raymond Showroom, Station Road, Ratlam, M.P.",
      phone: "07412-403025",
      mapUrl: "https://maps.google.com/?q=Miracle+IT+Career+Academy,+76,+B-Plaza,+Station+Road,+Ratlam,+Madhya+Pradesh"
    },
    {
      city: "Ujjain",
      type: "Regional Center",
      address: "301, 3rd Floor, Mahakaal Kanak, Malipura, Dewas Gate, Ujjain, M.P.",
      phone: "0734-4030236",
      mapUrl: "https://maps.google.com/?q=Miracle+IT+Career+Academy,+301,+Mahakaal+Kanak,+Malipura,+Dewas+Gate,+Ujjain,+Madhya+Pradesh"
    },
    {
      city: "Nagpur",
      type: "Regional Center",
      address: "301, 3rd Floor, Mahakaal Kanak, Malipura, Dewas Gate, Ujjain, M.P.",
      phone: "0734-4030236",
      mapUrl: "https://maps.google.com/?q=Miracle+IT+Career+Academy,+Nagpur"
    }
  ],

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

  // Populate Email links
  scope.querySelectorAll('[data-config-email]').forEach(el => {
    el.setAttribute('href', `mailto:${SITE_CONFIG.email}`);
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
