const fs = require('fs');

console.log('--- INSERTING LEADING HIRING PARTNERS SLIDER ---');

// 1. CSS for Hiring Companies Slider
const hiringCss = `
/* ==========================================================================
   LEADING COMPANIES HIRING PARTNERS SLIDER
   Continuous infinite kinetic slide directly beneath Placed Students slider
   ========================================================================== */
.hiring-companies-slider-wrap {
  width: 100%;
  margin-top: 3.5rem;
  padding-top: 2.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  position: relative;
  z-index: 2;
}

.hiring-companies-slider-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.proof-slider-pill-cyan {
  border-color: rgba(6, 182, 212, 0.35) !important;
  color: #38BDF8 !important;
  background: rgba(6, 182, 212, 0.08) !important;
  box-shadow: 0 0 15px -3px rgba(6, 182, 212, 0.2) !important;
}

.dot-cyan {
  background: #38BDF8 !important;
  box-shadow: 0 0 8px #38BDF8 !important;
}

.hiring-companies-mask {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 0.75rem 0 1.25rem;
  mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
}

.hiring-companies-mask::before,
.hiring-companies-mask::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(50px, 10vw, 140px);
  z-index: 3;
  pointer-events: none;
}

.hiring-companies-mask::before,
.placed-students-section .hiring-companies-mask::before,
body[data-theme="light"] .placed-students-section .hiring-companies-mask::before {
  left: 0;
  background: linear-gradient(to right, #0A0E1A 0%, transparent 100%) !important;
}

.hiring-companies-mask::after,
.placed-students-section .hiring-companies-mask::after,
body[data-theme="light"] .placed-students-section .hiring-companies-mask::after {
  right: 0;
  background: linear-gradient(to left, #0A0E1A 0%, transparent 100%) !important;
}

.hiring-companies-track {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: max-content;
  will-change: transform;
  animation: hiringCompaniesMarquee 38s linear infinite;
  padding: 0.5rem 0;
}

.hiring-companies-track:hover {
  animation-play-state: paused !important;
}

@keyframes hiringCompaniesMarquee {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

.company-logo-card {
  flex-shrink: 0;
  width: clamp(170px, 15vw, 210px);
  height: 82px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.4rem;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
}

.company-logo-card:hover {
  transform: translateY(-4px) scale(1.04);
  background: rgba(22, 32, 54, 0.95);
  border-color: rgba(6, 182, 212, 0.45);
  box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 0 24px rgba(6, 182, 212, 0.25);
  z-index: 10;
}

.company-logo-img {
  max-width: 130px;
  max-height: 42px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: brightness(0.96) contrast(1.05);
  display: block;
}

.company-logo-card:hover .company-logo-img {
  transform: scale(1.06);
  filter: brightness(1.06) contrast(1.1);
}

@media (max-width: 640px) {
  .hiring-companies-slider-wrap {
    margin-top: 2.25rem;
    padding-top: 1.75rem;
  }
  .company-logo-card {
    width: 148px;
    height: 68px;
    padding: 0.75rem 1rem;
    border-radius: 12px;
  }
  .company-logo-img {
    max-width: 105px;
    max-height: 32px;
  }
  .hiring-companies-track {
    gap: 1rem;
  }
}
`;

function appendCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, 'utf8');
  if (!css.includes('hiring-companies-slider-wrap')) {
    css += '\n' + hiringCss;
    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`[APPENDED CSS] ${filePath}`);
  } else {
    console.log(`[ALREADY EXISTS CSS] ${filePath}`);
  }
}

appendCss('components/proof/proof.css');
if (fs.existsSync('miracle-it-career-academy/components/proof/proof.css')) {
  appendCss('miracle-it-career-academy/components/proof/proof.css');
}

