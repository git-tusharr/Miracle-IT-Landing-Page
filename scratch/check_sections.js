const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');

// Match sections
const secMatches = [...html.matchAll(/<section[\s\S]*?>/gi)];
secMatches.forEach((m, idx) => {
  const tag = m[0];
  const idMatch = tag.match(/id="([^"]+)"/i);
  const classMatch = tag.match(/class="([^"]+)"/i);
  console.log(`${idx + 1}. ID: ${idMatch ? idMatch[1] : 'NONE'} | Class: ${classMatch ? classMatch[1] : 'NONE'}`);
});
