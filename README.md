# Miracle IT Career Academy — Career Counselling Landing Page

A conversion-focused, modular career counselling system and course exploration website built for **Miracle IT Career Academy** in Bhopal, Madhya Pradesh.

---

## 1. Tech Stack
* **HTML5** (Semantic markup, accessible heading hierarchy, ARIA roles)
* **CSS3** (Fluid clamp typography, custom properties/tokens, responsive Flexbox/Grid, zero framework overhead)
* **Vanilla JavaScript** (ES6+ modular controllers, asynchronous fetch component loader, zero build tools or bundlers)

> Strictly **zero** React, Next.js, Vue, Tailwind CSS, Bootstrap, jQuery, or heavy animation libraries.

---

## 2. How To Run Locally

### Option A — VS Code + Live Server (Recommended)
1. Extract the ZIP file onto your computer.
2. Open **VS Code**.
3. Select **File** > **Open Folder...** and choose the extracted `miracle-it-career-academy` folder.
4. In the VS Code file explorer, right-click `index.html` and select **"Open with Live Server"** (or click "Go Live" at the bottom right).
5. The website will open in your browser at `http://127.0.0.1:5500/` with all modular components loaded seamlessly.

### Option B — Instant 1-Click Launch (Windows)
1. Double-click `start.bat` inside the project folder.
2. Your default browser will immediately open to `http://localhost:3000`.

---

## 3. Project & Component Architecture

Every section of the master landing page is isolated in its own folder with its own HTML template, CSS styling, and JS controller:

```text
/
├── index.html                           # Master landing page shell (Live Server entry point)
├── README.md                            # Documentation & maintenance guide
├── server.js                            # Zero-dependency local testing server
├── start.bat                            # 1-click launcher for Windows
│
├── css/
│   └── global.css                       # Central design system, typography, resets, button styles
│
├── js/
│   ├── config.js                        # Central business config (Phone, WhatsApp, Address, Map)
│   ├── utm.js                           # UTM query capture & sessionStorage attribution persistence
│   ├── analytics.js                     # Safe event bus (trackEvent) & CTA click tracking
│   ├── lead-service.js                  # Async lead submission abstraction (demo simulation + API ready)
│   └── main.js                          # Master Live Server component loader & orchestrator
│
├── components/                          # INDEPENDENT MODULAR SECTIONS
│   ├── header/                          # Sticky Header & Navigation Drawer (header.html/css/js)
│   ├── hero/                            # Hero Section with approved copy & CTAs (hero.html/css/js)
│   ├── problem/                         # Student Career Dilemmas & Pain Points (problem.html/css/js)
│   ├── courses/                         # 6 Course Selection Cards (courses.html/css/js)
│   ├── why-miracle-it/                  # Institutional Value Pillars & Transparency (why-miracle-it.html/css/js)
│   ├── learning-experience/             # Classroom, Lab & Mentorship Showcase (learning-experience.html/css/js)
│   ├── who-can-join/                    # Background Matching: Tech, Non-tech, Switchers (who-can-join.html/css/js)
│   ├── counselling-process/             # 5-Step In-Person Counselling Timeline (counselling-process.html/css/js)
│   ├── proof/                           # Verified GitHub & Curriculum Showcase (proof.html/css/js)
│   ├── location/                        # M.P. Nagar Hub, Timing & Map (location.html/css/js)
│   ├── faq/                             # Accessible Vanilla JS Accordion (faq.html/css/js)
│   ├── counselling-form/                # High-Converting Lead Form with Validation (counselling-form.html/css/js)
│   ├── final-cta/                       # Final High-Visibility CTA Section (final-cta.html/css/js)
│   ├── footer/                          # Institutional Footer & Legal Disclaimers (footer.html/css/js)
│   └── mobile-sticky-cta/               # Mobile Thumb-Zone CTA Bar: Call | WhatsApp | Book (mobile-sticky-cta.html/css/js)
│
├── assets/
│   ├── images/                          # Clean SVG vector placeholders (Classroom, Lab, Projects, Mentorship)
│   └── icons/                           # Clean vector icons
│
├── full-stack-course-bhopal/            # Standalone Full Stack Course Page (index.html, style.css, script.js)
├── data-analytics-course-bhopal/        # Standalone Data Analytics Course Page (index.html, style.css, script.js)
├── ai-ml-course-bhopal/                 # Standalone AI/ML Course Page (index.html, style.css, script.js)
├── cybersecurity-course-bhopal/         # Standalone Cybersecurity Course Page (index.html, style.css, script.js)
├── cloud-devops-course-bhopal/          # Standalone Cloud/DevOps Course Page (index.html, style.css, script.js)
├── visit-bhopal/                        # Standalone Campus Visit & Directions Page
└── thank-you/                           # Post-Submission Confirmation Page
```

---

## 4. Central Business Configuration

To update phone numbers, WhatsApp links, or address details across the **entire website**, edit just **one** file:

📁 **`js/config.js`**

```javascript
const SITE_CONFIG = {
  phone: "+919876543210",              // Update official phone
  phoneDisplay: "+91 98765 43210",     // Update formatted display text
  whatsapp: "+919876543210",          // Update WhatsApp number
  address: "Plot No. 12, Zone-II, M.P. Nagar, Bhopal...",
  directionsUrl: "https://maps.google.com/?q=...",
  apiBaseUrl: "/api/counselling"       // Backend CRM endpoint
};
```

All headers, footers, location cards, mobile sticky bars, and success screens will update automatically!

---

## 5. Client Verification Required

The following business items are configured with clean `[CLIENT TO VERIFY]` placeholders to prevent false or misleading claims:
1. **Official Phone Number:** Replace placeholder in `js/config.js`.
2. **Official WhatsApp Number:** Replace placeholder in `js/config.js`.
3. **Exact Building Plot/Street Address:** Update in `js/config.js` (`address`, `landmark`).
4. **Official Google Maps Pin:** Update `directionsUrl` and `mapEmbedUrl` in `js/config.js`.
5. **Exact Course Fees & Batch Durations:** Marked as discussed transparently during the physical visit.
6. **Real Classroom / Lab Photography:** Simply replace files in `assets/images/` with real JPG/PNG photographs of the same name.

---

## 6. Backend / CRM Integration Hook

The lead submission layer is completely abstracted in:

📁 **`js/lead-service.js`**

When the client is ready to connect a real backend:
1. Update `apiBaseUrl` in `js/config.js` to your endpoint (e.g. `https://api.miracleit.in/counselling`).
2. `LeadService.submitCounsellingForm()` will automatically switch from local demo simulation to making a secure `POST` request with the JSON payload including form values and UTM marketing attribution parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
