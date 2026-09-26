/**
 * LOCATION COMPONENT CONTROLLER (v6.1 OPTIMIZED 3D SHOWCASE)
 * Supports:
 *  - Map vs Campus Photo tab switching
 *  - Schematic Map Route Filter Highlighting
 *  - One-click Copy Campus Address to clipboard
 *  - Optimized 3D Continuous Rotating Carousel of Regional Centers (Left)
 *  - Normal 3D Rotating World Globe of Planet Earth (Right)
 */

function initLocation(container = document) {
  const section = container.querySelector('#location') || document.querySelector('#location');
  if (!section) return;

  // Prevent multiple initializations on the same DOM element
  if (section.dataset.initializedLocation === 'true') return;
  section.dataset.initializedLocation = 'true';

  // =========================================================================
  // 1. Media Tab Switching (Google Map vs Campus Photo)
  // =========================================================================
  const tabs = section.querySelectorAll('.media-tab');
  const panels = section.querySelectorAll('.media-view-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');

      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        if (panel.id === `view-${targetView}`) {
          panel.classList.add('is-active');
          panel.hidden = false;
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });
    });
  });

  // =========================================================================
  // 2. Schematic Map Route Filter Highlighting
  // =========================================================================
  const routeChips = section.querySelectorAll('.route-chip');
  const allRoutes = {
    rkmp: { route: section.querySelector('#svg-route-rkmp'), node: section.querySelector('#svg-node-rkmp') },
    brts: { route: section.querySelector('#svg-route-brts'), node: section.querySelector('#svg-node-brts') },
    metro: { route: section.querySelector('#svg-route-metro'), node: null },
    parking: { route: null, node: section.querySelector('#svg-node-parking') }
  };

  routeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const selectedRoute = chip.getAttribute('data-route');

      routeChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');

      if (selectedRoute === 'all') {
        Object.values(allRoutes).forEach(item => {
          if (item.route) { item.route.classList.remove('route-dimmed', 'route-focused'); }
          if (item.node) { item.node.classList.remove('route-dimmed', 'route-focused'); }
        });
      } else {
        Object.keys(allRoutes).forEach(key => {
          const item = allRoutes[key];
          if (key === selectedRoute) {
            if (item.route) { item.route.classList.remove('route-dimmed'); item.route.classList.add('route-focused'); }
            if (item.node) { item.node.classList.remove('route-dimmed'); item.node.classList.add('route-focused'); }
          } else {
            if (item.route) { item.route.classList.remove('route-focused'); item.route.classList.add('route-dimmed'); }
            if (item.node) { item.node.classList.remove('route-focused'); item.node.classList.add('route-dimmed'); }
          }
        });
      }
    });
  });

  // =========================================================================
  // 3. Copy Address Action
  // =========================================================================
  const copyBtn = section.querySelector('#btn-copy-address');
  const addressElem = section.querySelector('#campus-full-address');
  const copyText = section.querySelector('#copy-btn-text');

  if (copyBtn && addressElem && copyText) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = addressElem.textContent.trim();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        copyBtn.classList.add('is-copied');
        copyText.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          copyText.textContent = 'Copy Address';
        }, 2200);
      } catch (err) {
        copyText.textContent = 'Address Copied';
        setTimeout(() => {
          copyText.textContent = 'Copy Address';
        }, 2000);
      }
    });
  }

  // =========================================================================
  // 4. Interactive 2D India Regional Network Map (Right Column)
  // =========================================================================
  initIndiaNetworkMap(section);

  // =========================================================================
  // 5. Optimized 3D Continuous Rotating Carousel of Center Cards (Left Column)
  // =========================================================================
  const stageElem = section.querySelector('#centers3dStage');
  const cylinderElem = section.querySelector('#centers3dCylinder');
  if (stageElem && cylinderElem) {
    initCenters3DCarousel(section, stageElem, cylinderElem);
  }
}

/**
 * OPTIMIZED 3D CONTINUOUS ROTATING CAROUSEL ENGINE
 */
