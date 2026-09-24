const fs = require('fs');

console.log('--- APPLYING FULL REGIONAL MAP UPGRADE (CSS + JS) ---');

// 1. UPDATE location.css
function updateLocationCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, 'utf8');
  const eol = css.includes('\r\n') ? '\r\n' : '\n';

  // Find start of /* RIGHT COLUMN: 3D Rotating World Globe */ or /* RIGHT COLUMN: 2D Regional Network Map */
  const targetHeader = '/* RIGHT COLUMN: 3D Rotating World Globe */';
  const targetEnd = '/* RESPONSIVE OPTIMIZATIONS */';

  const startIdx = css.indexOf(targetHeader);
  const endIdx = css.indexOf(targetEnd);

  if (startIdx === -1 || endIdx === -1) {
    console.error(`[ERROR] CSS bounds not found in ${filePath}`);
    return;
  }

  const newMapCss = `/* ==========================================================================${eol}` +
`   RIGHT COLUMN: INTERACTIVE CENTRAL INDIA NETWORK MAP & COMMAND DECK${eol}` +
`   High-tech telemetry, animated data beams, radar scan, and dynamic HUD sync${eol}` +
`   ========================================================================== */${eol}` +
`.other-centers-globe-col {${eol}` +
`  display: flex;${eol}` +
`  flex-direction: column;${eol}` +
`  align-items: center;${eol}` +
`  justify-content: flex-start;${eol}` +
`  min-width: 0;${eol}` +
`  width: 100%;${eol}` +
`}${eol}${eol}` +
`.globe-showcase-card {${eol}` +
`  width: 100%;${eol}` +
`  max-width: 500px;${eol}` +
`  background: rgba(11, 17, 33, 0.94);${eol}` +
`  border: 1px solid rgba(255, 255, 255, 0.1);${eol}` +
`  border-radius: var(--radius-xl, 24px);${eol}` +
`  padding: 1.25rem 1.35rem;${eol}` +
`  display: flex;${eol}` +
`  flex-direction: column;${eol}` +
`  position: relative;${eol}` +
`  backdrop-filter: blur(16px);${eol}` +
`  -webkit-backdrop-filter: blur(16px);${eol}` +
`  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.08);${eol}` +
`  box-sizing: border-box;${eol}` +
`}${eol}${eol}` +
`.globe-header-strip {${eol}` +
`  width: 100%;${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  justify-content: space-between;${eol}` +
`  margin-bottom: 0.65rem;${eol}` +
`}${eol}${eol}` +
`.globe-status-pill {${eol}` +
`  display: inline-flex;${eol}` +
`  align-items: center;${eol}` +
`  gap: 0.45rem;${eol}` +
`  font-family: var(--font-sans);${eol}` +
`  font-size: 0.72rem;${eol}` +
`  font-weight: 700;${eol}` +
`  color: #FF9433;${eol}` +
`  background: rgba(255, 122, 0, 0.1);${eol}` +
`  border: 1px solid rgba(255, 122, 0, 0.28);${eol}` +
`  padding: 0.25rem 0.65rem;${eol}` +
`  border-radius: var(--radius-full, 9999px);${eol}` +
`}${eol}${eol}` +
`.globe-radar-ping {${eol}` +
`  width: 6px;${eol}` +
`  height: 6px;${eol}` +
`  border-radius: 50%;${eol}` +
`  background: #FF7A00;${eol}` +
`  box-shadow: 0 0 8px #FF7A00;${eol}` +
`  animation: pulseBeacon 1.8s infinite ease-in-out;${eol}` +
`}${eol}${eol}` +
`.map-live-telemetry {${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  gap: 0.4rem;${eol}` +
`}${eol}${eol}` +
`.live-signal-badge {${eol}` +
`  width: 6px;${eol}` +
`  height: 6px;${eol}` +
`  border-radius: 50%;${eol}` +
`  background: #10B981;${eol}` +
`  box-shadow: 0 0 8px #10B981;${eol}` +
`  animation: pulseDot 2s infinite;${eol}` +
`}${eol}${eol}` +
`.globe-telemetry {${eol}` +
`  font-family: var(--font-sans);${eol}` +
`  font-size: 0.7rem;${eol}` +
`  color: #94A3B8;${eol}` +
`  letter-spacing: 0.04em;${eol}` +
`  font-weight: 600;${eol}` +
`}${eol}${eol}` +
`/* Interactive Map Category Filter Strip */${eol}` +
`.map-filter-strip {${eol}` +
`  width: 100%;${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  gap: 0.4rem;${eol}` +
`  overflow-x: auto;${eol}` +
`  scrollbar-width: none;${eol}` +
`  margin-bottom: 0.75rem;${eol}` +
`  padding-bottom: 0.2rem;${eol}` +
`}${eol}` +
`.map-filter-strip::-webkit-scrollbar { display: none; }${eol}${eol}` +
`.map-filter-btn {${eol}` +
`  background: rgba(255, 255, 255, 0.04);${eol}` +
`  border: 1px solid rgba(255, 255, 255, 0.1);${eol}` +
`  color: #94A3B8;${eol}` +
`  font-family: var(--font-sans);${eol}` +
`  font-size: 0.72rem;${eol}` +
`  font-weight: 600;${eol}` +
`  padding: 0.22rem 0.65rem;${eol}` +
`  border-radius: var(--radius-full, 9999px);${eol}` +
`  cursor: pointer;${eol}` +
`  white-space: nowrap;${eol}` +
`  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);${eol}` +
`}${eol}${eol}` +
`.map-filter-btn:hover {${eol}` +
`  color: #FFFFFF;${eol}` +
`  background: rgba(255, 255, 255, 0.1);${eol}` +
`  border-color: rgba(255, 255, 255, 0.25);${eol}` +
`}${eol}${eol}` +
`.map-filter-btn.is-active {${eol}` +
`  color: #FF9433;${eol}` +
`  background: rgba(255, 122, 0, 0.16);${eol}` +
`  border-color: #FF7A00;${eol}` +
`  box-shadow: 0 0 10px rgba(255, 122, 0, 0.3);${eol}` +
`}${eol}${eol}` +
`/* 2D India Regional SVG Map Viewport */${eol}` +
`.india-map-viewport {${eol}` +
`  position: relative;${eol}` +
`  width: 100%;${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  justify-content: center;${eol}` +
`  user-select: none;${eol}` +
`}${eol}${eol}` +
`.india-network-svg {${eol}` +
`  width: 100%;${eol}` +
`  height: auto;${eol}` +
`  max-height: 380px;${eol}` +
`  display: block;${eol}` +
`  border-radius: var(--radius-lg, 16px);${eol}` +
`  filter: drop-shadow(0 14px 32px rgba(0, 0, 0, 0.55));${eol}` +
`}${eol}${eol}` +
`/* Animated Radar Sweep around Bhopal HQ (240, 195) */${eol}` +
`.radar-scan-arm {${eol}` +
`  transform-origin: 240px 195px;${eol}` +
`  animation: radarScanSweep 8.5s linear infinite;${eol}` +
`  pointer-events: none;${eol}` +
`}${eol}${eol}` +
`@keyframes radarScanSweep {${eol}` +
`  from { transform: rotate(0deg); }${eol}` +
`  to   { transform: rotate(360deg); }${eol}` +
`}${eol}${eol}` +
`/* Concentric Pulsing Radar Waves on Bhopal HQ */${eol}` +
`.hub-pulse-wave.hub-pulse-1 {${eol}` +
`  animation: hubRadarPulse 2.8s ease-out infinite;${eol}` +
`  transform-origin: center;${eol}` +
`  pointer-events: none;${eol}` +
`}${eol}${eol}` +
`.hub-pulse-wave.hub-pulse-2 {${eol}` +
`  animation: hubRadarPulse 2.8s ease-out infinite 1.4s;${eol}` +
`  transform-origin: center;${eol}` +
`  pointer-events: none;${eol}` +
`}${eol}${eol}` +
`@keyframes hubRadarPulse {${eol}` +
`  0%   { r: 12px; opacity: 0.95; }${eol}` +
`  100% { r: 38px; opacity: 0; }${eol}` +
`}${eol}${eol}` +
`/* Telemetry Circuit Lines & Flow */${eol}` +
`.telemetry-circuit-lines path {${eol}` +
`  stroke-dasharray: 6,4;${eol}` +
`  animation: telemetryFlow 18s linear infinite;${eol}` +
`  pointer-events: none;${eol}` +
`}${eol}${eol}` +
`@keyframes telemetryFlow {${eol}` +
`  from { stroke-dashoffset: 120; }${eol}` +
`  to   { stroke-dashoffset: 0; }${eol}` +
`}${eol}${eol}` +
`/* Campus Map Nodes & Interactive Pins */${eol}` +
`.map-campus-node {${eol}` +
`  cursor: pointer;${eol}` +
`  outline: none;${eol}` +
`  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), filter 0.28s ease, opacity 0.28s ease;${eol}` +
`}${eol}${eol}` +
`.map-campus-node:hover,${eol}` +
`.map-campus-node:focus-visible,${eol}` +
`.map-campus-node.is-active {${eol}` +
`  transform: scale(1.12);${eol}` +
`  filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.95));${eol}` +
`}${eol}${eol}` +
`.map-hub-group:hover,${eol}` +
`.map-hub-group:focus-visible,${eol}` +
`.map-hub-group.is-active {${eol}` +
`  transform: scale(1.12);${eol}` +
`  filter: drop-shadow(0 0 18px rgba(255, 122, 0, 0.95));${eol}` +
`}${eol}${eol}` +
`.map-campus-node.is-dimmed {${eol}` +
`  opacity: 0.22 !important;${eol}` +
`  filter: grayscale(0.85) !important;${eol}` +
`}${eol}${eol}` +
`.pin-halo {${eol}` +
`  animation: pinHaloPulse 2.4s ease-in-out infinite alternate;${eol}` +
`  transform-origin: center;${eol}` +
`}${eol}${eol}` +
`@keyframes pinHaloPulse {${eol}` +
`  0%   { r: 12px; stroke-opacity: 0.35; }${eol}` +
`  100% { r: 17px; stroke-opacity: 0.85; stroke-width: 1.6px; }${eol}` +
`}${eol}${eol}` +
`/* Pin Tag Hover / Focus Highlight */${eol}` +
`.map-campus-node:hover rect,${eol}` +
`.map-campus-node.is-active rect {${eol}` +
`  stroke: #38BDF8;${eol}` +
`  fill: #0F1D38;${eol}` +
`}${eol}${eol}` +
`.map-hub-group:hover rect,${eol}` +
`.map-hub-group.is-active rect {${eol}` +
`  stroke: #FF7A00;${eol}` +
`  fill: #151F36;${eol}` +
`}${eol}${eol}` +
`/* ==========================================================================${eol}` +
`   INTERACTIVE CENTER INTELLIGENCE HUD CARD${eol}` +
`   ========================================================================== */${eol}` +
`.map-telemetry-hud {${eol}` +
`  width: 100%;${eol}` +
`  margin-top: 0.9rem;${eol}` +
`  background: rgba(11, 18, 33, 0.96);${eol}` +
`  border: 1px solid rgba(56, 189, 248, 0.28);${eol}` +
`  border-top: 2px solid #FF7A00;${eol}` +
`  border-radius: var(--radius-lg, 16px);${eol}` +
`  padding: 0.95rem 1.15rem;${eol}` +
`  box-shadow: 0 12px 30px -6px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 122, 0, 0.12);${eol}` +
`  transition: border-color 0.3s ease, box-shadow 0.3s ease;${eol}` +
`  box-sizing: border-box;${eol}` +
`  animation: hudReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1);${eol}` +
`}${eol}${eol}` +
`@keyframes hudReveal {${eol}` +
`  from { opacity: 0; transform: translateY(6px); }${eol}` +
`  to   { opacity: 1; transform: translateY(0); }${eol}` +
`}${eol}${eol}` +
`.map-telemetry-hud.is-hq {${eol}` +
`  border-color: rgba(255, 122, 0, 0.45);${eol}` +
`  border-top: 2px solid #FF7A00;${eol}` +
`  box-shadow: 0 12px 32px -6px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 122, 0, 0.22);${eol}` +
`}${eol}${eol}` +
`.hud-top-row {${eol}` +
`  display: flex;${eol}` +
`  align-items: flex-start;${eol}` +
`  justify-content: space-between;${eol}` +
`  gap: 0.75rem;${eol}` +
`  margin-bottom: 0.45rem;${eol}` +
`}${eol}${eol}` +
`.hud-identity {${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  gap: 0.55rem;${eol}` +
`}${eol}${eol}` +
`.hud-pulse-dot {${eol}` +
`  width: 8px;${eol}` +
`  height: 8px;${eol}` +
`  border-radius: 50%;${eol}` +
`  background: #10B981;${eol}` +
`  box-shadow: 0 0 10px #10B981;${eol}` +
`  flex-shrink: 0;${eol}` +
`  animation: pulseDot 2s infinite;${eol}` +
`}${eol}${eol}` +
`.hud-center-title {${eol}` +
`  font-size: 0.98rem;${eol}` +
`  font-weight: 700;${eol}` +
`  color: #F8FAFC;${eol}` +
`  margin: 0;${eol}` +
`  line-height: 1.25;${eol}` +
`  letter-spacing: -0.015em;${eol}` +
`}${eol}${eol}` +
`.hud-center-sub {${eol}` +
`  font-size: 0.72rem;${eol}` +
`  color: #38BDF8;${eol}` +
`  display: block;${eol}` +
`  margin-top: 0.15rem;${eol}` +
`  font-weight: 500;${eol}` +
`}${eol}${eol}` +
`.hud-badge-status {${eol}` +
`  font-size: 0.68rem;${eol}` +
`  font-weight: 700;${eol}` +
`  color: #10B981;${eol}` +
`  background: rgba(16, 185, 129, 0.12);${eol}` +
`  border: 1px solid rgba(16, 185, 129, 0.3);${eol}` +
`  padding: 0.18rem 0.55rem;${eol}` +
`  border-radius: var(--radius-full, 9999px);${eol}` +
`  white-space: nowrap;${eol}` +
`  letter-spacing: 0.02em;${eol}` +
`}${eol}${eol}` +
`.hud-center-address {${eol}` +
`  font-size: 0.78rem;${eol}` +
`  color: #94A3B8;${eol}` +
`  line-height: 1.45;${eol}` +
`  margin: 0 0 0.55rem 0;${eol}` +
`}${eol}${eol}` +
`.hud-pills-row {${eol}` +
`  display: flex;${eol}` +
`  flex-wrap: wrap;${eol}` +
`  gap: 0.35rem;${eol}` +
`  margin-bottom: 0.75rem;${eol}` +
`}${eol}${eol}` +
`.hud-pill-tag {${eol}` +
`  font-size: 0.68rem;${eol}` +
`  font-weight: 600;${eol}` +
`  color: #CBD5E1;${eol}` +
`  background: rgba(255, 255, 255, 0.05);${eol}` +
`  border: 1px solid rgba(255, 255, 255, 0.1);${eol}` +
`  padding: 0.15rem 0.48rem;${eol}` +
`  border-radius: 6px;${eol}` +
`}${eol}${eol}` +
`.hud-actions-row {${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  gap: 0.45rem;${eol}` +
`  flex-wrap: wrap;${eol}` +
`}${eol}${eol}` +
`.hud-btn {${eol}` +
`  display: inline-flex;${eol}` +
`  align-items: center;${eol}` +
`  gap: 0.35rem;${eol}` +
`  font-size: 0.75rem;${eol}` +
`  padding: 0.36rem 0.7rem;${eol}` +
`  border-radius: var(--radius-sm, 8px);${eol}` +
`  text-decoration: none;${eol}` +
`  cursor: pointer;${eol}` +
`  font-weight: 600;${eol}` +
`  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);${eol}` +
`}${eol}${eol}` +
`.hud-icon {${eol}` +
`  width: 13px;${eol}` +
`  height: 13px;${eol}` +
`  stroke: currentColor;${eol}` +
`  flex-shrink: 0;${eol}` +
`}${eol}${eol}` +
`.hud-sync-trigger {${eol}` +
`  background: rgba(255, 122, 0, 0.14);${eol}` +
`  color: #FF9433;${eol}` +
`  border: 1px solid rgba(255, 122, 0, 0.35);${eol}` +
`}${eol}${eol}` +
`.hud-sync-trigger:hover {${eol}` +
`  background: #FF7A00;${eol}` +
`  color: #FFFFFF;${eol}` +
`  border-color: #FF7A00;${eol}` +
`  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.35);${eol}` +
`}${eol}${eol}` +
`.globe-metrics-bar {${eol}` +
`  width: 100%;${eol}` +
`  display: flex;${eol}` +
`  align-items: center;${eol}` +
`  justify-content: space-around;${eol}` +
`  margin-top: 0.85rem;${eol}` +
`  padding-top: 0.75rem;${eol}` +
`  border-top: 1px solid rgba(255, 255, 255, 0.07);${eol}` +
`}${eol}${eol}` +
`.globe-metric-col {${eol}` +
`  text-align: center;${eol}` +
`}${eol}${eol}` +
`.globe-metric-num {${eol}` +
`  display: block;${eol}` +
`  font-size: 1.15rem;${eol}` +
`  font-weight: 800;${eol}` +
`  color: #F8FAFC;${eol}` +
`  letter-spacing: -0.02em;${eol}` +
`}${eol}${eol}` +
`.globe-metric-lbl {${eol}` +
`  display: block;${eol}` +
`  font-size: 0.68rem;${eol}` +
`  color: #94A3B8;${eol}` +
`  font-family: var(--font-sans);${eol}` +
`  text-transform: uppercase;${eol}` +
`  letter-spacing: 0.04em;${eol}` +
`}${eol}${eol}` +
`.globe-metric-sep {${eol}` +
`  width: 1px;${eol}` +
`  height: 24px;${eol}` +
`  background: rgba(255, 255, 255, 0.1);${eol}` +
`}${eol}${eol}`;

  css = css.substring(0, startIdx) + newMapCss + css.substring(endIdx);
  fs.writeFileSync(filePath, css, 'utf8');
  console.log(`[UPDATED CSS] ${filePath}`);
}

updateLocationCss('components/location/location.css');
if (fs.existsSync('miracle-it-career-academy/components/location/location.css')) {
  updateLocationCss('miracle-it-career-academy/components/location/location.css');
}
