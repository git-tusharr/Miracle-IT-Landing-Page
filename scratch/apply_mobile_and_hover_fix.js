const fs = require('fs');

// 1. UPDATE components/location/location.html
// Rebuild SVG nodes with dedicated popup classes and clean markup
let locHtml = fs.readFileSync('components/location/location.html', 'utf8');

const updatedSvgNodes = `                <!-- PIN 1: BHOPAL (HEADQUARTERS & MAIN CAMPUS - CENTER) -->
                <g class="map-campus-node map-hub-group" transform="translate(330, 230)" id="mapPinBhopal" role="button" tabindex="0" aria-label="Bhopal Headquarters & Main Campus" data-center-id="bhopal">
                  <!-- Beacon Aura & Pulses -->
                  <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(255, 122, 0, 0.4)" stroke-width="1.8" class="hub-pulse-wave hub-pulse-1" />
                  <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255, 122, 0, 0.65)" stroke-width="2" class="hub-pulse-wave hub-pulse-2" />
                  <circle cx="0" cy="0" r="16" fill="rgba(255, 122, 0, 0.22)" class="pin-aura" />
                  <circle cx="0" cy="0" r="9.5" fill="#FF7A00" stroke="#FFFFFF" stroke-width="2.5" class="pin-beacon" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="4" fill="#FFFFFF" class="pin-center-core" />
                  <!-- Centered Floating Popup Badge directly ABOVE Bhopal -->
                  <g transform="translate(-70, -48)" class="pin-popup-group">
                    <rect width="140" height="34" rx="8" class="pin-popup-bg" fill="#080F26" stroke="#FF7A00" stroke-width="1.6" filter="url(#hubGlow)" />
                    <circle cx="13" cy="17" r="3.5" fill="#10B981" class="live-status-dot" />
                    <text x="24" y="16" class="pin-popup-title" font-family="'Inter', system-ui, sans-serif" font-size="9.5" font-weight="800" fill="#FFFFFF">BHOPAL (HQ)</text>
                    <text x="24" y="27" class="pin-popup-sub" font-family="'Inter', system-ui, sans-serif" font-size="7.2" font-weight="600" fill="#CBD5E1">Main Campus • Zone-II</text>
                  </g>
                </g>

                <!-- PIN 2: GWALIOR (NORTH REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(345, 75)" id="mapPinGwalior" data-center-index="1" data-center-id="gwalior" role="button" tabindex="0" aria-label="Gwalior Regional Center">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" class="pin-halo" />
                  <circle cx="0" cy="0" r="10" fill="rgba(56, 189, 248, 0.22)" class="pin-aura" />
                  <circle cx="0" cy="0" r="6.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" class="pin-beacon" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" class="pin-center-core" />
                  <!-- Floating Popup Badge to the RIGHT of Gwalior -->
                  <g transform="translate(14, -16)" class="pin-popup-group">
                    <rect width="96" height="32" rx="7" class="pin-popup-bg" fill="#080F26" stroke="rgba(56, 189, 248, 0.55)" stroke-width="1.3" />
                    <circle cx="11" cy="16" r="3" fill="#10B981" class="live-status-dot" />
                    <text x="19" y="14" class="pin-popup-title" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Gwalior</text>
                    <text x="19" y="25" class="pin-popup-sub" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">City Center</text>
                  </g>
                </g>

                <!-- PIN 3: JABALPUR (EAST REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin is-active" transform="translate(535, 225)" id="mapPinJabalpur" data-center-index="0" data-center-id="jabalpur" role="button" tabindex="0" aria-label="Jabalpur Regional Center">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" class="pin-halo" />
                  <circle cx="0" cy="0" r="10" fill="rgba(56, 189, 248, 0.22)" class="pin-aura" />
                  <circle cx="0" cy="0" r="6.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" class="pin-beacon" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" class="pin-center-core" />
                  <!-- Floating Popup Badge to the RIGHT of Jabalpur -->
                  <g transform="translate(14, -16)" class="pin-popup-group">
                    <rect width="98" height="32" rx="7" class="pin-popup-bg" fill="#080F26" stroke="rgba(56, 189, 248, 0.55)" stroke-width="1.3" />
                    <circle cx="11" cy="16" r="3" fill="#10B981" class="live-status-dot" />
                    <text x="19" y="14" class="pin-popup-title" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Jabalpur</text>
                    <text x="19" y="25" class="pin-popup-sub" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Napier Town</text>
                  </g>
                </g>

                <!-- PIN 4: NAGPUR (SOUTH REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(425, 405)" id="mapPinNagpur" data-center-index="4" data-center-id="nagpur" role="button" tabindex="0" aria-label="Nagpur Regional Center">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" class="pin-halo" />
                  <circle cx="0" cy="0" r="10" fill="rgba(56, 189, 248, 0.22)" class="pin-aura" />
                  <circle cx="0" cy="0" r="6.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" class="pin-beacon" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" class="pin-center-core" />
                  <!-- Floating Popup Badge to the RIGHT of Nagpur -->
                  <g transform="translate(14, -16)" class="pin-popup-group">
                    <rect width="98" height="32" rx="7" class="pin-popup-bg" fill="#080F26" stroke="rgba(56, 189, 248, 0.55)" stroke-width="1.3" />
                    <circle cx="11" cy="16" r="3" fill="#10B981" class="live-status-dot" />
                    <text x="19" y="14" class="pin-popup-title" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Nagpur</text>
                    <text x="19" y="25" class="pin-popup-sub" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Sitabuldi (MH)</text>
                  </g>
                </g>

                <!-- PIN 5: UJJAIN (WEST-SOUTHWEST REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(190, 275)" id="mapPinUjjain" data-center-index="3" data-center-id="ujjain" role="button" tabindex="0" aria-label="Ujjain Regional Center">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" class="pin-halo" />
                  <circle cx="0" cy="0" r="10" fill="rgba(56, 189, 248, 0.22)" class="pin-aura" />
                  <circle cx="0" cy="0" r="6.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" class="pin-beacon" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" class="pin-center-core" />
                  <!-- Floating Popup Badge to the LEFT of Ujjain -->
                  <g transform="translate(-104, -16)" class="pin-popup-group">
                    <rect width="92" height="32" rx="7" class="pin-popup-bg" fill="#080F26" stroke="rgba(56, 189, 248, 0.55)" stroke-width="1.3" />
                    <circle cx="11" cy="16" r="3" fill="#10B981" class="live-status-dot" />
                    <text x="19" y="14" class="pin-popup-title" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Ujjain</text>
                    <text x="19" y="25" class="pin-popup-sub" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Malipura</text>
                  </g>
                </g>

                <!-- PIN 6: RATLAM (WEST-NORTHWEST REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(95, 175)" id="mapPinRatlam" data-center-index="2" data-center-id="ratlam" role="button" tabindex="0" aria-label="Ratlam Regional Center">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" class="pin-halo" />
                  <circle cx="0" cy="0" r="10" fill="rgba(56, 189, 248, 0.22)" class="pin-aura" />
                  <circle cx="0" cy="0" r="6.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" class="pin-beacon" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" class="pin-center-core" />
                  <!-- Floating Popup Badge to the LEFT of Ratlam -->
                  <g transform="translate(-104, -16)" class="pin-popup-group">
                    <rect width="94" height="32" rx="7" class="pin-popup-bg" fill="#080F26" stroke="rgba(56, 189, 248, 0.55)" stroke-width="1.3" />
                    <circle cx="11" cy="16" r="3" fill="#10B981" class="live-status-dot" />
                    <text x="19" y="14" class="pin-popup-title" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Ratlam</text>
                    <text x="19" y="25" class="pin-popup-sub" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Station Rd</text>
                  </g>
                </g>`;

