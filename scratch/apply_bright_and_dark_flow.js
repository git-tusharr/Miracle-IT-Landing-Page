const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const { from, to } of replacements) {
    if (typeof from === 'string') {
      if (!content.includes(from)) {
        console.warn(`Warning: Could not find exact string in ${filePath}:`, from.slice(0, 50));
      } else {
        content = content.replace(from, to);
      }
    } else if (from instanceof RegExp) {
      if (!from.test(content)) {
        console.warn(`Warning: Regex did not match in ${filePath}:`, from);
      } else {
        content = content.replace(from, to);
      }
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated ${filePath}`);
  } else {
    console.log(`No changes made to ${filePath}`);
  }
}

// =========================================================================
// 1. UPDATE components/proof/proof.css
// =========================================================================
const proofCssPath = path.resolve(__dirname, '../components/proof/proof.css');
let proofCss = fs.readFileSync(proofCssPath, 'utf8');

// Replace placed-students-section styling in proof.css
proofCss = proofCss.replace(
  /\.placed-students-section\s*\{[\s\S]*?z-index:\s*5;\s*\}/,
  `.placed-students-section {
  --color-bg: #F8FAFC !important;
  --color-bg-alt: #F8FAFC !important;
  background: #F8FAFC !important;
  background-color: #F8FAFC !important;
  color: #0F172A !important;
  padding: 2.25rem 0 3.25rem 0;
  border-bottom: none !important;
  border-top: none !important;
  position: relative;
  overflow: hidden;
  z-index: 5;
}

/* Smooth gradient seam transitioning into dark problem dilemma section */
.placed-students-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, transparent 0%, #07090E 100%);
  pointer-events: none;
  z-index: 4;
}`
);

proofCss = proofCss.replace(
  /color:\s*#FF9433;\s*text-transform:\s*uppercase;\s*margin-bottom:\s*0\.4rem;/,
  `color: #C2410C; text-transform: uppercase; margin-bottom: 0.4rem;`
);

proofCss = proofCss.replace(
  /background:\s*rgba\(255,\s*122,\s*0,\s*0\.1\);/g,
  `background: rgba(255, 122, 0, 0.08);`
);

