const fs = require('fs');
const html = fs.readFileSync('C:/Users/Lenovo/.gemini/antigravity-ide/brain/de2c3616-a694-4a2f-9bde-ae91c5d10d3a/.system_generated/steps/1288/content.md', 'utf8');

// Find all occurrences of image or file links
const matches = html.match(/https:\/\/[^\s"']+\.svg[^\s"']*/g) || [];
console.log('SVG links found:', [...new Set(matches)]);

const pngMatches = html.match(/https:\/\/upload\.wikimedia\.org\/[^\s"']+/g) || [];
console.log('Upload links:', [...new Set(pngMatches)].slice(0, 10));
