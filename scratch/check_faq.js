const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startTag = '<div data-component="faq">';
const nextTag = '<div data-component="final-cta">';

const startIdx = html.indexOf(startTag);
const endIdx = html.indexOf(nextTag);

console.log('FAQ in index.html starts at', startIdx, 'and final-cta starts at', endIdx);
const faqChunk = html.substring(startIdx, endIdx);
console.log('FAQ chunk count of .faq-item:', (faqChunk.match(/class="faq-item/g) || []).length);