proofCss = proofCss.replace(
  /color:\s*var\(--color-text-dim,\s*#64748B\);/g,
  `color: #64748B;`
);

// Masks for placed students
proofCss = proofCss.replace(
  /background:\s*linear-gradient\(to right,\s*#0A0E1A 0%,\s*transparent 100%\)\s*!important;/g,
  `background: linear-gradient(to right, #F8FAFC 0%, transparent 100%) !important;`
);

proofCss = proofCss.replace(
  /background:\s*linear-gradient\(to left,\s*#0A0E1A 0%,\s*transparent 100%\)\s*!important;/g,
  `background: linear-gradient(to left, #F8FAFC 0%, transparent 100%) !important;`
);

// Student cards in proof.css
proofCss = proofCss.replace(
  /background:\s*rgba\(15,\s*23,\s*42,\s*0\.96\);/,
  `background: #FFFFFF;`
);

proofCss = proofCss.replace(
  /box-shadow:\s*0 12px 35px -8px rgba\(0,\s*0,\s*0,\s*0\.75\),\s*0 0 20px rgba\(255,\s*122,\s*0,\s*0\.08\);/,
  `box-shadow: 0 10px 30px -6px rgba(0, 0, 0, 0.08), 0 0 16px rgba(255, 122, 0, 0.08);`
);

proofCss = proofCss.replace(
  /\.proof-student-name\s*\{[\s\S]*?color:\s*#F8FAFC;/,
  `.proof-student-name {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #0F172A;`
);

proofCss = proofCss.replace(
  /\.proof-student-company-pill\s*\{[\s\S]*?border-radius:\s*var\(--radius-full\);[\s\S]*?width:\s*fit-content;\s*\}/,
  `.proof-student-company-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  width: fit-content;
}`
);

// Company logo cards in proof.css
proofCss = proofCss.replace(
  /\.company-logo-card\s*\{[\s\S]*?overflow:\s*hidden;\s*\}/,
  `.company-logo-card {
  flex-shrink: 0;
  width: clamp(170px, 15vw, 210px);
  height: 82px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-lg, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.4rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
}`
);

proofCss = proofCss.replace(
  /\.company-logo-card:hover\s*\{[\s\S]*?z-index:\s*10;\s*\}/,
  `.company-logo-card:hover {
  transform: translateY(-4px) scale(1.04);
  background: #FFFFFF;
  border-color: rgba(6, 182, 212, 0.45);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 0 20px rgba(6, 182, 212, 0.2);
  z-index: 10;
}`
);

fs.writeFileSync(proofCssPath, proofCss, 'utf8');
console.log('Updated proof.css successfully');

// =========================================================================
// 2. UPDATE components/faq/faq.css (BRIGHT THEME)
// =========================================================================
const faqCssPath = path.resolve(__dirname, '../components/faq/faq.css');
let faqCss = fs.readFileSync(faqCssPath, 'utf8');

faqCss = faqCss.replace(
  /\.faq-section\s*\{[\s\S]*?border-top:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.04\);\s*\}/,
  `.faq-section {
  background-color: #F8FAFC !important;
  position: relative;
  overflow: hidden;
  padding: clamp(4.5rem, 8vw, 7rem) 0;
  border-top: 1px solid #E2E8F0 !important;
}`
);

faqCss = faqCss.replace(
  /\.faq-editorial-title\s*\{[\s\S]*?margin:\s*0 0 1\.25rem 0;\s*\}/,
  `.faq-editorial-title {
  font-family: var(--font-heading, 'Sora', sans-serif);
  font-size: clamp(2.1rem, 3.6vw, 3rem);
  font-weight: 800;
  color: #0F172A !important;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 1.25rem 0;
}`
);

faqCss = faqCss.replace(
  /\.faq-editorial-sub\s*\{[\s\S]*?max-width:\s*420px;\s*\}/,
  `.faq-editorial-sub {
  font-size: clamp(0.95rem, 1.4vw, 1.05rem);
  line-height: 1.65;
  color: #475569 !important;
  margin: 0 0 2rem 0;
  max-width: 420px;
}`
);

faqCss = faqCss.replace(
  /\.faq-editorial-help\s*\{[\s\S]*?max-width:\s*420px;\s*\}/,
  `.faq-editorial-help {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E2E8F0 !important;
  width: 100%;
  max-width: 420px;
}`
);

faqCss = faqCss.replace(
  /\.faq-counselling-btn\s*\{[\s\S]*?transition:\s*all 0\.25s cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\);\s*\}/,
  `.faq-counselling-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: fit-content;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0F172A !important;
  background: #FFFFFF !important;
  border: 1px solid #CBD5E1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 0.55rem 1.15rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}`
);

faqCss = faqCss.replace(
  /\.faq-item\s*\{[\s\S]*?transition:\s*border-color 0\.25s ease;\s*\}/,
  `.faq-item {
  border-bottom: 1px solid #E2E8F0 !important;
  background: transparent !important;
  box-shadow: none !important;
  transition: border-color 0.25s ease;
}`
);

faqCss = faqCss.replace(
  /\.faq-item:first-child\s*\{[\s\S]*?\}/,
  `.faq-item:first-child {
  border-top: 1px solid #E2E8F0 !important;
}`
);

faqCss = faqCss.replace(
  /\.faq-item\.is-open\s*\{[\s\S]*?\}/,
  `.faq-item.is-open {
  border-bottom-color: rgba(255, 122, 0, 0.45) !important;
}`
);

faqCss = faqCss.replace(
  /\.faq-question-text\s*\{[\s\S]*?flex:\s*1;\s*\}/,
  `.faq-question-text {
  font-family: var(--font-heading, 'Sora', sans-serif);
  font-size: clamp(1.05rem, 1.4vw, 1.18rem);
  font-weight: 600;
  color: #1E293B !important;
  line-height: 1.45;
  transition: color 0.25s ease;
  flex: 1;
}`
);

faqCss = faqCss.replace(
  /\.faq-question-btn:hover\s*\.faq-question-text\s*\{[\s\S]*?\}/,
  `.faq-question-btn:hover .faq-question-text {
  color: #FF6000 !important;
}`
);

faqCss = faqCss.replace(
  /\.faq-item\.is-open\s*\.faq-question-text\s*\{[\s\S]*?\}/,
  `.faq-item.is-open .faq-question-text {
  color: #0F172A !important;
  font-weight: 700;
}`
);

faqCss = faqCss.replace(
  /\.faq-toggle-box\s*\{[\s\S]*?transition:\s*all 0\.25s cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\);\s*\}/,
  `.faq-toggle-box {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 8px;
  border: 1px solid #CBD5E1 !important;
  background: #FFFFFF !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}`
);

faqCss = faqCss.replace(
  /\.faq-question-btn:hover\s*\.faq-toggle-box\s*\{[\s\S]*?\}/,
  `.faq-question-btn:hover .faq-toggle-box {
  border-color: #FF7A00 !important;
  background: rgba(255, 122, 0, 0.08) !important;
}`
);

faqCss = faqCss.replace(
  /\.faq-item\.is-open\s*\.faq-toggle-box\s*\{[\s\S]*?\}/,
  `.faq-item.is-open .faq-toggle-box {
  border-color: #FF7A00 !important;
  background: rgba(255, 122, 0, 0.12) !important;
  box-shadow: 0 0 12px rgba(255, 122, 0, 0.2) !important;
}`
);

faqCss = faqCss.replace(
  /background-color:\s*#94A3B8;/,
  `background-color: #64748B;`
);

faqCss = faqCss.replace(
  /\.faq-answer-text\s*\{[\s\S]*?max-width:\s*680px;\s*\}/,
  `.faq-answer-text {
  padding-bottom: 1.5rem;
  padding-right: 2rem;
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-size: 0.96rem;
  line-height: 1.7;
  color: #475569 !important;
  margin: 0;
  max-width: 680px;
}`
);

fs.writeFileSync(faqCssPath, faqCss, 'utf8');
console.log('Updated faq.css successfully');

// =========================================================================
// 3. UPDATE components/final-cta/final-cta.css (BRIGHT THEME)
// =========================================================================
const ctaCssPath = path.resolve(__dirname, '../components/final-cta/final-cta.css');
let ctaCss = fs.readFileSync(ctaCssPath, 'utf8');

ctaCss = ctaCss.replace(
  /#final-cta\.final-cta-section,\s*\.final-cta-section\s*\{[\s\S]*?text-align:\s*center;\s*\}/,
  `#final-cta.final-cta-section,
.final-cta-section {
  background-color: #FFFFFF !important;
  background: radial-gradient(circle at 50% 25%, rgba(255, 122, 0, 0.08) 0%, transparent 65%),
              linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%) !important;
  color: #0F172A !important;
  border-top: 1px solid #E2E8F0 !important;
  padding: clamp(5rem, 9vw, 8rem) 0;
  position: relative;
  overflow: hidden;
  text-align: center;
}`
);

ctaCss = ctaCss.replace(
  /\.final-cta-title\s*\{[\s\S]*?font-weight:\s*900;\s*\}/,
  `.final-cta-title {
  font-size: clamp(2.2rem, 4.4vw, 3.4rem);
  color: #0F172A !important;
  margin-bottom: 0.85rem;
  line-height: 1.15;
  letter-spacing: -0.035em;
  font-weight: 900;
}`
);

ctaCss = ctaCss.replace(
  /\.final-cta-note\s*\{[\s\S]*?max-width:\s*640px;\s*\}/,
  `.final-cta-note {
  font-size: clamp(0.92rem, 1.4vw, 1.02rem);
  color: #475569 !important;
  line-height: 1.65;
  margin: 0 auto 2.25rem;
  max-width: 640px;
}`
);

ctaCss = ctaCss.replace(
  /\.final-shortcuts-bar\s*\{[\s\S]*?gap:\s*0\.75rem;\s*\}/,
  `.final-shortcuts-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid #E2E8F0;
}`
);

ctaCss = ctaCss.replace(
  /\.shortcut-link\s*\{[\s\S]*?transition:\s*transform 0\.25s cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\),\s*border-color 0\.25s ease,\s*box-shadow 0\.25s ease;\s*\}/,
  `.shortcut-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 1.15rem;
  background: #FFFFFF !important;
  border: 1px solid #CBD5E1 !important;
  border-radius: var(--radius-full);
  color: #1E293B !important;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
}`
);