function initCenters3DCarousel(section, stage, cylinder) {
  const cards = Array.from(cylinder.querySelectorAll('.other-center-card'));
  const pills = Array.from(section.querySelectorAll('.orbit-city-pill'));
  const prevBtn = section.querySelector('#orbitPrevBtn');
  const nextBtn = section.querySelector('#orbitNextBtn');
  const pauseBtn = section.querySelector('#orbitPauseBtn');

  if (cards.length === 0) return;

  const totalCards = cards.length;
  const stepAngle = 360 / totalCards; // 72 degrees for 5 cards

  let currentAngle = 0;
  let targetAngle = 0;
  let isAutoRotating = true;
  let isHovered = false;
  let isDragging = false;
  let startX = 0;
  let dragStartAngle = 0;
  let lastDragTime = 0;
  let lastDragX = 0;
  let dragVelocity = 0;
  let activeIndex = 0;
  let radius = 310;
  let rafId = null;

  // Compute adaptive radius based on viewport width
  function updateRadius() {
    const w = window.innerWidth;
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
    }

    // Position each card at its initial cylindrical coordinates
    cards.forEach((card, idx) => {
      const angle = idx * stepAngle;
      card.dataset.baseAngle = angle;
      card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    });
  }

  updateRadius();
  window.addEventListener('resize', updateRadius, { passive: true });

  // Update card facing styles (opacity, blur, pointer-events, active highlight, scaling)
  function updateCardsDepth(rotation) {
    let closestIndex = 0;
    let minDiff = Infinity;
    const isMobile = window.innerWidth <= 768;

    cards.forEach((card, idx) => {
      const baseAngle = parseFloat(card.dataset.baseAngle) || (idx * stepAngle);
      // Normalized angle relative to camera (0 deg is front)
      let relativeAngle = (baseAngle + rotation) % 360;
      if (relativeAngle > 180) relativeAngle -= 360;
      if (relativeAngle < -180) relativeAngle += 360;

      const absDiff = Math.abs(relativeAngle);
      if (absDiff < minDiff) {
        minDiff = absDiff;
        closestIndex = idx;
      }

      if (isMobile) {
        // On mobile / small screens: smoothly isolate the active card to prevent 3D collisions and visual overlap
        if (absDiff <= 28) {
          card.style.opacity = '1';
          card.style.filter = 'none';
          card.style.pointerEvents = 'auto';
          card.style.visibility = 'visible';
          card.style.zIndex = '10';
        } else if (absDiff <= 55) {
          // Smooth rotation fade between cards
          const fadeProgress = (absDiff - 28) / 27; // 0 to 1
          card.style.opacity = (1 - fadeProgress).toFixed(2);
          card.style.filter = `blur(${fadeProgress * 2.5}px)`;
          card.style.pointerEvents = 'none';
          card.style.visibility = 'visible';
          card.style.zIndex = '2';
        } else {
          // Hide cards that are rotated into the side/rear so they never collide or overlap with the front card
          card.style.opacity = '0';
          card.style.filter = 'none';
          card.style.pointerEvents = 'none';
          card.style.visibility = 'hidden';
          card.style.zIndex = '0';
        }
      } else {
        // Desktop: dynamic depth falloff with visible cylindrical orbit
        const rad = relativeAngle * (Math.PI / 180);
        const cosVal = Math.cos(rad);
        const depthFactor = (cosVal + 1) / 2; // 0 to 1

        const opacity = Math.max(0.32, 0.35 + depthFactor * 0.65);
        card.style.opacity = opacity.toFixed(2);
        card.style.visibility = 'visible';

        if (depthFactor > 0.68) {
          card.style.filter = 'none';
          card.style.pointerEvents = 'auto';
          card.style.zIndex = '10';
        } else {
          card.style.filter = 'blur(1.2px)';
          card.style.pointerEvents = 'auto';
          card.style.zIndex = '1';
        }
      }
    });

    if (closestIndex !== activeIndex) {
      activeIndex = closestIndex;
      cards.forEach((c, i) => c.classList.toggle('is-active', i === activeIndex));
      pills.forEach((p, i) => p.classList.toggle('is-active', i === activeIndex));
      const pins = section.querySelectorAll('.map-regional-pin');
      pins.forEach(pin => {
        pin.classList.toggle('is-active', pin.getAttribute('data-center-index') === String(activeIndex));
      });
      if (typeof section.updateTelemetryHud === 'function') {
        section.updateTelemetryHud(activeIndex);
      }
    }
  }

  // Animation Loop (gentle, steady auto-rotation)
  let lastFrameTime = performance.now();

  function tick() {
    const now = performance.now();
    const dt = Math.min(now - lastFrameTime, 50);
    lastFrameTime = now;
    const dtFactor = dt / 16.67;

    const spinSpeed = window.innerWidth <= 768 ? 0.22 : 0.35;
    if (isAutoRotating && !isHovered && !isDragging) {
      targetAngle -= spinSpeed * dtFactor;
    }

    if (!isDragging) {
      currentAngle += (targetAngle - currentAngle) * Math.min(0.14 * dtFactor, 1);
    }

    cylinder.style.transform = `rotateY(${currentAngle}deg)`;
    updateCardsDepth(currentAngle);

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  // Pause on hover
  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => { isHovered = false; });

  // Mouse & Touch Drag Controls
  function onPointerDown(clientX) {
    isDragging = true;
    startX = clientX;
    dragStartAngle = currentAngle;
    lastDragX = clientX;
    lastDragTime = performance.now();
    dragVelocity = 0;
  }

  function onPointerMove(clientX) {
    if (!isDragging) return;
    const dx = clientX - startX;
    const now = performance.now();
    const dt = now - lastDragTime || 16;
    dragVelocity = (clientX - lastDragX) / dt;
    lastDragX = clientX;
    lastDragTime = now;

    // Convert pixels to rotation degrees
    const sensitivity = window.innerWidth <= 768 ? 0.32 : 0.25;
    currentAngle = dragStartAngle + dx * sensitivity;
    targetAngle = currentAngle;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;

    // Apply smooth inertia flick
    if (Math.abs(dragVelocity) > 0.22) {
      const inertiaDelta = dragVelocity * 50;
      targetAngle = currentAngle + inertiaDelta;
    }
  }

  // Mouse Events
  stage.addEventListener('mousedown', (e) => {
    if (e.target.closest('a')) return; // allow clicking phone or map links
    onPointerDown(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) onPointerMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) onPointerUp();
  });

  // Touch Events
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      onPointerDown(e.touches[0].clientX);
    }
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      onPointerMove(e.touches[0].clientX);
    }
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    onPointerUp();
  });

  // Click any card to rotate and focus on it!
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        // If clicking a link on the active card, let it trigger
        if (idx === activeIndex) return;
        e.preventDefault();
      }

      if (idx !== activeIndex) {
        // Rotate this card to front
        const desiredAngle = -idx * stepAngle;
        let diff = (desiredAngle - targetAngle) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        targetAngle += diff;
      }
    });
  });

  // Prev / Next Navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      targetAngle += stepAngle;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      targetAngle -= stepAngle;
    });
  }

  // Pause / Resume Toggle
  if (pauseBtn) {
    const iconPause = pauseBtn.querySelector('.icon-pause');
    const iconPlay = pauseBtn.querySelector('.icon-play');

    pauseBtn.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      if (iconPause && iconPlay) {
        iconPause.style.display = isAutoRotating ? 'inline' : 'none';
        iconPlay.style.display = isAutoRotating ? 'none' : 'inline';
      }
      pauseBtn.setAttribute('title', isAutoRotating ? 'Pause Rotation' : 'Resume Rotation');
    });
  }

  // City Pills Navigation (1-tap jump to any center)
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetIdx = parseInt(pill.dataset.orbitTarget, 10);
      if (isNaN(targetIdx)) return;

      const desiredAngle = -targetIdx * stepAngle;
      let diff = (desiredAngle - targetAngle) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      targetAngle += diff;
    });
  });
}

