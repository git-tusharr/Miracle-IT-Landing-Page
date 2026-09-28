const fs = require('fs');
const path = require('path');

// Let's create an HTML mock that tests 3 seam divider styles between Placed Students & Problem, and Location & FAQ
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Seam Divider Styles Test</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

    .test-wrapper {
      margin-bottom: 80px;
      border: 3px solid #6366F1;
    }
    .test-title {
      background: #6366F1;
      color: white;
      padding: 12px 24px;
      font-size: 18px;
      font-weight: 700;
    }

    /* Mock Bright Section (Placed Students / Hiring) */
    .bright-section {
      background: #F8FAFC;
      color: #0F172A;
      padding: 60px 40px 40px 40px;
      text-align: center;
      position: relative;
    }
    .bright-cards {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 24px;
    }
    .b-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 20px 30px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      font-weight: 600;
      color: #1E293B;
    }

    /* Mock Dark Section (Problem / Dilemmas) */
    .dark-section {
      background: #07090E;
      color: #F8FAFC;
      padding: 60px 40px;
      text-align: center;
      position: relative;
    }
    .dark-cards {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 24px;
    }
    .d-card {
      background: #0E1628;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 20px 30px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      font-weight: 600;
      color: #F8FAFC;
    }

    /* ========================================================
       STYLE 1: Smooth SVG Architectural Curve (Natural Wave)
       ======================================================== */
    .seam-svg-curve {
      display: block;
      width: 100%;
      height: 54px;
      vertical-align: bottom;
      margin-bottom: -1px; /* prevent sub-pixel hairline gaps */
    }

    /* ========================================================
       STYLE 2: Dynamic Angled Geometric Diagonal
       ======================================================== */
    .seam-angled {
      width: 100%;
      height: 48px;
      background: #F8FAFC;
      position: relative;
    }
    .seam-angled::before {
      content: '';
      position: absolute;
      inset: 0;
      background: #07090E;
      clip-path: polygon(0 100%, 100% 0, 100% 100%);
    }

    /* ========================================================
       STYLE 3: High-Tech Architectural Ribbon Divider
       (Crisp hairline, breathing room, no blur, high contrast)
       ======================================================== */
    .seam-tech-ribbon {
      background: #F8FAFC;
      padding: 30px 0 0 0;
      position: relative;
    }
    .seam-tech-line {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: #07090E;
      padding: 16px 0;
      border-top: 1px solid rgba(255, 122, 0, 0.3);
    }
    .seam-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0E1628;
      border: 1px solid rgba(255, 122, 0, 0.4);
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #FF7A00;
      text-transform: uppercase;
      box-shadow: 0 0 16px rgba(255, 122, 0, 0.18);
    }

    /* Style 4: Soft Multi-Wave S-Curve */
    .seam-s-curve {
      display: block;
      width: 100%;
      height: 60px;
      vertical-align: bottom;
      margin-bottom: -1px;
    }
  </style>
</head>
<body>

  <!-- TEST 1: Gentle Architectural Curve -->
  <div class="test-wrapper">
    <div class="test-title">STYLE 1: Gentle Architectural Curve (Crisp Vector Wave — Zero Blur, Seamless Fill)</div>
    <div class="bright-section" style="padding-bottom: 20px;">
      <h2>Bright Section (Placed Students Showcase)</h2>
      <p style="color: #64748B; margin-top: 8px;">100% Clean #F8FAFC Canvas</p>
      <div class="bright-cards">
        <div class="b-card">Student 1 Placed at Infosys</div>
        <div class="b-card">Student 2 Placed at Google</div>
        <div class="b-card">Student 3 Placed at TCS</div>
      </div>
    </div>
    <!-- Seamless SVG Curve -->
    <svg class="seam-svg-curve" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
      <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#07090E"></path>
    </svg>
    <div class="dark-section" style="padding-top: 30px;">
      <h2>Dark Section (Problem Dilemmas & Courses)</h2>
      <p style="color: #94A3B8; margin-top: 8px;">Solid #07090E Canvas with Zero Blur</p>
      <div class="dark-cards">
        <div class="d-card">Dilemma 01: Theory Only</div>
        <div class="d-card">Dilemma 02: No Practical Guidance</div>
      </div>
    </div>
  </div>

  <!-- TEST 2: Dynamic S-Curve (Soft tech slope) -->
  <div class="test-wrapper">
    <div class="test-title">STYLE 2: Modern S-Curve Transition (Stripe / Apple Style)</div>
    <div class="bright-section" style="padding-bottom: 20px;">
      <h2>Bright Section (Placed Students Showcase)</h2>
      <div class="bright-cards">
        <div class="b-card">Student 1 Placed at Infosys</div>
        <div class="b-card">Student 2 Placed at Google</div>
        <div class="b-card">Student 3 Placed at TCS</div>
      </div>
    </div>
    <!-- S-Curve SVG -->
    <svg class="seam-s-curve" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
      <path d="M0,20 C400,60 1040,0 1440,40 L1440,60 L0,60 Z" fill="#07090E"></path>
    </svg>
    <div class="dark-section" style="padding-top: 30px;">
      <h2>Dark Section (Problem Dilemmas & Courses)</h2>
      <div class="dark-cards">
        <div class="d-card">Dilemma 01: Theory Only</div>
        <div class="d-card">Dilemma 02: No Practical Guidance</div>
      </div>
    </div>
  </div>

  <!-- TEST 3: Dynamic Diagonal Slant -->
  <div class="test-wrapper">
    <div class="test-title">STYLE 3: Precision Diagonal Slant (Modern Angular Tech Edge)</div>
    <div class="bright-section" style="padding-bottom: 10px;">
      <h2>Bright Section (Placed Students Showcase)</h2>
      <div class="bright-cards">
        <div class="b-card">Student 1 Placed at Infosys</div>
        <div class="b-card">Student 2 Placed at Google</div>
        <div class="b-card">Student 3 Placed at TCS</div>
      </div>
    </div>
    <div class="seam-angled"></div>
    <div class="dark-section" style="padding-top: 30px;">
      <h2>Dark Section (Problem Dilemmas & Courses)</h2>
      <div class="dark-cards">
        <div class="d-card">Dilemma 01: Theory Only</div>
        <div class="d-card">Dilemma 02: No Practical Guidance</div>
      </div>
    </div>
  </div>

  <!-- TEST 4: Tech Hairline & Horizon Line with Precision Coordinates -->
  <div class="test-wrapper">
    <div class="test-title">STYLE 4: Horizon Hairline Seam with Tech Accent Line</div>
    <div class="bright-section" style="padding-bottom: 30px;">
      <h2>Bright Section (Placed Students Showcase)</h2>
      <div class="bright-cards">
        <div class="b-card">Student 1 Placed at Infosys</div>
        <div class="b-card">Student 2 Placed at Google</div>
        <div class="b-card">Student 3 Placed at TCS</div>
      </div>
    </div>
    <div class="seam-tech-line">
      <div class="seam-badge">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#FF7A00;"></span>
        Miracle IT Core Engineering Architecture
      </div>
    </div>
    <div class="dark-section" style="padding-top: 30px;">
      <h2>Dark Section (Problem Dilemmas & Courses)</h2>
      <div class="dark-cards">
        <div class="d-card">Dilemma 01: Theory Only</div>
        <div class="d-card">Dilemma 02: No Practical Guidance</div>
      </div>
    </div>
  </div>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'compare_seams.html'), html);
console.log('Written compare_seams.html');
