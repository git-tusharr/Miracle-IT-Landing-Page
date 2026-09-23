const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log('has id="counselling-form":', html.includes('id="counselling-form"'));
console.log('has id="final-cta":', html.includes('id="final-cta"'));
console.log('has id="counsellingForm":', html.includes('id="counsellingForm"'));

// Let's find all href="#counselling-form" in index.html
const matches = html.match(/href="#counselling-form"/g);
console.log('href="#counselling-form" count:', matches ? matches.length : 0);