/**
 * INTERACTIVE CENTRAL INDIA REGIONAL NETWORK MAP CONTROLLER
 * Features: 2-way sync with 3D Carousel, Live Telemetry HUD, Category Filters,
 * Hover & Tap inspection for all 6 campuses (Bhopal HQ + 5 Regional Hubs).
 */
function initIndiaNetworkMap(section) {
  const REGIONAL_CENTERS_INFO = {
    '0': {
      title: 'Jabalpur Regional Hub',
      sub: 'East MP • Authorized Learning Center',
      status: 'Active Lab',
      address: '2nd Floor, In front of Maruti Suzuki Showroom, Jabalpur Hospital Road, Napier Town, Jabalpur, M.P.',
      tags: ['✓ Offline Labs', '✓ Mentor Desk', '✓ Direct Bhopal Sync'],
      phone: '0761-4920378',
      phoneHref: 'tel:07614920378',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Napier+Town,+Jabalpur',
      isHq: false
    },
    '1': {
      title: 'Gwalior Regional Hub',
      sub: 'North MP • Authorized Learning Center',
      status: 'Active Lab',
      address: 'A-8, 201, 2nd Floor, Opp. Aditya College, City Center, Gwalior, M.P.',
      tags: ['✓ Offline Labs', '✓ Project Cell', '✓ Doubt Desk'],
      phone: '0751-4901188',
      phoneHref: 'tel:07514901188',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+City+Center,+Gwalior',
      isHq: false
    },
    '2': {
      title: 'Ratlam Regional Hub',
      sub: 'West MP • Authorized Learning Center',
      status: 'Active Lab',
      address: '76, B-Plaza, First Floor, T.I.Y Road Corner, Above Raymond Showroom, Station Road, Ratlam, M.P.',
      tags: ['✓ Offline Labs', '✓ Counselling Desk', '✓ Weekend Batches'],
      phone: '07412-403025',
      phoneHref: 'tel:07412403025',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Station+Road,+Ratlam',
      isHq: false
    },
    '3': {
      title: 'Ujjain Regional Hub',
      sub: 'Malwa Regional Hub • Authorized Center',
      status: 'Active Lab',
      address: '301, 3rd Floor, Mahakaal Kanak, Malipura, Dewas Gate, Ujjain, M.P.',
      tags: ['✓ Offline Labs', '✓ Interview Prep', '✓ Doubt Clearing'],
      phone: '0734-4030236',
      phoneHref: 'tel:07344030236',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Malipura,+Ujjain',
      isHq: false
    },
    '4': {
      title: 'Nagpur Regional Hub',
      sub: 'Maharashtra Regional Hub • Authorized Center',
      status: 'Active Lab',
      address: 'Plot No. 12, 1st Floor, Near Sitabuldi Metro Interchange, Wardha Road, Sitabuldi, Nagpur, Maharashtra',
      tags: ['✓ Full-Stack Lab', '✓ Placement Cell', '✓ Cloud Workstations'],
      phone: '0712-2550188',
      phoneHref: 'tel:07122550188',
      mapUrl: 'https://maps.google.com/?q=Miracle+IT+Career+Academy,+Sitabuldi,+Nagpur',
      isHq: false
    },
    'bhopal': {
      title: 'Bhopal Headquarters (Main Campus)',
      sub: 'M.P. Nagar Zone-II • Central Academy Campus',
      status: 'HQ Campus',
      address: 'Plot No.80, 3rd Floor, Aakriti Complex, Zone-2, M.P. Nagar, Bhopal, M.P.',
      tags: ['✓ Central Academy HQ', '✓ 4 Advanced Tech Labs', '✓ Visiting Desk Open'],
      phone: '+91 78800 03127',
      phoneHref: 'tel:+917880003127',
      mapUrl: 'https://maps.google.com/?q=M.P.+Nagar,+Bhopal',
      isHq: true
    }
  };

  // Dynamic Telemetry HUD Updater
  section.updateTelemetryHud = function(key) {
    const data = REGIONAL_CENTERS_INFO[String(key)];
    if (!data) return;

    const hud = section.querySelector('#mapTelemetryHud');
    if (!hud) return;

    hud.classList.toggle('is-hq', !!data.isHq);

    const titleEl = hud.querySelector('#hudCenterTitle');
    const subEl = hud.querySelector('#hudCenterSub');
    const badgeEl = hud.querySelector('#hudBadgeStatus');
    const addrEl = hud.querySelector('#hudCenterAddress');
    const pillsRow = hud.querySelector('#hudPillsRow');
    const callBtn = hud.querySelector('#hudCallBtn');
    const phoneText = hud.querySelector('#hudPhoneText');
    const mapBtn = hud.querySelector('#hudMapBtn');
    const syncBtn = hud.querySelector('#hudSyncBtn');

    if (titleEl) titleEl.textContent = data.title;
    if (subEl) subEl.textContent = data.sub;
    if (badgeEl) badgeEl.textContent = data.status;
    if (addrEl) addrEl.textContent = data.address;
    if (phoneText) phoneText.textContent = data.phone;
    if (callBtn) callBtn.setAttribute('href', data.phoneHref);
    if (mapBtn) mapBtn.setAttribute('href', data.mapUrl);

    if (pillsRow) {
      pillsRow.innerHTML = data.tags.map(t => `<span class="hud-pill-tag">${t}</span>`).join('');
    }

    if (syncBtn) {
      syncBtn.setAttribute('data-target-center', String(key));
      if (data.isHq) {
        syncBtn.innerHTML = '<span>Visit Bhopal Desk ↑</span>';
      } else {
        syncBtn.innerHTML = '<span>Focus 3D Card ➔</span>';
      }
    }

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
  };

  // Click & Keyboard Navigation on SVG Pins
  const allNodes = section.querySelectorAll('.map-campus-node');
  allNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const pinId = node.getAttribute('data-center-id');
      const pinIdx = node.getAttribute('data-center-index');
      if (pinId === 'bhopal') {
        section.updateTelemetryHud('bhopal');
      } else if (pinIdx !== null) {
        section.updateTelemetryHud(pinIdx);
      }
    });
    node.addEventListener('click', () => {
      const pinId = node.getAttribute('data-center-id');
      const pinIdx = node.getAttribute('data-center-index');

      if (pinId === 'bhopal') {
        section.updateTelemetryHud('bhopal');
      } else if (pinIdx !== null) {
        const correspondingPill = section.querySelector(`.orbit-city-pill[data-orbit-target="${pinIdx}"]`);
        if (correspondingPill) {
          correspondingPill.click();
        }
        section.updateTelemetryHud(pinIdx);
      }
    });

    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        node.click();
      }
    });
  });

  // HUD Sync Action Button (Rotate Carousel or Scroll to Bhopal Desk)
  const syncBtn = section.querySelector('#hudSyncBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      const target = syncBtn.getAttribute('data-target-center');
      if (target === 'bhopal') {
        const bhopalCard = section.querySelector('.location-info-card');
        if (bhopalCard) {
          bhopalCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (target !== null) {
        const pill = section.querySelector(`.orbit-city-pill[data-orbit-target="${target}"]`);
        if (pill) {
          pill.click();
          const stage = section.querySelector('#centers3dStage');
          if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }

  // Map Filter Category Tabs (All, Bhopal HQ, MP Centers, Nagpur MH)
  const filterBtns = section.querySelectorAll('.map-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.getAttribute('data-filter');
      allNodes.forEach(node => {
        const pinId = node.getAttribute('data-center-id');
        let shouldShow = true;

        if (filter === 'bhopal') {
          shouldShow = (pinId === 'bhopal');
        } else if (filter === 'mp') {
          shouldShow = (pinId === 'bhopal' || pinId === 'jabalpur' || pinId === 'gwalior' || pinId === 'ujjain' || pinId === 'ratlam');
        } else if (filter === 'mh') {
          shouldShow = (pinId === 'nagpur');
        }

        node.classList.toggle('is-dimmed', !shouldShow);
      });

      if (filter === 'bhopal') {
        section.updateTelemetryHud('bhopal');
      } else if (filter === 'mh') {
        const nagpurPill = section.querySelector('.orbit-city-pill[data-orbit-target="4"]');
        if (nagpurPill) nagpurPill.click();
        section.updateTelemetryHud('4');
      } else if (filter === 'mp') {
        const jabalpurPill = section.querySelector('.orbit-city-pill[data-orbit-target="0"]');
        if (jabalpurPill) jabalpurPill.click();
        section.updateTelemetryHud('0');
      }
    });
  });

  // Initial HUD activation with index 0 (Jabalpur)
  section.updateTelemetryHud(0);
}

if (typeof window !== 'undefined') {
  window.initLocation = initLocation;
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initLocation();
  } else {
    document.addEventListener('DOMContentLoaded', () => initLocation());
  }
}
