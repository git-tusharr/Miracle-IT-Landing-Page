const fs = require('fs');
const path = require('path');

const newSvg = `              <svg class="india-network-svg" viewBox="0 0 660 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Miracle IT Central India Campus Network Map">
                <defs>
                  <!-- Deep Cyber Obsidian Background -->
                  <linearGradient id="mapBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#050814" />
                    <stop offset="50%" stop-color="#091024" />
                    <stop offset="100%" stop-color="#0C1530" />
                  </linearGradient>

                  <!-- State Outline Gradient -->
                  <linearGradient id="mpBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.9" />
                    <stop offset="45%" stop-color="#FF7A00" stop-opacity="0.95" />
                    <stop offset="100%" stop-color="#0284C7" stop-opacity="0.85" />
                  </linearGradient>

                  <!-- Central Hub Radial Aura -->
                  <radialGradient id="centralIndiaGlow" cx="50%" cy="48%" r="58%">
                    <stop offset="0%" stop-color="rgba(37, 99, 235, 0.22)" />
                    <stop offset="40%" stop-color="rgba(255, 122, 0, 0.08)" />
                    <stop offset="75%" stop-color="rgba(14, 165, 233, 0.04)" />
                    <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
                  </radialGradient>

                  <!-- Radar Sweep Cone Gradient -->
                  <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="rgba(255, 122, 0, 0.32)" />
                    <stop offset="40%" stop-color="rgba(255, 122, 0, 0.1)" />
                    <stop offset="100%" stop-color="rgba(255, 122, 0, 0)" />
                  </linearGradient>

                  <!-- Neon Glow Filters -->
                  <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <!-- Fine Coordinate Dot Grid -->
                  <pattern id="networkDotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="12" cy="12" r="0.8" fill="rgba(255, 255, 255, 0.09)" />
                  </pattern>
                </defs>

                <!-- Canvas Background -->
                <rect width="660" height="480" rx="18" fill="url(#mapBgGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.2" />
                <rect width="660" height="480" fill="url(#networkDotGrid)" />

                <!-- Coordinate Grid Crosshairs & Latitude/Longitude Lines -->
                <g stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" stroke-dasharray="3,4">
                  <line x1="30" y1="75" x2="630" y2="75" />
                  <line x1="30" y1="175" x2="630" y2="175" />
                  <line x1="30" y1="230" x2="630" y2="230" />
                  <line x1="30" y1="330" x2="630" y2="330" />
                  <line x1="30" y1="405" x2="630" y2="405" />
                  <line x1="95" y1="20" x2="95" y2="460" />
                  <line x1="190" y1="20" x2="190" y2="460" />
                  <line x1="330" y1="20" x2="330" y2="460" />
                  <line x1="425" y1="20" x2="425" y2="460" />
                  <line x1="535" y1="20" x2="535" y2="460" />
                </g>

                <!-- Coordinate Ticks -->
                <g font-family="monospace" font-size="8" fill="rgba(148, 163, 184, 0.45)">
                  <text x="12" y="78">26°N</text>
                  <text x="12" y="233">23°N</text>
                  <text x="12" y="408">21°N</text>
                  <text x="85" y="16">75°E</text>
                  <text x="320" y="16">77°E</text>
                  <text x="525" y="16">80°E</text>
                </g>

                <!-- Radar Range Distance Rings centered on Bhopal (330, 230) -->
                <g fill="none" stroke="rgba(255, 122, 0, 0.1)" stroke-width="1" stroke-dasharray="4,6">
                  <circle cx="330" cy="230" r="90" />
                  <circle cx="330" cy="230" r="175" />
                  <circle cx="330" cy="230" r="260" stroke="rgba(56, 189, 248, 0.08)" />
                  <text x="335" y="145" font-family="monospace" font-size="7" fill="rgba(255, 122, 0, 0.35)">150 KM</text>
                  <text x="335" y="60" font-family="monospace" font-size="7" fill="rgba(255, 122, 0, 0.35)">300 KM</text>
                </g>

                <!-- Regional Surrounding Geographies -->
                <g fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1">
                  <text x="45" y="90" font-family="'Inter', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="rgba(148, 163, 184, 0.28)" letter-spacing="0.1em">RAJASTHAN / GUJARAT</text>
                  <text x="420" y="45" font-family="'Inter', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="rgba(148, 163, 184, 0.28)" letter-spacing="0.1em">UTTAR PRADESH</text>
                  <path d="M 110,360 Q 300,350 560,340" stroke="rgba(255, 255, 255, 0.08)" stroke-dasharray="4,4" />
                  <text x="475" y="335" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="600" fill="rgba(148, 163, 184, 0.35)">MP / MH BORDER</text>
                </g>

                <!-- Stylized Central India Topographic Silhouette Enclosing All Campuses -->
                <path class="region-highlight-shape"
                      d="M 345,35 
                         C 390,45 425,70 460,95 
                         C 510,120 580,140 625,180 
                         C 645,215 635,255 595,285 
                         C 560,310 520,335 480,365 
                         C 460,385 450,445 410,455 
                         C 375,460 360,425 340,390 
                         C 310,380 270,370 230,360 
                         C 180,350 140,335 110,305 
                         C 70,270 45,220 50,175 
                         C 55,130 90,115 135,110 
                         C 180,105 220,95 260,75 
                         C 295,55 320,40 345,35 Z"
                      fill="url(#centralIndiaGlow)"
                      stroke="url(#mpBorderGrad)"
                      stroke-width="2"
                      stroke-dasharray="10,5"
                      filter="url(#nodeGlow)" />

                <!-- Animated 360-degree Radar Scan Beam from Bhopal HQ (330, 230) -->
                <g class="radar-scan-arm">
                  <path d="M 330,230 L 490,105 A 210,210 0 0,1 540,240 Z" fill="url(#radarSweepGrad)" />
                </g>

                <!-- SECONDARY INTER-HUB REGIONAL MESH LINKS (SUBTLE DASHED) -->
                <g fill="none" stroke="rgba(56, 189, 248, 0.16)" stroke-width="1.6" stroke-dasharray="4,4">
                  <!-- Ujjain <-> Ratlam Transit Corridor -->
                  <path d="M 190,275 Q 135,230 95,175" />
                  <!-- Jabalpur <-> Nagpur Corridor -->
                  <path d="M 535,225 Q 490,320 425,405" />
                  <!-- Gwalior <-> Jabalpur Corridor -->
                  <path d="M 345,75 Q 450,135 535,225" />
                </g>

                <!-- PRIMARY TELEMETRY CORRIDORS (DIRECT BHOPAL HQ <-> ALL 5 REGIONAL HUBS) -->
                <!-- 1. Broad Neon Energy Halo Lines -->
                <g fill="none" stroke="rgba(56, 189, 248, 0.22)" stroke-width="5" stroke-linecap="round">
                  <path d="M 330,230 Q 332,150 345,75" id="lineHaloGwalior" />
                  <path d="M 330,230 Q 435,215 535,225" id="lineHaloJabalpur" />
                  <path d="M 330,230 Q 370,320 425,405" id="lineHaloNagpur" />
                  <path d="M 330,230 Q 255,265 190,275" id="lineHaloUjjain" />
                  <path d="M 330,230 Q 210,195 95,175" id="lineHaloRatlam" />
                </g>

                <!-- 2. High-Tech Animated Telemetry Circuit Lines -->
                <g fill="none" stroke="#38BDF8" stroke-width="2" class="telemetry-circuit-lines" filter="url(#lineGlow)">
                  <!-- Bhopal <-> Gwalior (North) -->
                  <path d="M 330,230 Q 332,150 345,75" class="telemetry-line" id="telemLineGwalior" />
                  <!-- Bhopal <-> Jabalpur (East) -->
                  <path d="M 330,230 Q 435,215 535,225" class="telemetry-line" id="telemLineJabalpur" />
                  <!-- Bhopal <-> Nagpur (South) -->
                  <path d="M 330,230 Q 370,320 425,405" class="telemetry-line" id="telemLineNagpur" />
                  <!-- Bhopal <-> Ujjain (West) -->
                  <path d="M 330,230 Q 255,265 190,275" class="telemetry-line" id="telemLineUjjain" />
                  <!-- Bhopal <-> Ratlam (West-Northwest) -->
                  <path d="M 330,230 Q 210,195 95,175" class="telemetry-line" id="telemLineRatlam" />
                </g>

                <!-- 3. Luminous Moving Data Packets (Bidirectional Energy Pulses) -->
                <g class="network-data-packets">
                  <!-- Bhopal -> Gwalior -->
                  <circle r="3.5" fill="#FF9433" filter="url(#nodeGlow)">
                    <animateMotion dur="2.4s" repeatCount="indefinite" path="M 330,230 Q 332,150 345,75" />
                  </circle>
                  <!-- Bhopal -> Jabalpur -->
                  <circle r="3.5" fill="#38BDF8" filter="url(#nodeGlow)">
                    <animateMotion dur="2.6s" repeatCount="indefinite" path="M 330,230 Q 435,215 535,225" />
                  </circle>
                  <!-- Bhopal -> Nagpur -->
                  <circle r="3.5" fill="#FF9433" filter="url(#nodeGlow)">
                    <animateMotion dur="2.8s" repeatCount="indefinite" path="M 330,230 Q 370,320 425,405" />
                  </circle>
                  <!-- Bhopal -> Ujjain -->
                  <circle r="3.5" fill="#38BDF8" filter="url(#nodeGlow)">
                    <animateMotion dur="2.2s" repeatCount="indefinite" path="M 330,230 Q 255,265 190,275" />
                  </circle>
                  <!-- Bhopal -> Ratlam -->
                  <circle r="3.5" fill="#FF9433" filter="url(#nodeGlow)">
                    <animateMotion dur="2.7s" repeatCount="indefinite" path="M 330,230 Q 210,195 95,175" />
                  </circle>
                  <!-- Inter-Hub: Ujjain -> Ratlam packet -->
                  <circle r="2.5" fill="#38BDF8" filter="url(#nodeGlow)">
                    <animateMotion dur="3.0s" repeatCount="indefinite" path="M 190,275 Q 135,230 95,175" />
                  </circle>
                </g>

                <!-- ======================================================================
                     ALL 6 CAMPUS NODES & HIGH-TECH INTERACTIVE BADGES
                     ====================================================================== -->

                <!-- PIN 1: BHOPAL (HEADQUARTERS & MAIN CAMPUS - CENTER) -->
                <g class="map-campus-node map-hub-group" transform="translate(330, 230)" id="mapPinBhopal" role="button" tabindex="0" aria-label="Bhopal Headquarters & Main Campus" data-center-id="bhopal">
                  <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(255, 122, 0, 0.4)" stroke-width="1.8" class="hub-pulse-wave hub-pulse-1" />
                  <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255, 122, 0, 0.65)" stroke-width="2" class="hub-pulse-wave hub-pulse-2" />
                  <circle cx="0" cy="0" r="16" fill="rgba(255, 122, 0, 0.22)" />
                  <circle cx="0" cy="0" r="9.5" fill="#FF7A00" stroke="#FFFFFF" stroke-width="2.5" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                  <!-- Centered Floating Badge directly ABOVE Bhopal -->
                  <g transform="translate(-65, -45)" class="hub-label-bubble">
                    <rect width="130" height="30" rx="7" fill="#0B132B" stroke="#FF7A00" stroke-width="1.6" filter="url(#hubGlow)" />
                    <circle cx="12" cy="15" r="3.5" fill="#10B981" class="live-status-dot" />
                    <text x="21" y="14" font-family="'Inter', system-ui, sans-serif" font-size="8.8" font-weight="800" fill="#FFFFFF">BHOPAL (HQ)</text>
                    <text x="21" y="24" font-family="'Inter', system-ui, sans-serif" font-size="7.2" font-weight="600" fill="#CBD5E1">Main Campus • Zone-II</text>
                  </g>
                </g>

                <!-- PIN 2: GWALIOR (NORTH REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(345, 75)" id="mapPinGwalior" data-center-index="1" data-center-id="gwalior" role="button" tabindex="0" aria-label="Gwalior Regional Center">
                  <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.4" class="pin-halo" />
                  <circle cx="0" cy="0" r="9" fill="rgba(56, 189, 248, 0.22)" />
                  <circle cx="0" cy="0" r="6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
                  <!-- Badge to the RIGHT -->
                  <g transform="translate(14, -13)" class="pin-tag-group">
                    <rect width="84" height="26" rx="6" fill="#0B132B" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2" />
                    <circle cx="9" cy="13" r="2.8" fill="#10B981" />
                    <text x="17" y="12" font-family="'Inter', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#FFFFFF">Gwalior</text>
                    <text x="17" y="21" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">City Center</text>
                  </g>
                </g>

                <!-- PIN 3: JABALPUR (EAST REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin is-active" transform="translate(535, 225)" id="mapPinJabalpur" data-center-index="0" data-center-id="jabalpur" role="button" tabindex="0" aria-label="Jabalpur Regional Center">
                  <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.4" class="pin-halo" />
                  <circle cx="0" cy="0" r="9" fill="rgba(56, 189, 248, 0.22)" />
                  <circle cx="0" cy="0" r="6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
                  <!-- Badge to the RIGHT -->
                  <g transform="translate(14, -13)" class="pin-tag-group">
                    <rect width="86" height="26" rx="6" fill="#0B132B" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2" />
                    <circle cx="9" cy="13" r="2.8" fill="#10B981" />
                    <text x="17" y="12" font-family="'Inter', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#FFFFFF">Jabalpur</text>
                    <text x="17" y="21" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Napier Town</text>
                  </g>
                </g>

                <!-- PIN 4: NAGPUR (SOUTH REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(425, 405)" id="mapPinNagpur" data-center-index="4" data-center-id="nagpur" role="button" tabindex="0" aria-label="Nagpur Regional Center">
                  <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.4" class="pin-halo" />
                  <circle cx="0" cy="0" r="9" fill="rgba(56, 189, 248, 0.22)" />
                  <circle cx="0" cy="0" r="6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
                  <!-- Badge to the RIGHT -->
                  <g transform="translate(14, -13)" class="pin-tag-group">
                    <rect width="84" height="26" rx="6" fill="#0B132B" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2" />
                    <circle cx="9" cy="13" r="2.8" fill="#10B981" />
                    <text x="17" y="12" font-family="'Inter', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#FFFFFF">Nagpur</text>
                    <text x="17" y="21" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Sitabuldi (MH)</text>
                  </g>
                </g>

                <!-- PIN 5: UJJAIN (WEST-SOUTHWEST REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(190, 275)" id="mapPinUjjain" data-center-index="3" data-center-id="ujjain" role="button" tabindex="0" aria-label="Ujjain Regional Center">
                  <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.4" class="pin-halo" />
                  <circle cx="0" cy="0" r="9" fill="rgba(56, 189, 248, 0.22)" />
                  <circle cx="0" cy="0" r="6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
                  <!-- Badge to the LEFT (Negative translation) -->
                  <g transform="translate(-88, -13)" class="pin-tag-group">
                    <rect width="78" height="26" rx="6" fill="#0B132B" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2" />
                    <circle cx="9" cy="13" r="2.8" fill="#10B981" />
                    <text x="17" y="12" font-family="'Inter', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#FFFFFF">Ujjain</text>
                    <text x="17" y="21" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Malipura</text>
                  </g>
                </g>

                <!-- PIN 6: RATLAM (WEST-NORTHWEST REGIONAL CENTER) -->
                <g class="map-campus-node map-regional-pin" transform="translate(95, 175)" id="mapPinRatlam" data-center-index="2" data-center-id="ratlam" role="button" tabindex="0" aria-label="Ratlam Regional Center">
                  <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.4" class="pin-halo" />
                  <circle cx="0" cy="0" r="9" fill="rgba(56, 189, 248, 0.22)" />
                  <circle cx="0" cy="0" r="6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2" filter="url(#nodeGlow)" />
                  <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
                  <!-- Badge to the LEFT (Negative translation) -->
                  <g transform="translate(-90, -13)" class="pin-tag-group">
                    <rect width="80" height="26" rx="6" fill="#0B132B" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2" />
                    <circle cx="9" cy="13" r="2.8" fill="#10B981" />
                    <text x="17" y="12" font-family="'Inter', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#FFFFFF">Ratlam</text>
                    <text x="17" y="21" font-family="'Inter', system-ui, sans-serif" font-size="7" font-weight="500" fill="#94A3B8">Station Rd</text>
                  </g>
                </g>
              </svg>`;

console.log('Generated SVG length:', newSvg.length);
fs.writeFileSync('d:\\Tushar\\miracle-it-career-academy\\scratch\\new_svg.txt', newSvg);
