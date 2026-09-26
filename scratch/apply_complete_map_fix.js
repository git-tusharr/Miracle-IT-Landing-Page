const fs = require('fs');

// Read new SVG content
const newSvg = fs.readFileSync('scratch/new_svg.txt', 'utf8').trim();

// 1. UPDATE components/location/location.html
let locHtml = fs.readFileSync('components/location/location.html', 'utf8');

// Replace filter buttons
const oldFilter = `<button type="button" class="map-filter-btn" data-filter="mp">MP Centers (4)</button>`;
const newFilter = `<button type="button" class="map-filter-btn" data-filter="mp">MP Campuses (5)</button>`;
if (locHtml.includes(oldFilter)) {
  locHtml = locHtml.replace(oldFilter, newFilter);
}
locHtml = locHtml.replace('All Hubs (6)', 'All Campuses (6)');

// Replace SVG between <div class="india-map-viewport"...> and </div>
const svgStartMarker = '<div class="india-map-viewport" id="indiaMapViewport"';
const svgStartIdx = locHtml.indexOf(svgStartMarker);
if (svgStartIdx === -1) throw new Error('Cannot find india-map-viewport in location.html');

const openTagEnd = locHtml.indexOf('>', svgStartIdx) + 1;
const hudMarker = '<div class="map-telemetry-hud" id="mapTelemetryHud"';
const hudIdx = locHtml.indexOf(hudMarker, openTagEnd);
if (hudIdx === -1) throw new Error('Cannot find mapTelemetryHud in location.html');

// Find the </div> just before hudMarker
const divCloseIdx = locHtml.lastIndexOf('</div>', hudIdx);

locHtml = locHtml.substring(0, openTagEnd) + '\r\n' + newSvg + '\r\n            ' + locHtml.substring(divCloseIdx);
fs.writeFileSync('components/location/location.html', locHtml, 'utf8');
console.log('Updated components/location/location.html successfully.');

// 2. UPDATE components/location/location.css
let locCss = fs.readFileSync('components/location/location.css', 'utf8');

// Update transform-origin for radar scan
locCss = locCss.replace(/transform-origin:\s*240px\s*195px;/g, 'transform-origin: 330px 230px;');

// Add line highlight styles if not present
if (!locCss.includes('.telemetry-line.is-highlighted')) {
  const lineStyles = `
/* Interactive Telemetry Line Glow & Highlighting */
.telemetry-line {
  transition: stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
}

.telemetry-line.is-highlighted {
  stroke: #FF7A00 !important;
  stroke-width: 3.5px !important;
  filter: drop-shadow(0 0 10px rgba(255, 122, 0, 0.95)) !important;
}

#lineHaloGwalior.is-highlighted,
#lineHaloJabalpur.is-highlighted,
#lineHaloNagpur.is-highlighted,
#lineHaloUjjain.is-highlighted,
#lineHaloRatlam.is-highlighted {
  stroke: rgba(255, 122, 0, 0.5) !important;
  stroke-width: 9px !important;
}
`;
  locCss = locCss.replace('/* Telemetry Circuit Lines & Flow */', lineStyles + '\r\n/* Telemetry Circuit Lines & Flow */');
}

fs.writeFileSync('components/location/location.css', locCss, 'utf8');
console.log('Updated components/location/location.css successfully.');

// 3. UPDATE components/location/location.js
let locJs = fs.readFileSync('components/location/location.js', 'utf8');

// Replace Ratlam and Ujjain address/phone in REGIONAL_CENTERS_INFO with exact matches
const oldRatlamBlock = `'2': {
      title: 'Ratlam Regional Hub',
      sub: 'West MP • Authorized Learning Center',
      status: 'Active Lab',
      address: '102, Shanti Complex, Near Do Batti, Station Road, Ratlam, M.P.',
      tags: ['✓ Coding Lab', '✓ Doubt Hub', '✓ Weekend Batches'],
      phone: '07412-234567',
      phoneHref: 'tel:07412234567',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Station+Road,+Ratlam',
      isHq: false
    }`;

const newRatlamBlock = `'2': {
      title: 'Ratlam Regional Hub',
      sub: 'West MP • Authorized Learning Center',
      status: 'Active Lab',
      address: '76, B-Plaza, First Floor, T.I.Y Road Corner, Above Raymond Showroom, Station Road, Ratlam, M.P.',
      tags: ['✓ Offline Labs', '✓ Counselling Desk', '✓ Weekend Batches'],
      phone: '07412-403025',
      phoneHref: 'tel:07412403025',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Station+Road,+Ratlam',
      isHq: false
    }`;

if (locJs.includes(oldRatlamBlock)) {
  locJs = locJs.replace(oldRatlamBlock, newRatlamBlock);
}

const oldUjjainBlock = `'3': {
      title: 'Ujjain Regional Hub',
      sub: 'Malwa Regional Hub • Authorized Center',
      status: 'Active Lab',
      address: '3rd Floor, Mahakal Commercial Arcade, Malipura Main Road, Ujjain, M.P.',
      tags: ['✓ Coding Lab', '✓ Career Desk', '✓ Lab Reviews'],
      phone: '0734-2567890',
      phoneHref: 'tel:07342567890',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Malipura,+Ujjain',
      isHq: false
    }`;

