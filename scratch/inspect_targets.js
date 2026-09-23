const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

function findComponentBounds(compName) {
  const startTag = `<div data-component="${compName}">`;
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return null;
  
  let depth = 1;
  let pos = startIdx + startTag.length;
  
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) break;
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return {
          startIdx,
          endIdx: nextClose + 6,
          innerStart: startIdx + startTag.length,
          innerEnd: nextClose
        };
      }
      pos = nextClose + 6;
    }
  }
  return null;
}

const comps = ['location', 'faq', 'final-cta', 'header'];

comps.forEach(c => {
  const b = findComponentBounds(c);
  console.log(`${c} bounds:`, b);
  const file = fs.readFileSync(`components/${c}/${c}.html`, 'utf8');
  console.log(`${c} file starts with:`, file.substring(0, 100).replace(/\r?\n/g, ' '));
});