// Replace from <!-- PIN 1: BHOPAL to </svg>
const pinStartMarker = '<!-- PIN 1: BHOPAL';
const pinStartIdx = locHtml.indexOf(pinStartMarker);
const svgCloseIdx = locHtml.indexOf('</svg>', pinStartIdx);

locHtml = locHtml.substring(0, pinStartIdx) + updatedSvgNodes + '\r\n              ' + locHtml.substring(svgCloseIdx);
fs.writeFileSync('components/location/location.html', locHtml, 'utf8');
console.log('Rebuilt clean SVG pins in location.html');

// 2. UPDATE components/location/location.css
let locCss = fs.readFileSync('components/location/location.css', 'utf8');

// Replace the entire .map-campus-node section with zero transforms and pure popup enhancement
const cssTarget = '/* Campus Map Nodes & Interactive Pins */';
const cssStartIdx = locCss.indexOf(cssTarget);
const cssEndMarker = '/* ==========================================================================\r\n   INTERACTIVE CENTER INTELLIGENCE HUD CARD';
const cssEndIdx = locCss.indexOf(cssEndMarker);

const newMapNodeCss = `/* Campus Map Nodes & Interactive Floating Popups */
.map-campus-node {
  cursor: pointer;
  outline: none;
  transition: opacity 0.25s ease, filter 0.25s ease;
}

/* Individual SVG elements inside pin */
.pin-popup-bg {
  transition: fill 0.22s ease, stroke 0.22s ease, stroke-width 0.22s ease, filter 0.22s ease;
}

.pin-popup-title {
  transition: font-size 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill 0.2s ease, font-weight 0.2s ease;
}

.pin-popup-sub {
  transition: fill 0.2s ease, font-size 0.2s ease;
}

.pin-beacon {
  transition: r 0.22s cubic-bezier(0.16, 1, 0.3, 1), fill 0.22s ease, stroke 0.22s ease, stroke-width 0.22s ease;
}

.pin-halo {
  transition: r 0.22s ease, stroke 0.22s ease, stroke-width 0.22s ease, stroke-opacity 0.22s ease;
}

/* HOVER & ACTIVE INTERACTIVE POPUP — Text gets larger, brighter, and ultra-readable without ANY marker jump */
.map-campus-node:hover .pin-popup-bg,
.map-campus-node:focus-visible .pin-popup-bg,
.map-campus-node.is-active .pin-popup-bg {
  fill: #060D22;
  stroke: #38BDF8;
  stroke-width: 2px;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(56, 189, 248, 0.7));
}

.map-hub-group:hover .pin-popup-bg,
.map-hub-group:focus-visible .pin-popup-bg,
.map-hub-group.is-active .pin-popup-bg {
  stroke: #FF7A00;
  fill: #0B132B;
  filter: drop-shadow(0 4px 18px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 14px rgba(255, 122, 0, 0.8));
}

/* Text enlarges significantly on hover for maximum legibility */
.map-campus-node:hover .pin-popup-title,
.map-campus-node:focus-visible .pin-popup-title,
.map-campus-node.is-active .pin-popup-title {
  font-size: 11px;
  font-weight: 800;
  fill: #FFFFFF;
}

.map-hub-group:hover .pin-popup-title,
.map-hub-group:focus-visible .pin-popup-title,
.map-hub-group.is-active .pin-popup-title {
  font-size: 11.8px;
  font-weight: 900;
  fill: #FF9433;
}

.map-campus-node:hover .pin-popup-sub,
.map-campus-node:focus-visible .pin-popup-sub,
.map-campus-node.is-active .pin-popup-sub {
  font-size: 7.6px;
  font-weight: 600;
  fill: #F1F5F9;
}

.map-campus-node:hover .pin-beacon,
.map-campus-node:focus-visible .pin-beacon,
.map-campus-node.is-active .pin-beacon {
  r: 8px;
  fill: #38BDF8;
  stroke: #FFFFFF;
  stroke-width: 2.2px;
}

.map-hub-group:hover .pin-beacon,
.map-hub-group:focus-visible .pin-beacon,
.map-hub-group.is-active .pin-beacon {
  r: 11.5px;
  fill: #FF7A00;
  stroke: #FFFFFF;
  stroke-width: 2.8px;
}

.map-campus-node:hover .pin-halo,
.map-campus-node:focus-visible .pin-halo,
.map-campus-node.is-active .pin-halo {
  r: 22px;
  stroke: #38BDF8;
  stroke-width: 2px;
  stroke-opacity: 0.95;
}

.map-campus-node.is-dimmed {
  opacity: 0.22 !important;
  filter: grayscale(0.85) !important;
}

.pin-halo {
  animation: pinHaloPulse 2.4s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes pinHaloPulse {
  0%   { r: 14px; stroke-opacity: 0.35; }
  100% { r: 19px; stroke-opacity: 0.85; stroke-width: 1.6px; }
}

`;

