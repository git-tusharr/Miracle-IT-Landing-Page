const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split(/\r?\n/);

const sliderLines = lines.slice(2842, 3334);
fs.writeFileSync('scratch/slider_block.html', sliderLines.join('\r\n'), 'utf8');
console.log('Saved slider block, lines count:', sliderLines.length);