const newUjjainBlock = `'3': {
      title: 'Ujjain Regional Hub',
      sub: 'Malwa Regional Hub • Authorized Center',
      status: 'Active Lab',
      address: '301, 3rd Floor, Mahakaal Kanak, Malipura, Dewas Gate, Ujjain, M.P.',
      tags: ['✓ Offline Labs', '✓ Interview Prep', '✓ Doubt Clearing'],
      phone: '0734-4030236',
      phoneHref: 'tel:07344030236',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Malipura,+Ujjain',
      isHq: false
    }`;

if (locJs.includes(oldUjjainBlock)) {
  locJs = locJs.replace(oldUjjainBlock, newUjjainBlock);
}

const oldNagpurBlock = `'4': {
      title: 'Nagpur Regional Hub',
      sub: 'Maharashtra Regional Hub • Authorized Center',
      status: 'Active Lab',
      address: '401, Vidarbha Tech Towers, Near Metro Station, Sitabuldi, Nagpur, MH.',
      tags: ['✓ Full-Stack Lab', '✓ Hiring Cell', '✓ Cloud Workstations'],
      phone: '0712-2789012',
      phoneHref: 'tel:07122789012',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Sitabuldi,+Nagpur',
      isHq: false
    }`;

const newNagpurBlock = `'4': {
      title: 'Nagpur Regional Hub',
      sub: 'Maharashtra Regional Hub • Authorized Center',
      status: 'Active Lab',
      address: 'Plot No. 12, 1st Floor, Near Sitabuldi Metro Interchange, Wardha Road, Sitabuldi, Nagpur, Maharashtra',
      tags: ['✓ Full-Stack Lab', '✓ Placement Cell', '✓ Cloud Workstations'],
      phone: '0712-2550188',
      phoneHref: 'tel:07122550188',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Sitabuldi,+Nagpur',
      isHq: false
    }`;

if (locJs.includes(oldNagpurBlock)) {
  locJs = locJs.replace(oldNagpurBlock, newNagpurBlock);
}

// Line highlighting map
const highlightLogic = `
    // Synchronize active state on SVG nodes and highlight corresponding lines
    const lineKeyMap = {
      '0': { telem: '#telemLineJabalpur', halo: '#lineHaloJabalpur' },
      '1': { telem: '#telemLineGwalior', halo: '#lineHaloGwalior' },
      '2': { telem: '#telemLineRatlam', halo: '#lineHaloRatlam' },
      '3': { telem: '#telemLineUjjain', halo: '#lineHaloUjjain' },
      '4': { telem: '#telemLineNagpur', halo: '#lineHaloNagpur' }
    };

    // Reset all line highlights
    section.querySelectorAll('.telemetry-line, #lineHaloGwalior, #lineHaloJabalpur, #lineHaloNagpur, #lineHaloUjjain, #lineHaloRatlam').forEach(el => {
      el.classList.remove('is-highlighted');
    });

    if (data.isHq) {
      // Highlight all 5 lines when Bhopal HQ is selected
      section.querySelectorAll('.telemetry-line, #lineHaloGwalior, #lineHaloJabalpur, #lineHaloNagpur, #lineHaloUjjain, #lineHaloRatlam').forEach(el => {
        el.classList.add('is-highlighted');
      });
    } else if (lineKeyMap[String(key)]) {
      const match = lineKeyMap[String(key)];
      const tEl = section.querySelector(match.telem);
      const hEl = section.querySelector(match.halo);
      if (tEl) tEl.classList.add('is-highlighted');
      if (hEl) hEl.classList.add('is-highlighted');
    }

    // Synchronize active state on SVG nodes
    const allNodes = section.querySelectorAll('.map-campus-node');
    allNodes.forEach(node => {
      const pinId = node.getAttribute('data-center-id');
      const pinIdx = node.getAttribute('data-center-index');
      const isMatch = (data.isHq && pinId === 'bhopal') || (pinIdx === String(key));
      node.classList.toggle('is-active', isMatch);
    });
`;

// Replace lines synchronization in updateTelemetryHud
locJs = locJs.replace(/\/\/ Synchronize active state on SVG nodes[\s\S]*?node\.classList\.toggle\('is-active', isMatch\);\s*\}\);/, highlightLogic.trim());

// Add Hover Preview interaction
if (!locJs.includes('node.addEventListener(\'mouseenter\'')) {
  const hoverLogic = `
    node.addEventListener('mouseenter', () => {
      const pinId = node.getAttribute('data-center-id');
      const pinIdx = node.getAttribute('data-center-index');
      if (pinId === 'bhopal') {
        section.updateTelemetryHud('bhopal');
      } else if (pinIdx !== null) {
        section.updateTelemetryHud(pinIdx);
      }
    });
`;
  locJs = locJs.replace("node.addEventListener('click', () => {", hoverLogic.trim() + "\r\n    node.addEventListener('click', () => {");
}

fs.writeFileSync('components/location/location.js', locJs, 'utf8');
console.log('Updated components/location/location.js successfully.');
