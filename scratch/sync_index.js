const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

function findComponentBounds(sourceHtml, compName) {
  const startTag = `<div data-component="${compName}">`;
  const startIdx = sourceHtml.indexOf(startTag);
  if (startIdx === -1) return null;
  
  let depth = 1;
  let pos = startIdx + startTag.length;
  
  while (depth > 0 && pos < sourceHtml.length) {
    const nextOpen = sourceHtml.indexOf('<div', pos);
    const nextClose = sourceHtml.indexOf('</div>', pos);
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

// 1. Replace location
const locFile = fs.readFileSync('components/location/location.html', 'utf8').trim();
const locBounds = findComponentBounds(html, 'location');
if (!locBounds) throw new Error('Location bounds not found');
html = html.substring(0, locBounds.innerStart) + '\r\n' + locFile + '\r\n    ' + html.substring(locBounds.innerEnd);
console.log('Location synced successfully.');

// 2. Replace faq
const faqFile = fs.readFileSync('components/faq/faq.html', 'utf8').trim();
const faqBounds = findComponentBounds(html, 'faq');
if (!faqBounds) throw new Error('FAQ bounds not found');
html = html.substring(0, faqBounds.innerStart) + '\r\n' + faqFile + '\r\n    ' + html.substring(faqBounds.innerEnd);
console.log('FAQ synced successfully.');

// 3. Replace final-cta
const ctaFile = fs.readFileSync('components/final-cta/final-cta.html', 'utf8').trim();
const ctaBounds = findComponentBounds(html, 'final-cta');
if (!ctaBounds) throw new Error('Final CTA bounds not found');
html = html.substring(0, ctaBounds.innerStart) + '\r\n' + ctaFile + '\r\n    ' + html.substring(ctaBounds.innerEnd);
console.log('Final CTA synced successfully.');

// 4. Clean up badge-security and badge-cloud in proof/tool marquee
html = html.replace(/<span class="marquee-pill-badge badge-security">🛡 SECURITY<\/span>/g, '<span class="marquee-pill-badge badge-security">SECURITY</span>');
html = html.replace(/<span class="marquee-pill-badge badge-cloud">☁ CLOUD<\/span>/g, '<span class="marquee-pill-badge badge-cloud">CLOUD</span>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('All updates written to index.html successfully!');
