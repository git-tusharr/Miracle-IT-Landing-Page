const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

console.log('1. has placed-students with data-theme="obsidian":', html.includes('id="placed-students" data-theme="obsidian"'));
console.log('2. has who-cta-btn in index.html:', html.includes('who-cta-btn'));
console.log('3. counselling-form anchor position in index.html:', html.indexOf('id="counselling-form"'));
console.log('4. final-cta section position:', html.indexOf('id="final-cta"'));
console.log('5. form position in final-cta:', html.indexOf('id="counsellingForm"'));