// 2. HTML Markup for Hiring Companies Slider
const hiringHtml = `
          <!-- ====================================================================
           LEADING HIRING PARTNERS LOGO SLIDER
           Continuous infinite kinetic marquee of verified top tech recruiters
           ==================================================================== -->
          <div class="hiring-companies-slider-wrap" aria-label="Leading Companies Hiring Our Graduates">
            <div class="hiring-companies-slider-header">
              <span class="proof-slider-pill proof-slider-pill-cyan">
                <span class="ticker-pulse-dot dot-cyan" aria-hidden="true"></span>
                LEADING COMPANIES HIRING OUR GRADUATES
              </span>
              <p class="proof-slider-sub">
                Our graduates are hired by top global technology companies, product studios, and digital innovators
              </p>
            </div>

            <div class="hiring-companies-mask">
              <div class="hiring-companies-track">

                <!-- SET 1: 12 Official Company Logos -->
                <div class="company-logo-card" data-company="google">
                  <img src="./assets/icons/companies/google.svg" alt="Google" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="meta">
                  <img src="./assets/icons/companies/meta.svg" alt="Meta" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="nvidia">
                  <img src="./assets/icons/companies/nvidia.svg" alt="NVIDIA" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="wipro">
                  <img src="./assets/icons/companies/wipro.svg" alt="Wipro" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="infosys">
                  <img src="./assets/icons/companies/infosys.svg" alt="Infosys" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="accenture">
                  <img src="./assets/icons/companies/accenture.svg" alt="Accenture" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="capgemini">
                  <img src="./assets/icons/companies/capgemini.svg" alt="Capgemini" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="hcl">
                  <img src="./assets/icons/companies/hcl.svg" alt="HCL Technologies" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="deloitte">
                  <img src="./assets/icons/companies/deloitte.svg" alt="Deloitte" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="dot9games">
                  <img src="./assets/icons/companies/dot9games.png" alt="Dot9 Games" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="uline">
                  <img src="./assets/icons/companies/uline.svg" alt="Uline" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" data-company="tcs">
                  <img src="./assets/icons/companies/tcs.svg" alt="TCS" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <!-- SET 2: Duplicate Set for Seamless Continuous Infinite Marquee Loop -->
                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/google.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/meta.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/nvidia.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/wipro.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/infosys.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/accenture.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/capgemini.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/hcl.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/deloitte.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/dot9games.png" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/uline.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

                <div class="company-logo-card" aria-hidden="true">
                  <img src="./assets/icons/companies/tcs.svg" alt="" class="company-logo-img" loading="eager" width="130" height="42">
                </div>

              </div>
            </div>
          </div>`;

function insertHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Look for end of proof-students-slider-wrap inside placed-students
  if (html.includes('hiring-companies-slider-wrap')) {
    console.log(`[ALREADY EXISTS HTML] ${filePath}`);
    return;
  }

  // Find the closing of proof-students-slider-wrap inside placed-students-section
  const targetPattern = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;
  
  // Or match: </div>\s*</div>\s*</div>\s*</div>\s*</section>\s*<!-- 3\. Problem
  // Let's find the closing of proof-students-slider-wrap:
  // It has </div> (track) </div> (mask) </div> (slider-wrap) </div> (container) </section>
  const sliderWrapCloseRegex = /(<\/div>\s*<\/div>\s*<\/div>)(\s*<\/div>\s*<\/section>)/;

  // Let's verify precisely in placed-students
  const placedIndex = html.indexOf('id="placed-students"');
  if (placedIndex === -1) {
    console.error(`[NOT FOUND id="placed-students"] in ${filePath}`);
    return;
  }

  const problemIndex = html.indexOf('id="problem"');
  const sectionChunk = html.slice(placedIndex, problemIndex);

  // In sectionChunk, find the last </div> before </div>\s*</section>
  const lastWrapClose = sectionChunk.lastIndexOf('</div>\n          </div>\n      </div>');
  const altWrapClose = sectionChunk.lastIndexOf('</div>\r\n          </div>\r\n      </div>');

  let chosenClose = lastWrapClose !== -1 ? lastWrapClose : altWrapClose;
  if (chosenClose === -1) {
    // try looser search for </div>\s*</div>\s*</section>
    const match = sectionChunk.match(/<\/div>\s*<\/div>\s*<\/section>/);
    if (match) {
      const idx = placedIndex + match.index;
      html = html.slice(0, idx) + '\n' + hiringHtml + '\n' + html.slice(idx);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`[INSERTED HTML regex match] ${filePath}`);
      return;
    }
    console.error(`[COULD NOT LOCATE WRAP CLOSE] in ${filePath}`);
    return;
  }

  const insertPoint = placedIndex + chosenClose + (lastWrapClose !== -1 ? '</div>\n          </div>'.length : '</div>\r\n          </div>'.length);
  html = html.slice(0, insertPoint) + '\n' + hiringHtml + '\n' + html.slice(insertPoint);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[INSERTED HTML] ${filePath}`);
}

insertHtml('index.html');
if (fs.existsSync('miracle-it-career-academy/index.html')) {
  insertHtml('miracle-it-career-academy/index.html');
}

console.log('--- INSERTION COMPLETE ---');
