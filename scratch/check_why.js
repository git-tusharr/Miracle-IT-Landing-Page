const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log('index.html length:', html.length);
console.log('has india-network-svg:', html.includes('india-network-svg'));
console.log('has placed-students-section:', html.includes('placed-students-section'));
console.log('has proof-students-slider-wrap:', html.includes('proof-students-slider-wrap'));
console.log('indexOf proof-students-slider-wrap:', html.indexOf('proof-students-slider-wrap'));
console.log('indexOf data-component="proof":', html.indexOf('data-component="proof"'));
