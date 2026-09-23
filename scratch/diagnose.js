const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const faqHtml = fs.readFileSync('components/faq/faq.html', 'utf8');
const locHtml = fs.readFileSync('components/location/location.html', 'utf8');
const finalCtaHtml = fs.readFileSync('components/final-cta/final-cta.html', 'utf8');

console.log('--- DIAGNOSTIC ---');
console.log('1. faq.html count of class="faq-item":', (faqHtml.match(/class="faq-item/g) || []).length);
console.log('2. index.html count of class="faq-item":', (indexHtml.match(/class="faq-item/g) || []).length);
console.log('3. index.html has india-network-svg:', indexHtml.includes('india-network-svg'));
console.log('4. index.html has placed-students-section:', indexHtml.includes('placed-students-section'));
console.log('5. index.html has proof-students-slider-wrap count:', (indexHtml.match(/proof-students-slider-wrap/g) || []).length);
console.log('6. index.html location div start:', indexHtml.indexOf('<div data-component="location">'));
console.log('7. index.html has 3D globe:', indexHtml.includes('three-globe-canvas') || indexHtml.includes('globe-canvas-mount'));
