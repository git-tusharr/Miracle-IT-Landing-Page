const fs = require('fs');

console.log('--- UPDATING location.js WITH RICH INTERACTIVE MAP CONTROLLER ---');

function updateLocationJs(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  const eol = code.includes('\r\n') ? '\r\n' : '\n';

  // 1. Hook section.updateTelemetryHud into updateCardsDepth
  const hookTarget = `      const pins = section.querySelectorAll('.map-regional-pin');${eol}` +
`      pins.forEach(pin => {${eol}` +
`        pin.classList.toggle('is-active', pin.getAttribute('data-center-index') === String(activeIndex));${eol}` +
`      });`;

  const hookReplacement = `      const pins = section.querySelectorAll('.map-regional-pin');${eol}` +
`      pins.forEach(pin => {${eol}` +
`        pin.classList.toggle('is-active', pin.getAttribute('data-center-index') === String(activeIndex));${eol}` +
`      });${eol}` +
`      if (typeof section.updateTelemetryHud === 'function') {${eol}` +
`        section.updateTelemetryHud(activeIndex);${eol}` +
`      }`;

  if (code.includes(hookTarget)) {
    code = code.replace(hookTarget, hookReplacement);
    console.log(`[HOOKED HUD INTO 3D CAROUSEL] in ${filePath}`);
  }

  // 2. Replace initIndiaNetworkMap
  const startMapFunc = '/**\n * 2D INDIA REGIONAL NETWORK MAP CONTROLLER';
  const startMapFuncCrlf = '/**\r\n * 2D INDIA REGIONAL NETWORK MAP CONTROLLER';
  const endMapFunc = 'if (typeof window !== \'undefined\') {';

  let startIdx = code.indexOf(startMapFuncCrlf);
  if (startIdx === -1) startIdx = code.indexOf(startMapFunc);
  const endIdx = code.indexOf(endMapFunc);

  if (startIdx === -1 || endIdx === -1) {
    console.error(`[ERROR] Function bounds not found in ${filePath}`);
    return;
  }

  const newMapController = `/**${eol}` +
` * INTERACTIVE CENTRAL INDIA REGIONAL NETWORK MAP CONTROLLER${eol}` +
` * Features: 2-way sync with 3D Carousel, Live Telemetry HUD, Category Filters,${eol}` +
` * Hover & Tap inspection for all 6 campuses (Bhopal HQ + 5 Regional Hubs).${eol}` +
` */${eol}` +
`function initIndiaNetworkMap(section) {${eol}` +
`  const REGIONAL_CENTERS_INFO = {${eol}` +
`    '0': {${eol}` +
`      title: 'Jabalpur Regional Hub',${eol}` +
`      sub: 'East MP • Authorized Learning Center',${eol}` +
`      status: 'Active Lab',${eol}` +
`      address: '2nd Floor, In front of Maruti Suzuki Showroom, Jabalpur Hospital Road, Napier Town, Jabalpur, M.P.',${eol}` +
`      tags: ['✓ Offline Labs', '✓ Mentor Desk', '✓ Direct Bhopal Sync'],${eol}` +
`      phone: '0761-4920378',${eol}` +
`      phoneHref: 'tel:07614920378',${eol}` +
`      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Napier+Town,+Jabalpur',${eol}` +
`      isHq: false${eol}` +
`    },${eol}` +
`    '1': {${eol}` +
`      title: 'Gwalior Regional Hub',${eol}` +
`      sub: 'North MP • Authorized Learning Center',${eol}` +
`      status: 'Active Lab',${eol}` +
`      address: 'A-8, 201, 2nd Floor, Opp. Aditya College, City Center, Gwalior, M.P.',${eol}` +
`      tags: ['✓ Offline Labs', '✓ Project Cell', '✓ Doubt Desk'],${eol}` +
`      phone: '0751-4901188',${eol}` +
`      phoneHref: 'tel:07514901188',${eol}` +
`      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+City+Center,+Gwalior',${eol}` +
`      isHq: false${eol}` +
`    },${eol}` +
`    '2': {${eol}` +
`      title: 'Ratlam Regional Hub',${eol}` +
`      sub: 'West MP • Authorized Learning Center',${eol}` +
`      status: 'Active Lab',${eol}` +
`      address: '102, Shanti Complex, Near Do Batti, Station Road, Ratlam, M.P.',${eol}` +
`      tags: ['✓ Coding Lab', '✓ Doubt Hub', '✓ Weekend Batches'],${eol}` +
`      phone: '07412-234567',${eol}` +
`      phoneHref: 'tel:07412234567',${eol}` +
`      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Station+Road,+Ratlam',${eol}` +
`      isHq: false${eol}` +
`    },${eol}` +
`    '3': {${eol}` +
`      title: 'Ujjain Regional Hub',${eol}` +
`      sub: 'Malwa Regional Hub • Authorized Center',${eol}` +
`      status: 'Active Lab',${eol}` +
`      address: '3rd Floor, Mahakal Commercial Arcade, Malipura Main Road, Ujjain, M.P.',${eol}` +
`      tags: ['✓ Coding Lab', '✓ Career Desk', '✓ Lab Reviews'],${eol}` +
`      phone: '0734-2567890',${eol}` +
`      phoneHref: 'tel:07342567890',${eol}` +
`      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Malipura,+Ujjain',${eol}` +
`      isHq: false${eol}` +
`    },${eol}` +
`    '4': {${eol}` +
`      title: 'Nagpur Regional Hub',${eol}` +
`      sub: 'Maharashtra Regional Hub • Authorized Center',${eol}` +
`      status: 'Active Lab',${eol}` +
`      address: '401, Vidarbha Tech Towers, Near Metro Station, Sitabuldi, Nagpur, MH.',${eol}` +
`      tags: ['✓ Full-Stack Lab', '✓ Hiring Cell', '✓ Cloud Workstations'],${eol}` +
`      phone: '0712-2789012',${eol}` +
`      phoneHref: 'tel:07122789012',${eol}` +
`      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Sitabuldi,+Nagpur',${eol}` +
`      isHq: false${eol}` +
`    },${eol}` +
`    'bhopal': {${eol}` +
`      title: 'Bhopal Headquarters (Main Campus)',${eol}` +
`      sub: 'M.P. Nagar Zone-II • Central Academy Campus',${eol}` +
`      status: 'HQ Campus',${eol}` +
`      address: 'Plot No.80, 3rd Floor, Aakriti Complex, Zone-2, M.P. Nagar, Bhopal, M.P.',${eol}` +
`      tags: ['✓ Central Academy HQ', '✓ 4 Advanced Tech Labs', '✓ Visiting Desk Open'],${eol}` +
`      phone: '+91 78800 03127',${eol}` +
`      phoneHref: 'tel:+917880003127',${eol}` +
`      mapUrl: 'https://maps.google.com/?q=M.P.+Nagar,+Bhopal',${eol}` +
`      isHq: true${eol}` +
`    }${eol}` +
`  };${eol}` +
`${eol}` +
`  // Dynamic Telemetry HUD Updater${eol}` +
`  section.updateTelemetryHud = function(key) {${eol}` +
`    const data = REGIONAL_CENTERS_INFO[String(key)];${eol}` +
`    if (!data) return;${eol}` +
`${eol}` +
`    const hud = section.querySelector('#mapTelemetryHud');${eol}` +
`    if (!hud) return;${eol}` +
`${eol}` +
`    hud.classList.toggle('is-hq', !!data.isHq);${eol}` +
`${eol}` +
`    const titleEl = hud.querySelector('#hudCenterTitle');${eol}` +
`    const subEl = hud.querySelector('#hudCenterSub');${eol}` +
`    const badgeEl = hud.querySelector('#hudBadgeStatus');${eol}` +
`    const addrEl = hud.querySelector('#hudCenterAddress');${eol}` +
`    const pillsRow = hud.querySelector('#hudPillsRow');${eol}` +
`    const callBtn = hud.querySelector('#hudCallBtn');${eol}` +
`    const phoneText = hud.querySelector('#hudPhoneText');${eol}` +
`    const mapBtn = hud.querySelector('#hudMapBtn');${eol}` +
`    const syncBtn = hud.querySelector('#hudSyncBtn');${eol}` +
`${eol}` +
`    if (titleEl) titleEl.textContent = data.title;${eol}` +
`    if (subEl) subEl.textContent = data.sub;${eol}` +
`    if (badgeEl) badgeEl.textContent = data.status;${eol}` +
`    if (addrEl) addrEl.textContent = data.address;${eol}` +
`    if (phoneText) phoneText.textContent = data.phone;${eol}` +
`    if (callBtn) callBtn.setAttribute('href', data.phoneHref);${eol}` +
`    if (mapBtn) mapBtn.setAttribute('href', data.mapUrl);${eol}` +
`${eol}` +
`    if (pillsRow) {${eol}` +
`      pillsRow.innerHTML = data.tags.map(t => \`<span class="hud-pill-tag">\${t}</span>\`).join('');${eol}` +
`    }${eol}` +
`${eol}` +
`    if (syncBtn) {${eol}` +
`      syncBtn.setAttribute('data-target-center', String(key));${eol}` +
`      if (data.isHq) {${eol}` +
`        syncBtn.innerHTML = '<span>Visit Bhopal Desk ↑</span>';${eol}` +
`      } else {${eol}` +
`        syncBtn.innerHTML = '<span>Focus 3D Card ➔</span>';${eol}` +
`      }${eol}` +
`    }${eol}` +
`${eol}` +
`    // Synchronize active state on SVG nodes${eol}` +
`    const allNodes = section.querySelectorAll('.map-campus-node');${eol}` +
`    allNodes.forEach(node => {${eol}` +
`      const pinId = node.getAttribute('data-center-id');${eol}` +
`      const pinIdx = node.getAttribute('data-center-index');${eol}` +
`      const isMatch = (data.isHq && pinId === 'bhopal') || (pinIdx === String(key));${eol}` +
`      node.classList.toggle('is-active', isMatch);${eol}` +
`    });${eol}` +
`  };${eol}` +
`${eol}` +
`  // Click & Keyboard Navigation on SVG Pins${eol}` +
`  const allNodes = section.querySelectorAll('.map-campus-node');${eol}` +
`  allNodes.forEach(node => {${eol}` +
`    node.addEventListener('click', () => {${eol}` +
`      const pinId = node.getAttribute('data-center-id');${eol}` +
`      const pinIdx = node.getAttribute('data-center-index');${eol}` +
`${eol}` +
`      if (pinId === 'bhopal') {${eol}` +
`        section.updateTelemetryHud('bhopal');${eol}` +
`      } else if (pinIdx !== null) {${eol}` +
`        const correspondingPill = section.querySelector(\`.orbit-city-pill[data-orbit-target="\${pinIdx}"]\`);${eol}` +
`        if (correspondingPill) {${eol}` +
`          correspondingPill.click();${eol}` +
`        }${eol}` +
`        section.updateTelemetryHud(pinIdx);${eol}` +
`      }${eol}` +
`    });${eol}` +
`${eol}` +
`    node.addEventListener('keydown', (e) => {${eol}` +
`      if (e.key === 'Enter' || e.key === ' ') {${eol}` +
`        e.preventDefault();${eol}` +
`        node.click();${eol}` +
`      }${eol}` +
`    });${eol}` +
`  });${eol}` +
`${eol}` +
`  // HUD Sync Action Button (Rotate Carousel or Scroll to Bhopal Desk)${eol}` +
`  const syncBtn = section.querySelector('#hudSyncBtn');${eol}` +
`  if (syncBtn) {${eol}` +
`    syncBtn.addEventListener('click', () => {${eol}` +
`      const target = syncBtn.getAttribute('data-target-center');${eol}` +
`      if (target === 'bhopal') {${eol}` +
`        const bhopalCard = section.querySelector('.location-info-card');${eol}` +
`        if (bhopalCard) {${eol}` +
`          bhopalCard.scrollIntoView({ behavior: 'smooth', block: 'center' });${eol}` +
`        }${eol}` +
`      } else if (target !== null) {${eol}` +
`        const pill = section.querySelector(\`.orbit-city-pill[data-orbit-target="\${target}"]\`);${eol}` +
`        if (pill) {${eol}` +
`          pill.click();${eol}` +
`          const stage = section.querySelector('#centers3dStage');${eol}` +
`          if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });${eol}` +
`        }${eol}` +
`      }${eol}` +
`    });${eol}` +
`  }${eol}` +
`${eol}` +
`  // Map Filter Category Tabs (All, Bhopal HQ, MP Centers, Nagpur MH)${eol}` +
`  const filterBtns = section.querySelectorAll('.map-filter-btn');${eol}` +
`  filterBtns.forEach(btn => {${eol}` +
`    btn.addEventListener('click', () => {${eol}` +
`      filterBtns.forEach(b => b.classList.remove('is-active'));${eol}` +
`      btn.classList.add('is-active');${eol}` +
`${eol}` +
`      const filter = btn.getAttribute('data-filter');${eol}` +
`      allNodes.forEach(node => {${eol}` +
`        const pinId = node.getAttribute('data-center-id');${eol}` +
`        let shouldShow = true;${eol}` +
`${eol}` +
`        if (filter === 'bhopal') {${eol}` +
`          shouldShow = (pinId === 'bhopal');${eol}` +
`        } else if (filter === 'mp') {${eol}` +
`          shouldShow = (pinId === 'bhopal' || pinId === 'jabalpur' || pinId === 'gwalior' || pinId === 'ujjain' || pinId === 'ratlam');${eol}` +
`        } else if (filter === 'mh') {${eol}` +
`          shouldShow = (pinId === 'nagpur');${eol}` +
`        }${eol}` +
`${eol}` +
`        node.classList.toggle('is-dimmed', !shouldShow);${eol}` +
`      });${eol}` +
`${eol}` +
`      if (filter === 'bhopal') {${eol}` +
`        section.updateTelemetryHud('bhopal');${eol}` +
`      } else if (filter === 'mh') {${eol}` +
`        const nagpurPill = section.querySelector('.orbit-city-pill[data-orbit-target="4"]');${eol}` +
`        if (nagpurPill) nagpurPill.click();${eol}` +
`        section.updateTelemetryHud('4');${eol}` +
`      } else if (filter === 'mp') {${eol}` +
`        const jabalpurPill = section.querySelector('.orbit-city-pill[data-orbit-target="0"]');${eol}` +
`        if (jabalpurPill) jabalpurPill.click();${eol}` +
`        section.updateTelemetryHud('0');${eol}` +
`      }${eol}` +
`    });${eol}` +
`  });${eol}` +
`${eol}` +
`  // Initial HUD activation with index 0 (Jabalpur)${eol}` +
`  section.updateTelemetryHud(0);${eol}` +
`}${eol}${eol}`;

  code = code.substring(0, startIdx) + newMapController + code.substring(endIdx);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`[UPDATED JS CONTROLLER] in ${filePath}`);
}

updateLocationJs('components/location/location.js');
console.log('Update complete!');
