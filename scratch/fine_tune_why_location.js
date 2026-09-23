const fs = require('fs');

function adjustCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, 'utf8');

  // Replace font-weight: 700/800 on small badges with 600 and letter-spacing: 0.03em
  css = css.replace(/(\.(?:os-badge-pill|slide-tag|stat-badge|pledge-pill|comp-factor|location-tag|summary-pill|transit-pill|amenity-chip)\s*\{[^}]*?)font-weight:\s*[78]00;/g, '$1font-weight: 600;\n  letter-spacing: 0.03em;');

  fs.writeFileSync(filePath, css, 'utf8');
  console.log(`[ADJUSTED] ${filePath}`);
}

adjustCss('components/why-miracle-it/why-miracle-it.css');
adjustCss('components/location/location.css');
if (fs.existsSync('miracle-it-career-academy/components/why-miracle-it/why-miracle-it.css')) {
  adjustCss('miracle-it-career-academy/components/why-miracle-it/why-miracle-it.css');
}
if (fs.existsSync('miracle-it-career-academy/components/location/location.css')) {
  adjustCss('miracle-it-career-academy/components/location/location.css');
}
