const fs = require('fs');

// 1. Add CSS to css/global.css
let globalCss = fs.readFileSync('css/global.css', 'utf8');

const seamCss = `
/* ==========================================================================
   SEAMLESS ARCHITECTURAL SECTION TRANSITIONS (ZERO BLUR, CRISP VECTOR FLOW)
   Miracle IT Dual-Theme Flow: Bright -> Dark Core -> Bright Ending
   ========================================================================== */

.section-seam-divider {
  display: block;
  width: 100%;
  line-height: 0;
  position: relative;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

.section-seam-divider svg {
  display: block;
  width: 100%;
  height: clamp(34px, 4vw, 56px);
  vertical-align: bottom;
}

/* Light to Dark Transition: Placed Students -> Problem */
.seam-bright-to-dark {
  background-color: #F8FAFC;
  margin-top: 0;
  margin-bottom: -1px;
}

/* Dark to Light Transition: Location -> FAQ */
.seam-dark-to-bright {
  background-color: #080E18;
  margin-top: 0;
  margin-bottom: -1px;
}
`;

if (!globalCss.includes('.section-seam-divider')) {
  globalCss += '\n' + seamCss;
  fs.writeFileSync('css/global.css', globalCss, 'utf8');
  console.log('Added .section-seam-divider to css/global.css');
}

// 2. Add Dividers to index.html
let html = fs.readFileSync('index.html', 'utf8');

const seam1Html = `
    <!-- Seamless Architectural Seam: Bright Placed Students -> Dark Problem -->
    <div class="section-seam-divider seam-bright-to-dark" aria-hidden="true">
      <svg viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 C380,54 1060,54 1440,0 L1440,54 L0,54 Z" fill="#0A0E1A"></path>
        <path d="M0,0 C380,54 1060,54 1440,0" stroke="rgba(255, 122, 0, 0.28)" stroke-width="1.5" fill="none"></path>
      </svg>
    </div>
`;

const seam2Html = `
    <!-- Seamless Architectural Seam: Dark Location -> Bright FAQ -->
    <div class="section-seam-divider seam-dark-to-bright" aria-hidden="true">
      <svg viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 C380,54 1060,54 1440,0 L1440,54 L0,54 Z" fill="#F8FAFC"></path>
        <path d="M0,0 C380,54 1060,54 1440,0" stroke="rgba(2, 132, 199, 0.28)" stroke-width="1.5" fill="none"></path>
      </svg>
    </div>
`;

// Insert seam1 after placed-students section
if (!html.includes('seam-bright-to-dark')) {
  const target1 = '</section>\r\n\r\n\r\n    <!-- 3. Problem / Career Confusion Section -->';
  const target1Alt = '</section>\n\n\n    <!-- 3. Problem / Career Confusion Section -->';
  const target1Alt2 = '</section>\r\n    <!-- 3. Problem / Career Confusion Section -->';

  if (html.includes(target1)) {
    html = html.replace(target1, '</section>\n' + seam1Html + '\n    <!-- 3. Problem / Career Confusion Section -->');
  } else if (html.includes(target1Alt)) {
    html = html.replace(target1Alt, '</section>\n' + seam1Html + '\n    <!-- 3. Problem / Career Confusion Section -->');
  } else {
    // regex search around placed-students
    html = html.replace(/(<\/section>\s*<!-- 3\. Problem)/, `</section>\n${seam1Html}\n<!-- 3. Problem`);
  }
  console.log('Processed seam 1');
}

// Insert seam2 before FAQ section
if (!html.includes('seam-dark-to-bright')) {
  html = html.replace(/(<!-- 11\. Frequently Asked Questions \(FAQ\) Section -->)/, `${seam2Html}\n$1`);
  console.log('Processed seam 2');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated index.html successfully!');