ctaCss = ctaCss.replace(
  /\.shortcut-link:hover\s*\{[\s\S]*?border-color:\s*rgba\(255,\s*122,\s*0,\s*0\.45\);[\s\S]*?\}/,
  `.shortcut-link:hover {
  transform: translateY(-2px);
  background: #FFFFFF !important;
  border-color: #FF7A00 !important;
  color: #FF6000 !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08) !important;
}`
);

fs.writeFileSync(ctaCssPath, ctaCss, 'utf8');
console.log('Updated final-cta.css successfully');

// =========================================================================
// 4. UPDATE components/footer/footer.css (BRIGHT THEME)
// =========================================================================
const footerCssPath = path.resolve(__dirname, '../components/footer/footer.css');
let footerCss = fs.readFileSync(footerCssPath, 'utf8');

footerCss = footerCss.replace(
  /\.site-footer\s*\{[\s\S]*?overflow:\s*hidden;\s*\}/,
  `.site-footer {
  background-color: #F8FAFC !important;
  color: #475569 !important;
  padding-top: 4.5rem;
  padding-bottom: 2.5rem;
  border-top: 1px solid #E2E8F0 !important;
  position: relative;
  overflow: hidden;
}`
);

footerCss = footerCss.replace(
  /\.footer-about\s*\{[\s\S]*?margin-bottom:\s*1rem;\s*\}/,
  `.footer-about {
  font-size: 0.88rem;
  line-height: 1.6;
  color: #475569 !important;
  margin-bottom: 1rem;
}`
);

