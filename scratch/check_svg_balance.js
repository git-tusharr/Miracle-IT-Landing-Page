const fs = require('fs');
const html = fs.readFileSync('components/location/location.html', 'utf8');
const svgStart = html.indexOf('<svg class="india-network-svg"');
const svgEnd = html.indexOf('</svg>', svgStart);
const svg = html.substring(svgStart, svgEnd + 6);

const regex = /<(\/)?g\b([^>]*)>/g;
let match;
let stack = [];
let errors = 0;
while ((match = regex.exec(svg)) !== null) {
  const isClose = Boolean(match[1]);
  if (!isClose) {
    stack.push({ tag: match[2].trim(), idx: match.index });
  } else {
    if (stack.length === 0) {
      console.log('Extra closing </g> at pos', match.index);
      errors++;
    } else {
      stack.pop();
    }
  }
}
console.log('Unclosed tags remaining:', stack.length, 'Errors:', errors);
if (stack.length > 0) {
  console.log('Unclosed tags:', stack);
}
