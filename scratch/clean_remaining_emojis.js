const fs = require('fs');

const svgBulb = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>`;

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<span class="contrast-badge">❌ The Trap<\/span>/g, '<span class="contrast-badge">The Trap</span>');
  content = content.replace(/<div class="advisory-icon" aria-hidden="true">💡<\/div>/g, `<div class="advisory-icon" aria-hidden="true">${svgBulb}</div>`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned emojis in', filePath);
}

cleanFile('index.html');
cleanFile('components/courses/courses.html');
cleanFile('components/problem/problem.html');