footerCss = footerCss.replace(
  /\.footer-location-brief\s*\{[\s\S]*?margin-bottom:\s*1\.25rem;\s*\}/,
  `.footer-location-brief {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #334155 !important;
  margin-bottom: 1.25rem;
}`
);

footerCss = footerCss.replace(
  /\.footer-heading\s*\{[\s\S]*?margin-bottom:\s*1\.15rem;\s*\}/,
  `.footer-heading {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0F172A !important;
  letter-spacing: -0.01em;
  margin-bottom: 1.15rem;
}`
);

footerCss = footerCss.replace(
  /\.footer-nav a\s*\{[\s\S]*?transition:\s*color 0\.2s ease,\s*transform 0\.2s ease;\s*\}/,
  `.footer-nav a {
  display: inline-block;
  font-size: 0.84rem;
  color: #475569 !important;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
}`
);

footerCss = footerCss.replace(
  /\.footer-social-btn\s*\{[\s\S]*?text-decoration:\s*none;\s*\}/,
  `.footer-social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF !important;
  border: 1px solid #CBD5E1 !important;
  color: #475569 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
  text-decoration: none;
}`
);

footerCss = footerCss.replace(
  /\.footer-contact-list strong\s*\{[\s\S]*?color:\s*#E2E8F0;\s*\}/,
  `.footer-contact-list strong {
  display: block;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #1E293B !important;
  margin-bottom: 0.15rem;
}`
);

footerCss = footerCss.replace(
  /\.footer-contact-list a,\s*\.footer-contact-list span\s*\{[\s\S]*?color:\s*#94A3B8;\s*\}/,
  `.footer-contact-list a,
.footer-contact-list span {
  font-size: 0.84rem;
  color: #475569 !important;
  text-decoration: none;
}`
);

footerCss = footerCss.replace(
  /\.footer-disclaimer\s*\{[\s\S]*?padding-top:\s*1\.5rem;\s*\}/,
  `.footer-disclaimer {
  border-top: 1px solid #E2E8F0 !important;
  padding-top: 1.5rem;
}`
);

footerCss = footerCss.replace(
  /\.footer-bottom-bar\s*\{[\s\S]*?gap:\s*1rem;\s*\}/,
  `.footer-bottom-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #E2E8F0 !important;
  padding-top: 1.25rem;
}`
);

footerCss = footerCss.replace(
  /\.footer-copyright p,\s*\.footer-bottom-meta p\s*\{[\s\S]*?color:\s*#64748B;\s*\}/,
  `.footer-copyright p,
.footer-bottom-meta p {
  margin: 0;
  font-size: 0.78rem;
  color: #64748B !important;
}`
);

footerCss = footerCss.replace(
  /\.footer-legal-link\s*\{[\s\S]*?color:\s*#94A3B8;\s*\}/,
  `.footer-legal-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  color: #64748B !important;
  cursor: pointer;
  text-decoration: underline;
}`
);

fs.writeFileSync(footerCssPath, footerCss, 'utf8');
console.log('Updated footer.css successfully');

// =========================================================================
// 5. UPDATE css/global.css (Tonal overrides)
// =========================================================================
const globalCssPath = path.resolve(__dirname, '../css/global.css');
let globalCss = fs.readFileSync(globalCssPath, 'utf8');

// Replace the section shades block in global.css
const oldTonalRegex = /\/\* Individual Section Tonal Shades \*\/[\s\S]*?\/\* Section tags \*\//;
const newTonalBlock = `/* Individual Section Tonal Shades */
.hero-section {
  background-color: #F8FAFC !important;
  border-top: none;
}

.placed-students-section {
  background-color: #F8FAFC !important;
  border-top: 1px solid #E2E8F0;
}

/* Middle Sections: Kept in rich, dark obsidian / midnight tech theme */
.problem-section {
  background-color: #0D1424 !important;
  color: #F8FAFC !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.courses-section {
  background-color: #080D1A !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.why-section {
  background-color: #0C1322 !important;
  color: #F8FAFC !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.learning-experience-section {
  background-color: #080D1A !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.who-join-section {
  background-color: #0B1120 !important;
  color: #F8FAFC !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.counselling-process-section {
  background-color: #080D1A !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.proof-section {
  background-color: #0E1628 !important;
  color: #F8FAFC !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.location-section {
  background-color: #070B14 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* Ending Sections: Bright Theme */
.faq-section {
  background-color: #F8FAFC !important;
  color: #0F172A !important;
  border-top: 1px solid #E2E8F0 !important;
}

.final-cta-section {
  background-color: #FFFFFF !important;
  border-top: 1px solid #E2E8F0 !important;
}

.site-footer {
  background-color: #F8FAFC !important;
  border-top: 1px solid #E2E8F0 !important;
}

/* Headings and text in dark middle sections */
.problem-section h1, .problem-section h2, .problem-section h3, .problem-section h4,
.why-section h1, .why-section h2, .why-section h3, .why-section h4,
.who-join-section h1, .who-join-section h2, .who-join-section h3, .who-join-section h4,
.proof-section h1, .proof-section h2, .proof-section h3, .proof-section h4 {
  color: #F8FAFC;
  letter-spacing: -0.02em;
}

.problem-section p, .problem-section .text-lead,
.why-section p, .why-section .text-lead,
.who-join-section p, .who-join-section .text-lead,
.proof-section p, .proof-section .text-lead {
  color: #94A3B8;
  line-height: 1.65;
}

/* Cards across dark middle sections */
.problem-section .card, .problem-section .problem-card,
.why-section .why-card, .why-section .pillar-story-card,
.who-join-section .who-card, .who-join-section .who-stack-card {
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35) !important;
  color: #E2E8F0 !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

/* Section tags */`;

globalCss = globalCss.replace(oldTonalRegex, newTonalBlock);
fs.writeFileSync(globalCssPath, globalCss, 'utf8');
console.log('Updated global.css successfully');

// =========================================================================
// 6. UPDATE css/backgrounds.css (Final CTA background)
// =========================================================================
const backgroundsCssPath = path.resolve(__dirname, '../css/backgrounds.css');
let backgroundsCss = fs.readFileSync(backgroundsCssPath, 'utf8');

backgroundsCss = backgroundsCss.replace(
  /#final-cta\.final-cta-section,\s*\.final-cta-section\s*\{[\s\S]*?background-position:\s*center top,\s*center,\s*center top,\s*center\s*!important;\s*\}/,
  `#final-cta.final-cta-section,
.final-cta-section {
  position: relative;
  background-color: #FFFFFF !important;
  background:
    radial-gradient(ellipse 820px 440px at 50% 28%, rgba(255, 122, 0, 0.08) 0%, transparent 65%),
    linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%) !important;
}`
);

fs.writeFileSync(backgroundsCssPath, backgroundsCss, 'utf8');
console.log('Updated backgrounds.css successfully');
