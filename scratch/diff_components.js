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

const comps = [
  'header',
  'hero',
  'problem',
  'courses',
  'why-miracle-it',
  'learning-experience',
  'who-can-join',
  'counselling-process',
  'proof',
  'location',
  'faq',
  'final-cta',
  'footer',
  'mobile-sticky-cta'
];

for (const c of comps) {
  const compFile = `components/${c}/${c}.html`;
  if (!fs.existsSync(compFile)) continue;
  
  const bounds = findComponentBounds(c);
  if (!bounds) {
    console.log(`Could not find bounds for ${c}`);
    continue;
  }
  
  const compFileContent = fs.readFileSync(compFile, 'utf8').trim().replace(/\r\n/g, '\n');
  const innerHtml = html.substring(bounds.innerStart, bounds.innerEnd).trim().replace(/\r\n/g, '\n');
  
  if (compFileContent === innerHtml) {
    console.log(`[SYNCED] ${c}`);
  } else {
    console.log(`[DIFFERENT] ${c}: file len=${compFileContent.length}, inner len=${innerHtml.length}`);
  }
}
