const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

console.log("=== COMPONENT MOUNT POINTS & SECTIONS ===");
lines.forEach((line, i) => {
  if (
    line.includes('data-component=') ||
    line.includes('<section') ||
    line.includes('class="site-header"') ||
    line.includes('class="site-footer"') ||
    line.includes('id="siteHeader"') ||
    line.includes('id="siteFooter"')
  ) {
    console.log(`${i + 1}: ${line.trim().slice(0, 120)}`);
  }
});
