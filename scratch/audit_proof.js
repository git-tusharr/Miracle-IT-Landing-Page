const fs = require('fs');

const html = fs.readFileSync('components/proof/proof.html', 'utf8');
const lines = html.split('\n');

console.log("=== PROOF SUBSECTIONS ===");
lines.forEach((line, i) => {
  if (line.includes('<h2') || line.includes('<h3') || line.includes('class="section-') || line.includes('class="proof-')) {
    if (line.trim().length < 120) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  }
});
