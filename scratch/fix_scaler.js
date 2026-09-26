const fs = require('fs');

// 1. UPDATE components/location/location.css
let css = fs.readFileSync('components/location/location.css', 'utf8');

// Replace the problematic transform on .map-campus-node
const oldNodeCss = `.map-campus-node {
  cursor: pointer;
  outline: none;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), filter 0.28s ease, opacity 0.28s ease;
}

.map-campus-node:hover,
.map-campus-node:focus-visible,
.map-campus-node.is-active {
  transform: scale(1.12);
  filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.95));
}

.map-hub-group:hover,
.map-hub-group:focus-visible,
.map-hub-group.is-active {
  transform: scale(1.12);
  filter: drop-shadow(0 0 18px rgba(255, 122, 0, 0.95));
}`;

const newNodeCss = `.map-campus-node {
  cursor: pointer;
  outline: none;
  transition: opacity 0.28s ease, filter 0.28s ease;
}

.map-campus-node .pin-scaler {
  transform-origin: 0px 0px;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.map-campus-node:hover .pin-scaler,
.map-campus-node:focus-visible .pin-scaler,
.map-campus-node.is-active .pin-scaler {
  transform: scale(1.12);
}

.map-campus-node:hover,
.map-campus-node:focus-visible,
.map-campus-node.is-active {
  filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.95));
}

.map-hub-group:hover,
.map-hub-group:focus-visible,
.map-hub-group.is-active {
  filter: drop-shadow(0 0 22px rgba(255, 122, 0, 0.95));
}`;

css = css.replace(oldNodeCss, newNodeCss);
fs.writeFileSync('components/location/location.css', css, 'utf8');
console.log('Fixed CSS transform issue in components/location/location.css');

// 2. UPDATE components/location/location.html to wrap inner content in <g class="pin-scaler">
let html = fs.readFileSync('components/location/location.html', 'utf8');

// For each node ID: mapPinBhopal, mapPinGwalior, mapPinJabalpur, mapPinNagpur, mapPinUjjain, mapPinRatlam
const nodeIds = ['mapPinBhopal', 'mapPinGwalior', 'mapPinJabalpur', 'mapPinNagpur', 'mapPinUjjain', 'mapPinRatlam'];

nodeIds.forEach(id => {
  const openTagRegex = new RegExp(`(<g class="map-campus-node[^"]*"[^>]*id="${id}"[^>]*>)`, 'g');
  html = html.replace(openTagRegex, '$1\r\n                  <g class="pin-scaler">');
});

// Now close the <g class="pin-scaler"> before each node's closing </g>
// In the SVG, each node ends with </g>\r\n                </g>
html = html.replace(/(<\/g>\s*)(<\/g>\s*<!-- PIN|\s*<\/svg>)/g, '$1</g>\r\n                $2');

fs.writeFileSync('components/location/location.html', html, 'utf8');
console.log('Added pin-scaler wrappers to components/location/location.html');
