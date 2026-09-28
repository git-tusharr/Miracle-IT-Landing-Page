const fs = require('fs');
const path = require('path');

let indexHtml = fs.readFileSync('index.html', 'utf8');

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

// 1. Sync header
const headerFile = fs.readFileSync('components/header/header.html', 'utf8').trim();
const headerBounds = findComponentBounds(indexHtml, 'header');
if (headerBounds) {
  indexHtml = indexHtml.substring(0, headerBounds.innerStart) + '\r\n    ' + headerFile + '\r\n  ' + indexHtml.substring(headerBounds.innerEnd);
  console.log('Synced header to index.html');
}

// 2. Sync FAQ
const faqFile = fs.readFileSync('components/faq/faq.html', 'utf8').trim();
const faqBounds = findComponentBounds(indexHtml, 'faq');
if (faqBounds) {
  indexHtml = indexHtml.substring(0, faqBounds.innerStart) + '\r\n' + faqFile + '\r\n    ' + indexHtml.substring(faqBounds.innerEnd);
  console.log('Synced faq to index.html');
}

// 3. Sync Final CTA
const ctaFile = fs.readFileSync('components/final-cta/final-cta.html', 'utf8').trim();
const ctaBounds = findComponentBounds(indexHtml, 'final-cta');
if (ctaBounds) {
  indexHtml = indexHtml.substring(0, ctaBounds.innerStart) + '\r\n' + ctaFile + '\r\n    ' + indexHtml.substring(ctaBounds.innerEnd);
  console.log('Synced final-cta to index.html');
}

// 4. Sync Footer
const footerFile = fs.readFileSync('components/footer/footer.html', 'utf8').trim();
const footerBounds = findComponentBounds(indexHtml, 'footer');
if (footerBounds) {
  indexHtml = indexHtml.substring(0, footerBounds.innerStart) + '\r\n    ' + footerFile + '\r\n  ' + indexHtml.substring(footerBounds.innerEnd);
  console.log('Synced footer to index.html');
}

// 5. Update data-theme attributes in index.html
indexHtml = indexHtml.replace(
  '<section class="hero-section" id="hero" data-theme="obsidian">',
  '<section class="hero-section" id="hero" data-theme="light">'
);

indexHtml = indexHtml.replace(
  '<section class="placed-students-section" id="placed-students" data-theme="obsidian"',
  '<section class="placed-students-section" id="placed-students" data-theme="light"'
);

indexHtml = indexHtml.replace(
  '<section class="section faq-section" id="faq" data-theme="midnight-slate">',
  '<section class="section faq-section" id="faq" data-theme="light">'
);

indexHtml = indexHtml.replace(
  '<section class="section final-cta-section" id="final-cta">',
  '<section class="section final-cta-section" id="final-cta" data-theme="light">'
);

indexHtml = indexHtml.replace(
  '<footer class="site-footer" id="siteFooter">',
  '<footer class="site-footer" id="siteFooter" data-theme="light">'
);

// 6. Add location bottom gradient seam to location.css
const locCssPath = 'components/location/location.css';
let locCss = fs.readFileSync(locCssPath, 'utf8');
if (!locCss.includes('location-section::after')) {
  locCss += `\r\n\r\n/* Smooth gradient seam transitioning from dark location section into bright FAQ section */\r\n#location.location-section::after,\r\n.location-section::after {\r\n  content: '';\r\n  position: absolute;\r\n  bottom: 0;\r\n  left: 0;\r\n  right: 0;\r\n  height: 90px;\r\n  background: linear-gradient(180deg, transparent 0%, #F8FAFC 100%);\r\n  pointer-events: none;\r\n  z-index: 4;\r\n}\r\n`;
  fs.writeFileSync(locCssPath, locCss, 'utf8');
  console.log('Added smooth transition seam to location.css');
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('Successfully synced all changes into index.html');