if (cssStartIdx !== -1 && cssEndIdx !== -1) {
  locCss = locCss.substring(0, cssStartIdx) + newMapNodeCss + '\r\n' + locCss.substring(cssEndIdx);
}

// 3. Update Responsive Rules for mobile (smaller cards and compact layout)
const respTarget = '/* RESPONSIVE OPTIMIZATIONS */';
const respStartIdx = locCss.indexOf(respTarget);

const newResponsiveCss = `/* RESPONSIVE OPTIMIZATIONS — ULTRA MOBILE POLISHED */
@media (max-width: 992px) {
  .other-centers-showcase {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .other-centers-globe-col {
    order: 2;
  }

  .globe-showcase-card {
    max-width: 540px;
    margin: 0 auto;
  }

  .other-centers-3d-stage {
    height: 310px;
  }
}

@media (max-width: 768px) {
  /* Sleek & Compact 3D Stage on Mobile */
  .other-centers-3d-stage {
    height: 270px;
    perspective: 800px;
  }

  /* Compact, proportioned mobile cards */
  .other-center-card {
    width: 245px;
    height: 210px;
    margin-top: -105px;
    margin-left: -122px;
    padding: 0.85rem 0.95rem;
    border-radius: var(--radius-lg, 16px);
  }

  .other-center-top {
    margin-bottom: 0.35rem;
  }

  .other-center-city {
    font-size: 1.02rem;
  }

  .other-center-pill {
    font-size: 0.65rem;
    padding: 0.15rem 0.45rem;
  }

  .other-center-address {
    font-size: 0.76rem;
    line-height: 1.35;
    margin-bottom: 0.4rem;
  }

  .center-feat-tag {
    font-size: 0.65rem;
    padding: 0.12rem 0.42rem;
  }

  .other-center-features {
    gap: 0.3rem;
    margin-bottom: 0.45rem;
  }

  .other-center-contact {
    padding-top: 0.45rem;
    gap: 0.4rem;
  }

  .other-center-btn {
    font-size: 0.72rem;
    padding: 0.32rem 0.5rem;
  }

  .orbit-city-pill {
    font-size: 0.68rem;
    padding: 0.22rem 0.55rem;
  }

  /* Compact Mobile Location Info Card (Top Bhopal Card) */
  .location-info-card {
    padding: 1.25rem 1.15rem;
    border-radius: var(--radius-lg, 18px);
  }

  .location-heading {
    font-size: 1.35rem;
    margin-bottom: 1.25rem;
  }

  .info-block {
    gap: 0.85rem;
    margin-bottom: 1.1rem;
  }

  .info-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  /* Compact Network Map Showcase Card */
  .globe-showcase-card {
    padding: 0.95rem 1rem;
    border-radius: var(--radius-lg, 18px);
  }

  .map-card-header {
    margin-bottom: 0.5rem;
  }

  .map-filter-strip {
    margin-bottom: 0.6rem;
    gap: 0.3rem;
  }

  .map-filter-btn {
    font-size: 0.68rem;
    padding: 0.18rem 0.55rem;
  }

  .map-telemetry-hud {
    padding: 0.8rem 0.95rem;
    margin-top: 0.75rem;
  }

  .hud-center-title {
    font-size: 0.92rem;
  }

  .hud-center-sub {
    font-size: 0.72rem;
  }

  .hud-center-address {
    font-size: 0.74rem;
    line-height: 1.35;
    margin: 0.35rem 0;
  }

  .hud-pill-tag {
    font-size: 0.64rem;
    padding: 0.12rem 0.42rem;
  }

  .hud-actions-row {
    gap: 0.35rem;
    margin-top: 0.55rem;
  }

  .hud-btn {
    font-size: 0.72rem;
    padding: 0.3rem 0.55rem;
  }
}

@media (max-width: 480px) {
  .other-centers-header {
    margin-bottom: 1.5rem;
  }

  .other-centers-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.7rem;
    margin-bottom: 0.6rem;
  }

  .other-centers-title {
    font-size: 1.35rem;
    margin-bottom: 0.4rem;
  }

  .other-centers-sub {
    font-size: 0.84rem;
    line-height: 1.45;
  }

  .other-centers-3d-stage {
    height: 255px;
    perspective: 750px;
  }

  /* Ultra-sleek cards on small mobile */
  .other-center-card {
    width: 230px;
    height: 198px;
    margin-top: -99px;
    margin-left: -115px;
    padding: 0.75rem 0.85rem;
  }

  .other-center-city {
    font-size: 0.95rem;
  }

  .other-center-pill {
    font-size: 0.62rem;
    padding: 0.12rem 0.4rem;
  }

  .other-center-address {
    font-size: 0.72rem;
    line-height: 1.3;
    margin-bottom: 0.35rem;
  }

  .other-center-features {
    gap: 0.25rem;
    margin-bottom: 0.4rem;
  }

  .center-feat-tag {
    font-size: 0.62rem;
    padding: 0.1rem 0.38rem;
  }

  .other-center-contact {
    padding-top: 0.4rem;
    gap: 0.35rem;
  }

  .other-center-btn {
    font-size: 0.68rem;
    padding: 0.28rem 0.45rem;
  }

  .globe-showcase-card {
    padding: 0.85rem;
  }
}

@media (max-width: 360px) {
  .other-center-card {
    width: 215px;
    height: 192px;
    margin-top: -96px;
    margin-left: -107px;
    padding: 0.65rem 0.75rem;
  }

  .other-center-city {
    font-size: 0.9rem;
  }

  .other-center-address {
    font-size: 0.68rem;
    line-height: 1.25;
  }
}
`;

if (respStartIdx !== -1) {
  locCss = locCss.substring(0, respStartIdx) + newResponsiveCss;
}

fs.writeFileSync('components/location/location.css', locCss, 'utf8');
console.log('Updated location.css with zero transforms and compact mobile styles.');

// 4. UPDATE components/location/location.js
let locJs = fs.readFileSync('components/location/location.js', 'utf8');

// Update radius for smaller cards
const oldRadiusLogic = `    const w = window.innerWidth;
    if (w <= 480) {
      radius = 180;
    } else if (w <= 768) {
      radius = 210;
    } else if (w <= 1024) {
      radius = 230;
    } else {
      radius = 260;
    }`;

const newRadiusLogic = `    const w = window.innerWidth;
    if (w <= 360) {
      radius = 160;
    } else if (w <= 480) {
      radius = 175;
    } else if (w <= 768) {
      radius = 195;
    } else if (w <= 1024) {
      radius = 220;
    } else {
      radius = 260;
    }`;

locJs = locJs.replace(oldRadiusLogic, newRadiusLogic);
fs.writeFileSync('components/location/location.js', locJs, 'utf8');
console.log('Updated location.js carousel radius for smaller mobile cards.');
