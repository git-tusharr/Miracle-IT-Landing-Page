const fs = require('fs');
const path = require('path');

const whyHtml = fs.readFileSync(path.resolve(__dirname, '../components/why-miracle-it/why-miracle-it.html'), 'utf8');
let indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

const startMarker = '<!-- 5. Why Miracle IT Section -->';
const endMarker = '<!-- 6. Lab & Classroom Learning Experience Section -->';

const startIndex = indexHtml.indexOf(startMarker);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found');
  process.exit(1);
}

const before = indexHtml.slice(0, startIndex);
const after = indexHtml.slice(endIndex);

const newSection = `${startMarker}\n    <div data-component="why-miracle-it">\n${whyHtml}\n    </div>\n\n    `;
indexHtml = before + newSection + after;

fs.writeFileSync(path.resolve(__dirname, '../index.html'), indexHtml, 'utf8');
console.log('Successfully written to index.html. Total length:', indexHtml.length);
