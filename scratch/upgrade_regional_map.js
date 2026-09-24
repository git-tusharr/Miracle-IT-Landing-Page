const fs = require('fs');

console.log('--- UPGRADING REGIONAL NETWORK MAP ---');

// 1. UPDATE location.html
function updateLocationHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';

  // Target the entire <div class="other-centers-map-col other-centers-globe-col"> block up to </section>
  const startTag = '<div class="other-centers-map-col other-centers-globe-col">';
  const endTag = '</div>\r\n\r\n      </div>\r\n    </div>\r\n\r\n  </div>\r\n</section>';
  const endTagLf = '</div>\n\n      </div>\n    </div>\n\n  </div>\n</section>';

  const startIdx = content.indexOf(startTag);
  let endIdx = content.indexOf(endTag, startIdx);
  if (endIdx === -1) endIdx = content.indexOf(endTagLf, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.error(`[ERROR] Bounds not found in ${filePath}`);
    return;
  }

  const newMapHtml = `<div class="other-centers-map-col other-centers-globe-col">${eol}` +
`          <div class="india-map-card globe-showcase-card">${eol}` +
`            <div class="map-card-header globe-header-strip">${eol}` +
`              <div class="globe-status-pill">${eol}` +
`                <span class="globe-radar-ping"></span>${eol}` +
`                <span>Central India Network</span>${eol}` +
`              </div>${eol}` +
`              <div class="map-live-telemetry">${eol}` +
`                <span class="live-signal-badge"></span>${eol}` +
`                <span class="globe-telemetry">6 Connected Hubs</span>${eol}` +
`              </div>${eol}` +
`            </div>${eol}` +
`${eol}` +
`            <!-- Interactive Hub Category Filter Strip -->${eol}` +
`            <div class="map-filter-strip" role="tablist" aria-label="Campus Network Filter">${eol}` +
`              <button type="button" class="map-filter-btn is-active" data-filter="all">All Hubs (6)</button>${eol}` +
`              <button type="button" class="map-filter-btn" data-filter="bhopal">Bhopal (HQ)</button>${eol}` +
`              <button type="button" class="map-filter-btn" data-filter="mp">MP Centers (4)</button>${eol}` +
`              <button type="button" class="map-filter-btn" data-filter="mh">Nagpur (MH)</button>${eol}` +
`            </div>${eol}` +
`${eol}` +
`            <!-- 2D India Regional SVG Map Viewport -->${eol}` +
`            <div class="india-map-viewport" id="indiaMapViewport" title="Interactive Central India Campus Network — Click pins to inspect hubs">${eol}` +
`              <svg class="india-network-svg" viewBox="0 0 500 390" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Miracle IT Central India Campus Network Map">${eol}` +
`                <defs>${eol}` +
`                  <!-- Map Deep Obsidian Background Gradient -->${eol}` +
`                  <linearGradient id="mapBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">${eol}` +
`                    <stop offset="0%" stop-color="#060A17" />${eol}` +
`                    <stop offset="50%" stop-color="#091024" />${eol}` +
`                    <stop offset="100%" stop-color="#0D1630" />${eol}` +
`                  </linearGradient>${eol}` +
`${eol}` +
`                  <!-- Glowing State Border Gradient -->${eol}` +
`                  <linearGradient id="mpBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">${eol}` +
`                    <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.85" />${eol}` +
`                    <stop offset="50%" stop-color="#FF7A00" stop-opacity="0.85" />${eol}` +
`                    <stop offset="100%" stop-color="#0284C7" stop-opacity="0.85" />${eol}` +
`                  </linearGradient>${eol}` +
`${eol}` +
`                  <!-- Central India Highlight Gradient Fill -->${eol}` +
`                  <radialGradient id="centralIndiaGlow" cx="48%" cy="50%" r="55%">${eol}` +
`                    <stop offset="0%" stop-color="rgba(37, 99, 235, 0.2)" />${eol}` +
`                    <stop offset="55%" stop-color="rgba(14, 165, 233, 0.07)" />${eol}` +
`                    <stop offset="100%" stop-color="rgba(15, 23, 42, 0.01)" />${eol}` +
`                  </radialGradient>${eol}` +
`${eol}` +
`                  <!-- Radar Sweep Cone Gradient -->${eol}` +
`                  <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">${eol}` +
`                    <stop offset="0%" stop-color="rgba(255, 122, 0, 0.26)" />${eol}` +
`                    <stop offset="60%" stop-color="rgba(255, 122, 0, 0.06)" />${eol}` +
`                    <stop offset="100%" stop-color="rgba(255, 122, 0, 0)" />${eol}` +
`                  </linearGradient>${eol}` +
`${eol}` +
`                  <!-- Node Bloom Glow Filter -->${eol}` +
`                  <filter id="hubGlow" x="-30%" y="-30%" width="160%" height="160%">${eol}` +
`                    <feGaussianBlur stdDeviation="4.5" result="blur" />${eol}` +
`                    <feComposite in="SourceGraphic" in2="blur" operator="over" />${eol}` +
`                  </filter>${eol}` +
`${eol}` +
`                  <filter id="nodeGlow" x="-40%" y="-40%" width="180%" height="180%">${eol}` +
`                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />${eol}` +
`                    <feMerge>${eol}` +
`                      <feMergeNode in="blur" />${eol}` +
`                      <feMergeNode in="SourceGraphic" />${eol}` +
`                    </feMerge>${eol}` +
`                  </filter>${eol}` +
`${eol}` +
`                  <!-- Cyber Grid Dot Matrix -->${eol}` +
`                  <pattern id="networkDotGrid" width="22" height="22" patternUnits="userSpaceOnUse">${eol}` +
`                    <circle cx="11" cy="11" r="0.75" fill="rgba(255, 255, 255, 0.08)" />${eol}` +
`                  </pattern>${eol}` +
`                </defs>${eol}` +
`${eol}` +
`                <!-- Map Canvas Frame -->${eol}` +
`                <rect width="500" height="390" rx="18" fill="url(#mapBgGrad)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.2" />${eol}` +
`                <rect width="500" height="390" fill="url(#networkDotGrid)" />${eol}` +
`${eol}` +
`                <!-- Geographic Grid Crosshairs -->${eol}` +
`                <g stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" stroke-dasharray="3,4">${eol}` +
`                  <line x1="30" y1="90" x2="470" y2="90" />${eol}` +
`                  <line x1="30" y1="195" x2="470" y2="195" />${eol}` +
`                  <line x1="30" y1="305" x2="470" y2="305" />${eol}` +
`                  <line x1="110" y1="20" x2="110" y2="370" />${eol}` +
`                  <line x1="240" y1="20" x2="240" y2="370" />${eol}` +
`                  <line x1="375" y1="20" x2="375" y2="370" />${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- Coordinate Labels -->${eol}` +
`                <g font-family="monospace" font-size="7.5" fill="rgba(148, 163, 184, 0.45)">${eol}` +
`                  <text x="12" y="93">26°N</text>${eol}` +
`                  <text x="12" y="198">23°N</text>${eol}` +
`                  <text x="12" y="308">21°N</text>${eol}` +
`                  <text x="102" y="16">75°E</text>${eol}` +
`                  <text x="232" y="16">77°E</text>${eol}` +
`                  <text x="367" y="16">80°E</text>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- Surrounding States & Context Outlines -->${eol}` +
`                <g fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1">${eol}` +
`                  <path d="M 40,80 Q 70,130 50,220 Q 30,270 50,330" />${eol}` +
`                  <text x="45" y="115" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="600" fill="rgba(148, 163, 184, 0.3)" letter-spacing="0.08em">RAJASTHAN / GUJARAT</text>${eol}` +
`                  <path d="M 170,40 Q 280,30 400,65" />${eol}` +
`                  <text x="310" y="55" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="600" fill="rgba(148, 163, 184, 0.3)" letter-spacing="0.08em">UTTAR PRADESH</text>${eol}` +
`                  <path d="M 120,290 Q 230,280 380,270" stroke="rgba(255, 255, 255, 0.09)" stroke-dasharray="3,3" />${eol}` +
`                  <text x="360" y="265" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="600" fill="rgba(148, 163, 184, 0.4)">MP / MH BORDER</text>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- Stylized Central India Topographic Silhouette -->${eol}` +
`                <path class="region-highlight-shape"${eol}` +
`                      d="M 195,45 ${eol}` +
`                         C 230,35 265,55 285,75 ${eol}` +
`                         C 305,105 340,110 385,125 ${eol}` +
`                         C 425,145 448,180 445,215 ${eol}` +
`                         C 440,245 410,270 370,282 ${eol}` +
`                         C 335,292 320,335 285,348 ${eol}` +
`                         C 255,355 235,335 210,320 ${eol}` +
`                         C 180,308 150,302 125,288 ${eol}` +
`                         C 90,268 65,235 70,192 ${eol}` +
`                         C 75,152 105,138 135,122 ${eol}` +
`                         C 162,108 178,72 195,45 Z"${eol}` +
`                      fill="url(#centralIndiaGlow)"${eol}` +
`                      stroke="url(#mpBorderGrad)"${eol}` +
`                      stroke-width="1.8"${eol}` +
`                      stroke-dasharray="8,4"${eol}` +
`                      filter="url(#nodeGlow)" />${eol}` +
`${eol}` +
`                <!-- Animated Radar Scan Beam originating from Bhopal HQ (240, 195) -->${eol}` +
`                <g class="radar-scan-arm">${eol}` +
`                  <path d="M 240,195 L 375,105 A 150,150 0 0,1 390,225 Z" fill="url(#radarSweepGrad)" />${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- Arterial Transit Corridors & Network Telemetry Lines -->${eol}` +
`                <g fill="none" stroke="rgba(56, 189, 248, 0.18)" stroke-width="3.5">${eol}` +
`                  <path d="M 240,195 Q 242,135 248,80" />${eol}` +
`                  <path d="M 240,195 Q 310,198 375,205" />${eol}` +
`                  <path d="M 240,195 Q 200,198 165,200" />${eol}` +
`                  <path d="M 165,200 Q 135,195 105,190" />${eol}` +
`                  <path d="M 240,195 Q 270,255 295,310" />${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- High-Tech Neon Pulse Corridors -->${eol}` +
`                <g fill="none" stroke="#38BDF8" stroke-width="1.6" class="telemetry-circuit-lines">${eol}` +
`                  <path d="M 240,195 Q 242,135 248,80" class="telemetry-line" />${eol}` +
`                  <path d="M 240,195 Q 310,198 375,205" class="telemetry-line" />${eol}` +
`                  <path d="M 240,195 Q 200,198 165,200" class="telemetry-line" />${eol}` +
`                  <path d="M 165,200 Q 135,195 105,190" class="telemetry-line" />${eol}` +
`                  <path d="M 240,195 Q 270,255 295,310" class="telemetry-line" />${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- Luminous Moving Data Packets (Bhopal HQ <-> Regional Centers) -->${eol}` +
`                <g class="network-data-packets">${eol}` +
`                  <circle r="3" fill="#FF9433" filter="url(#nodeGlow)">${eol}` +
`                    <animateMotion dur="2.4s" repeatCount="indefinite" path="M 240,195 Q 242,135 248,80" />${eol}` +
`                  </circle>${eol}` +
`                  <circle r="3" fill="#38BDF8" filter="url(#nodeGlow)">${eol}` +
`                    <animateMotion dur="2.6s" repeatCount="indefinite" path="M 240,195 Q 310,198 375,205" />${eol}` +
`                  </circle>${eol}` +
`                  <circle r="3" fill="#38BDF8" filter="url(#nodeGlow)">${eol}` +
`                    <animateMotion dur="2.2s" repeatCount="indefinite" path="M 240,195 Q 200,198 165,200" />${eol}` +
`                  </circle>${eol}` +
`                  <circle r="3" fill="#38BDF8" filter="url(#nodeGlow)">${eol}` +
`                    <animateMotion dur="2.8s" repeatCount="indefinite" path="M 165,200 Q 135,195 105,190" />${eol}` +
`                  </circle>${eol}` +
`                  <circle r="3" fill="#FF9433" filter="url(#nodeGlow)">${eol}` +
`                    <animateMotion dur="2.7s" repeatCount="indefinite" path="M 240,195 Q 270,255 295,310" />${eol}` +
`                  </circle>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- PIN 1: BHOPAL (HEADQUARTERS & MAIN CAMPUS) -->${eol}` +
`                <g class="map-campus-node map-hub-group" transform="translate(240, 195)" id="mapPinBhopal" role="button" tabindex="0" aria-label="Bhopal Headquarters & Main Campus" data-center-id="bhopal">${eol}` +
`                  <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(255, 122, 0, 0.45)" stroke-width="1.5" class="hub-pulse-wave hub-pulse-1" />${eol}` +
`                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(255, 122, 0, 0.65)" stroke-width="1.8" class="hub-pulse-wave hub-pulse-2" />${eol}` +
`                  <circle cx="0" cy="0" r="14" fill="rgba(255, 122, 0, 0.22)" />${eol}` +
`                  <circle cx="0" cy="0" r="8.5" fill="#FF7A00" stroke="#FFFFFF" stroke-width="2.5" filter="url(#nodeGlow)" />${eol}` +
`                  <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />${eol}` +
`                  <g transform="translate(-65, -42)" class="hub-label-bubble">${eol}` +
`                    <rect width="130" height="28" rx="6" fill="#0B132B" stroke="#FF7A00" stroke-width="1.5" filter="url(#hubGlow)" />${eol}` +
`                    <circle cx="12" cy="14" r="3.5" fill="#10B981" class="live-status-dot" />${eol}` +
`                    <text x="21" y="13" font-family="'Inter', system-ui, sans-serif" font-size="8.5" font-weight="800" fill="#FFFFFF">BHOPAL (HQ)</text>${eol}` +
`                    <text x="21" y="22" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="600" fill="#CBD5E1">Main Campus • Zone-II</text>${eol}` +
`                  </g>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- PIN 2: GWALIOR (REGIONAL CENTER - NORTH) -->${eol}` +
`                <g class="map-campus-node map-regional-pin" transform="translate(248, 80)" id="mapPinGwalior" data-center-index="1" data-center-id="gwalior" role="button" tabindex="0" aria-label="Gwalior Regional Center">${eol}` +
`                  <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" class="pin-halo" />${eol}` +
`                  <circle cx="0" cy="0" r="8" fill="rgba(56, 189, 248, 0.2)" />${eol}` +
`                  <circle cx="0" cy="0" r="5.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.8" filter="url(#nodeGlow)" />${eol}` +
`                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />${eol}` +
`                  <g transform="translate(10, -11)" class="pin-tag-group">${eol}` +
`                    <rect width="78" height="24" rx="5" fill="#0B132B" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1" />${eol}` +
`                    <circle cx="8" cy="12" r="2.5" fill="#10B981" />${eol}` +
`                    <text x="15" y="11" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF">Gwalior</text>${eol}` +
`                    <text x="15" y="19" font-family="'Inter', system-ui, sans-serif" font-size="6.5" font-weight="500" fill="#94A3B8">City Center</text>${eol}` +
`                  </g>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- PIN 3: JABALPUR (REGIONAL CENTER - EAST) -->${eol}` +
`                <g class="map-campus-node map-regional-pin is-active" transform="translate(375, 205)" id="mapPinJabalpur" data-center-index="0" data-center-id="jabalpur" role="button" tabindex="0" aria-label="Jabalpur Regional Center">${eol}` +
`                  <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" class="pin-halo" />${eol}` +
`                  <circle cx="0" cy="0" r="8" fill="rgba(56, 189, 248, 0.2)" />${eol}` +
`                  <circle cx="0" cy="0" r="5.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.8" filter="url(#nodeGlow)" />${eol}` +
`                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />${eol}` +
`                  <g transform="translate(10, -11)" class="pin-tag-group">${eol}` +
`                    <rect width="80" height="24" rx="5" fill="#0B132B" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1" />${eol}` +
`                    <circle cx="8" cy="12" r="2.5" fill="#10B981" />${eol}` +
`                    <text x="15" y="11" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF">Jabalpur</text>${eol}` +
`                    <text x="15" y="19" font-family="'Inter', system-ui, sans-serif" font-size="6.5" font-weight="500" fill="#94A3B8">Napier Town</text>${eol}` +
`                  </g>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- PIN 4: UJJAIN (REGIONAL CENTER - WEST) -->${eol}` +
`                <g class="map-campus-node map-regional-pin" transform="translate(165, 200)" id="mapPinUjjain" data-center-index="3" data-center-id="ujjain" role="button" tabindex="0" aria-label="Ujjain Regional Center">${eol}` +
`                  <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" class="pin-halo" />${eol}` +
`                  <circle cx="0" cy="0" r="8" fill="rgba(56, 189, 248, 0.2)" />${eol}` +
`                  <circle cx="0" cy="0" r="5.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.8" filter="url(#nodeGlow)" />${eol}` +
`                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />${eol}` +
`                  <g transform="translate(-76, -11)" class="pin-tag-group">${eol}` +
`                    <rect width="68" height="24" rx="5" fill="#0B132B" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1" />${eol}` +
`                    <circle cx="8" cy="12" r="2.5" fill="#10B981" />${eol}` +
`                    <text x="15" y="11" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF">Ujjain</text>${eol}` +
`                    <text x="15" y="19" font-family="'Inter', system-ui, sans-serif" font-size="6.5" font-weight="500" fill="#94A3B8">Malipura</text>${eol}` +
`                  </g>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- PIN 5: RATLAM (REGIONAL CENTER - FAR WEST) -->${eol}` +
`                <g class="map-campus-node map-regional-pin" transform="translate(105, 190)" id="mapPinRatlam" data-center-index="2" data-center-id="ratlam" role="button" tabindex="0" aria-label="Ratlam Regional Center">${eol}` +
`                  <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" class="pin-halo" />${eol}` +
`                  <circle cx="0" cy="0" r="8" fill="rgba(56, 189, 248, 0.2)" />${eol}` +
`                  <circle cx="0" cy="0" r="5.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.8" filter="url(#nodeGlow)" />${eol}` +
`                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />${eol}` +
`                  <g transform="translate(-80, -11)" class="pin-tag-group">${eol}` +
`                    <rect width="72" height="24" rx="5" fill="#0B132B" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1" />${eol}` +
`                    <circle cx="8" cy="12" r="2.5" fill="#10B981" />${eol}` +
`                    <text x="15" y="11" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF">Ratlam</text>${eol}` +
`                    <text x="15" y="19" font-family="'Inter', system-ui, sans-serif" font-size="6.5" font-weight="500" fill="#94A3B8">Station Rd</text>${eol}` +
`                  </g>${eol}` +
`                </g>${eol}` +
`${eol}` +
`                <!-- PIN 6: NAGPUR (REGIONAL CENTER - SOUTH) -->${eol}` +
`                <g class="map-campus-node map-regional-pin" transform="translate(295, 310)" id="mapPinNagpur" data-center-index="4" data-center-id="nagpur" role="button" tabindex="0" aria-label="Nagpur Regional Center">${eol}` +
`                  <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.2" class="pin-halo" />${eol}` +
`                  <circle cx="0" cy="0" r="8" fill="rgba(56, 189, 248, 0.2)" />${eol}` +
`                  <circle cx="0" cy="0" r="5.5" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.8" filter="url(#nodeGlow)" />${eol}` +
`                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />${eol}` +
`                  <g transform="translate(10, -11)" class="pin-tag-group">${eol}` +
`                    <rect width="74" height="24" rx="5" fill="#0B132B" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1" />${eol}` +
`                    <circle cx="8" cy="12" r="2.5" fill="#10B981" />${eol}` +
`                    <text x="15" y="11" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF">Nagpur</text>${eol}` +
`                    <text x="15" y="19" font-family="'Inter', system-ui, sans-serif" font-size="6.5" font-weight="500" fill="#94A3B8">Sitabuldi</text>${eol}` +
`                  </g>${eol}` +
`                </g>${eol}` +
`              </svg>${eol}` +
`            </div>${eol}` +
`${eol}` +
`            <!-- Interactive Center Intelligence Telemetry HUD -->${eol}` +
`            <div class="map-telemetry-hud" id="mapTelemetryHud" aria-live="polite">${eol}` +
`              <div class="hud-top-row">${eol}` +
`                <div class="hud-identity">${eol}` +
`                  <span class="hud-pulse-dot" aria-hidden="true"></span>${eol}` +
`                  <div>${eol}` +
`                    <h4 class="hud-center-title" id="hudCenterTitle">Jabalpur Regional Hub</h4>${eol}` +
`                    <span class="hud-center-sub" id="hudCenterSub">East MP • Authorized Learning Center</span>${eol}` +
`                  </div>${eol}` +
`                </div>${eol}` +
`                <span class="hud-badge-status" id="hudBadgeStatus">Lab Open</span>${eol}` +
`              </div>${eol}` +
`${eol}` +
`              <p class="hud-center-address" id="hudCenterAddress">${eol}` +
`                2nd Floor, In front of Maruti Suzuki Showroom, Jabalpur Hospital Road, Napier Town, Jabalpur, M.P.${eol}` +
`              </p>${eol}` +
`${eol}` +
`              <div class="hud-pills-row" id="hudPillsRow">${eol}` +
`                <span class="hud-pill-tag">✓ Offline Labs</span>${eol}` +
`                <span class="hud-pill-tag">✓ Mentor Desk</span>${eol}` +
`                <span class="hud-pill-tag">✓ Direct Bhopal Sync</span>${eol}` +
`              </div>${eol}` +
`${eol}` +
`              <div class="hud-actions-row">${eol}` +
`                <a href="tel:07614920378" class="btn btn-sm btn-secondary hud-btn" id="hudCallBtn" title="Call Center">${eol}` +
`                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hud-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>${eol}` +
`                  <span id="hudPhoneText">0761-4920378</span>${eol}` +
`                </a>${eol}` +
`                <a href="https://maps.google.com/?q=Miracle+IT+Career+Academy,+Napier+Town,+Jabalpur" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary hud-btn" id="hudMapBtn" title="Open Google Maps">${eol}` +
`                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hud-icon"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>${eol}` +
`                  <span>Directions</span>${eol}` +
`                </a>${eol}` +
`                <button type="button" class="btn btn-sm btn-secondary-light hud-btn hud-sync-trigger" id="hudSyncBtn" title="Focus 3D Card on Left">${eol}` +
`                  <span>Focus 3D Card ➔</span>${eol}` +
`                </button>${eol}` +
`              </div>${eol}` +
`            </div>${eol}` +
`${eol}` +
`            <!-- Network Metrics Bar -->${eol}` +
`            <div class="globe-metrics-bar">${eol}` +
`              <div class="globe-metric-col">${eol}` +
`                <span class="globe-metric-num">6</span>${eol}` +
`                <span class="globe-metric-lbl">Active Campuses</span>${eol}` +
`              </div>${eol}` +
`              <div class="globe-metric-sep"></div>${eol}` +
`              <div class="globe-metric-col">${eol}` +
`                <span class="globe-metric-num">100%</span>${eol}` +
`                <span class="globe-metric-lbl">In-Person Labs</span>${eol}` +
`              </div>${eol}` +
`              <div class="globe-metric-sep"></div>${eol}` +
`              <div class="globe-metric-col">${eol}` +
`                <span class="globe-metric-num">Central IN</span>${eol}` +
`                <span class="globe-metric-lbl">Hiring Network</span>${eol}` +
`              </div>${eol}` +
`            </div>${eol}` +
`          </div>${eol}` +
`        </div>`;

  content = content.substring(0, startIdx) + newMapHtml + content.substring(endIdx);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[UPDATED HTML] ${filePath}`);
}

updateLocationHtml('components/location/location.html');
if (fs.existsSync('miracle-it-career-academy/components/location/location.html')) {
  updateLocationHtml('miracle-it-career-academy/components/location/location.html');
}
