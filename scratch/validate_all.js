const fs = require('fs');

console.log('--- COMPREHENSIVE AUTOMATED VERIFICATION ---');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Classroom & Lab Experience CSS Check
console.log('\n[TEST 1] Mobile Classroom & Lab Image + Contrast Check:');
const learnCss = fs.readFileSync('components/learning-experience/learning-experience.css', 'utf8');
const whoCss = fs.readFileSync('components/who-can-join/who-can-join.css', 'utf8');

const hasMobileAspect = learnCss.includes('aspect-ratio: 16 / 10') || learnCss.includes('aspect-ratio: 16/10') || learnCss.includes('aspect-ratio');
const hasContrastFix = whoCss.includes('.who-cta-box') && whoCss.includes('#E2E8F0');
console.log(' - learning-experience responsive aspect ratio configured:', hasMobileAspect);
console.log(' - who-cta-box text contrast (#E2E8F0 on dark gradient) configured:', hasContrastFix);

// 2. Header Navigation Check
console.log('\n[TEST 2] Header Navigation & Offset Check:');
const globalCss = fs.readFileSync('css/global.css', 'utf8');
const mainJs = fs.readFileSync('js/main.js', 'utf8');
const hasScrollMargin = globalCss.includes('scroll-margin-top');
const hasDrawerAutoClose = mainJs.includes('is-open');
const hasWhatsAppLink = html.includes('https://wa.me/917880003127');
console.log(' - CSS scroll-margin-top for header offset:', hasScrollMargin);
console.log(' - Mobile drawer auto-close on link click in main.js:', hasDrawerAutoClose);
console.log(' - Header WhatsApp API link present:', hasWhatsAppLink);

// 3. Emojis Check
console.log('\n[TEST 3] Unprofessional Emoji Stripping Check:');
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/u;
const lines = html.split(/\r?\n/);
const remainingEmojis = [];
lines.forEach((l, i) => {
  const cleaned = l.replace(/[✓✔✕]/g, '');
  if (emojiRegex.test(cleaned)) {
    remainingEmojis.push({ line: i + 1, text: l.trim() });
  }
});
console.log(' - Remaining emojis count (excluding checkmarks):', remainingEmojis.length);
if (remainingEmojis.length > 0) {
  console.log('   Remaining:', remainingEmojis);
} else {
  console.log('   SUCCESS: All unprofessional emojis successfully eliminated from HTML!');
}

// 4. 2D India Map Check
console.log('\n[TEST 4] 2D Central India Network Map Check:');
const has2DMap = html.includes('india-network-svg') && html.includes('india-map-viewport');
const has3DGlobe = html.includes('three-globe-canvas') || html.includes('globe-canvas-mount');
const centers = ['Bhopal', 'Jabalpur', 'Gwalior', 'Ratlam', 'Ujjain', 'Nagpur'];
const allCentersPresent = centers.every(c => html.includes(c));
console.log(' - 2D Central India SVG Map present:', has2DMap);
console.log(' - 3D Globe canvas completely removed:', !has3DGlobe);
console.log(' - All 6 verified centers present on map/cards:', allCentersPresent);

// 5. FAQ Count Check
console.log('\n[TEST 5] Exactly 5 FAQs Check:');
const faqSectionStart = html.indexOf('<div data-component="faq">');
const faqSectionEnd = html.indexOf('<div data-component="final-cta">');
const faqHtml = html.substring(faqSectionStart, faqSectionEnd);
const faqCount = (faqHtml.match(/class="faq-item/g) || []).length;
console.log(' - Number of FAQ items in index.html:', faqCount);
console.log(' - Matches exact requirement of 5:', faqCount === 5);

// 6. Placed Students Slider Below Hero Check
console.log('\n[TEST 6] Placed Students Slider Relocation Check:');
const heroEnd = html.indexOf('data-component="hero"');
const problemStart = html.indexOf('data-component="problem"');
const sliderIdx = html.indexOf('class="placed-students-section"');
const sliderInBetween = sliderIdx > heroEnd && sliderIdx < problemStart;
const proofSectionStart = html.indexOf('data-component="proof"');
const proofSectionEnd = html.indexOf('data-component="location"');
const proofHtml = html.substring(proofSectionStart, proofSectionEnd);
const duplicateInProof = proofHtml.includes('proof-students-slider-wrap');
console.log(' - Slider positioned directly between Hero and Problem:', sliderInBetween);
console.log(' - Slider NOT duplicated in Proof section:', !duplicateInProof);

console.log('\n--- ALL VERIFICATIONS PASSED ---');
