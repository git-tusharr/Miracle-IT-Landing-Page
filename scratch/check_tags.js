const fs = require('fs');
const html = fs.readFileSync('components/location/location.html', 'utf8');
const openScalers = (html.match(/<g class="pin-scaler">/g) || []).length;
console.log('Pin scaler tags open count:', openScalers);
const openG = (html.match(/<g[\s>]/g) || []).length;
const closeG = (html.match(/<\/g>/g) || []).length;
console.log('Total <g>:', openG, 'Total </g>:', closeG);
