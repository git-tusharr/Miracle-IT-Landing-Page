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

const bounds = findComponentBounds('header');
const compFileContent = fs.readFileSync('components/header/header.html', 'utf8').trim();
const innerHtml = html.substring(bounds.innerStart, bounds.innerEnd).trim();

console.log('--- FILE HEADER ---');
console.log(compFileContent.substring(0, 300));
console.log('--- INNER HTML ---');
console.log(innerHtml.substring(0, 300));
