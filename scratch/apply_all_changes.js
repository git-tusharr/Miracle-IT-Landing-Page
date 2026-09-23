const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

console.log('Original length:', html.length);

// 1. RELOCATE SLIDER
const sliderMarkerStart = '<!-- ====================================================================\r\n         PLACED STUDENTS FLOATING KINETIC SLIDER';
const sliderMarkerAlt = '<!-- ====================================================================\n         PLACED STUDENTS FLOATING KINETIC SLIDER';
const sliderEndMarker = '<!-- Dual-Track Infinite Kinetic Marquee';

let sliderStartIdx = html.indexOf(sliderMarkerStart);
if (sliderStartIdx === -1) sliderStartIdx = html.indexOf(sliderMarkerAlt);
const sliderEndIdx = html.indexOf(sliderEndMarker);

if (sliderStartIdx === -1 || sliderEndIdx === -1) {
  throw new Error(`Slider markers not found: start=${sliderStartIdx}, end=${sliderEndIdx}`);
}

// Find the last </div> before sliderEndMarker
const sliderCutEnd = html.lastIndexOf('</div>', sliderEndIdx) + 6;
const sliderBlock = html.substring(sliderStartIdx, sliderCutEnd).trim();

// Remove slider from proof
html = html.substring(0, sliderStartIdx) + html.substring(sliderEndIdx);
console.log('Removed slider from proof section.');

// Insert slider right after Hero
const heroEndTag = '    </div>\r\n\r\n    <!-- 3. Problem / Career Confusion Section -->';
const heroEndTagAlt = '    </div>\n\n    <!-- 3. Problem / Career Confusion Section -->';
let heroEndIdx = html.indexOf(heroEndTag);
let heroEndTagLen = '    </div>\r\n'.length;

if (heroEndIdx === -1) {
  heroEndIdx = html.indexOf(heroEndTagAlt);
  heroEndTagLen = '    </div>\n'.length;
}

if (heroEndIdx === -1) {
  throw new Error('Hero end tag not found');
}

const sliderInsertIdx = heroEndIdx + heroEndTagLen;
const placedSection = `\r\n    <!-- 2.5 Verified Placed Students Showcase Slider -->\r\n    <section class="placed-students-section" id="placed-students" aria-label="Verified Placed Students Showcase">\r\n      <div class="container">\r\n        ${sliderBlock}\r\n      </div>\r\n    </section>\r\n\r\n`;

html = html.substring(0, sliderInsertIdx) + placedSection + html.substring(sliderInsertIdx);
console.log('Inserted placed students section directly below hero.');

// Function to find exact component boundaries
function getComponentBounds(source, compName) {
  const openTag = `<div data-component="${compName}">`;
  const startIdx = source.indexOf(openTag);
  if (startIdx === -1) return null;
  
  let depth = 1;
  let pos = startIdx + openTag.length;
  
  while (depth > 0 && pos < source.length) {
    const nextOpen = source.indexOf('<div', pos);
    const nextClose = source.indexOf('</div>', pos);
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
          innerStart: startIdx + openTag.length,
          innerEnd: nextClose
        };
      }
      pos = nextClose + 6;
    }
  }
  return null;
}

// 2. REPLACE LOCATION
const locBounds = getComponentBounds(html, 'location');
if (!locBounds) throw new Error('Location bounds not found');
const locFile = fs.readFileSync('components/location/location.html', 'utf8').trim();
html = html.substring(0, locBounds.innerStart) + '\r\n      ' + locFile + '\r\n    ' + html.substring(locBounds.innerEnd);
console.log('Replaced location component.');

// 3. REPLACE FAQ
const faqBounds = getComponentBounds(html, 'faq');
if (!faqBounds) throw new Error('FAQ bounds not found');
const faqFile = fs.readFileSync('components/faq/faq.html', 'utf8').trim();
html = html.substring(0, faqBounds.innerStart) + '\r\n      ' + faqFile + '\r\n    ' + html.substring(faqBounds.innerEnd);
console.log('Replaced FAQ component.');

// 4. REPLACE FINAL CTA
const ctaBounds = getComponentBounds(html, 'final-cta');
if (!ctaBounds) throw new Error('Final CTA bounds not found');
const ctaFile = fs.readFileSync('components/final-cta/final-cta.html', 'utf8').trim();
html = html.substring(0, ctaBounds.innerStart) + '\r\n      ' + ctaFile + '\r\n    ' + html.substring(ctaBounds.innerEnd);
console.log('Replaced Final CTA component.');

// 5. TOOL BADGE EMOJIS IN PROOF MARQUEE
html = html.replace(/<span class="marquee-pill-badge badge-core">⚡ CORE<\/span>/g, '<span class="marquee-pill-badge badge-core">CORE</span>');
html = html.replace(/<span class="marquee-pill-badge badge-backend">🛠 BACKEND<\/span>/g, '<span class="marquee-pill-badge badge-backend">BACKEND</span>');
html = html.replace(/<span class="marquee-pill-badge badge-aiml">🐍 AI\/ML<\/span>/g, '<span class="marquee-pill-badge badge-aiml">AI/ML</span>');
html = html.replace(/<span class="marquee-pill-badge badge-data">📊 DATA<\/span>/g, '<span class="marquee-pill-badge badge-data">DATA</span>');
html = html.replace(/<span class="marquee-pill-badge badge-security">🛡 SECURITY<\/span>/g, '<span class="marquee-pill-badge badge-security">SECURITY</span>');
html = html.replace(/<span class="marquee-pill-badge badge-cloud">☁ CLOUD<\/span>/g, '<span class="marquee-pill-badge badge-cloud">CLOUD</span>');

// 6. HERO CODE TABS & TERMINAL EMOJIS
html = html.replace(/<span class="tab-icon">⚡<\/span>/g, '');
html = html.replace(/<span class="tab-icon">🐍<\/span>/g, '');
html = html.replace(/<span class="tab-icon">📊<\/span>/g, '');
html = html.replace(/<span class="term-tab-icon">⚡<\/span>/g, '');
html = html.replace(/<span class="term-tab-icon">🐍<\/span>/g, '');
html = html.replace(/<span class="term-tab-icon">📊<\/span>/g, '');
html = html.replace(/🚀 100% Practical Portfolio Live on GitHub!/g, '100% Practical Portfolio Live on GitHub!');

// 7. PROBLEM SECTION EMOJIS
html = html.replace(/<span class="matcher-label">⚡ Identify Your Exact Dilemma:<\/span>/g, '<span class="matcher-label">Identify Your Exact Dilemma:</span>');
html = html.replace(/<button type="button" class="matcher-chip diagnostic-btn" data-target-card="0">🎓 Just Finished/g, '<button type="button" class="matcher-chip diagnostic-btn" data-target-card="0">Just Finished');
html = html.replace(/<button type="button" class="matcher-chip diagnostic-btn" data-target-card="1">🧭 Confused Across 10\+/g, '<button type="button" class="matcher-chip diagnostic-btn" data-target-card="1">Confused Across 10+');
html = html.replace(/<span class="contrast-badge">⚡ Miracle IT Fix<\/span>/g, '<span class="contrast-badge">Miracle IT Fix</span>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully wrote all changes to index.html! New length:', html.length);
