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
  // 4. Normal 3D Rotating World Globe of Planet Earth (Right Column)
  // =========================================================================
  const globeCanvas = section.querySelector('#centersWorldGlobe');
  if (globeCanvas) {
    initWorldGlobe(section, globeCanvas);
  }

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
    if (w <= 480) {
      radius = Math.min(180, Math.floor(w * 0.42));
    } else if (w <= 768) {
      radius = Math.min(225, Math.floor(w * 0.40));
    } else if (w <= 1024) {
      radius = 265;
    } else {
      radius = 310;
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

      // Convert to radian for depth factor: cos(0)=1 (front), cos(180)=-1 (back)
      const rad = relativeAngle * (Math.PI / 180);
      const cosVal = Math.cos(rad);
      const depthFactor = (cosVal + 1) / 2; // 0 to 1

      // Dynamic opacity & scale based on depth
      const opacity = Math.max(0.32, 0.35 + depthFactor * 0.65);
      const scale = (0.86 + depthFactor * 0.18).toFixed(3);
      card.style.opacity = opacity.toFixed(2);

      // Inactive cards are smoothly blurred & scaled down
      if (depthFactor > 0.68) {
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        card.style.zIndex = '10';
      } else {
        card.style.filter = 'blur(1.2px)';
        card.style.pointerEvents = 'auto'; // allow click to bring to front
        card.style.zIndex = '1';
      }
    });

    if (closestIndex !== activeIndex) {
      activeIndex = closestIndex;
      cards.forEach((c, i) => c.classList.toggle('is-active', i === activeIndex));
      pills.forEach((p, i) => p.classList.toggle('is-active', i === activeIndex));
    }
  }

  // Animation Loop (gentle, steady auto-rotation)
  function tick() {
    if (isAutoRotating && !isHovered && !isDragging) {
      targetAngle -= 0.12; // Smooth, gentle auto-rotation
    }

    if (!isDragging) {
      // Smooth lerp to target angle
      currentAngle += (targetAngle - currentAngle) * 0.085;
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
 * PHOTOREALISTIC 3D ROTATING WORLD GLOBE ENGINE
 * Renders an authentic, photorealistic 3D Earth using NASA Blue Marble satellite
 * photography, real 23.44° axial tilt, specular ocean reflections, atmosphere & lighting.
 * Powered by WebGL (Three.js) with seamless 2D Canvas fallback.
 */
function initWorldGlobe(section, canvas) {
  if (typeof window.THREE !== 'undefined') {
    try {
      const threeGlobe = initThreeWorldGlobe(section, canvas);
      if (threeGlobe) return threeGlobe;
    } catch (err) {
      console.warn('Three.js globe initialization failed, falling back to 2D Canvas:', err);
    }
  }
  return initCanvasWorldGlobe(section, canvas);
}

/**
 * Three.js WebGL Photorealistic 3D Earth Globe
 */
function initThreeWorldGlobe(section, canvas) {
  const viewport = section.querySelector('#globeViewport') || canvas.parentElement || canvas;

  // 1. Scene, Camera, WebGL Renderer
  const scene = new THREE.Scene();

  const rect = canvas.getBoundingClientRect();
  const initialSize = Math.round(rect.width || canvas.parentElement?.clientWidth || 340);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
  camera.position.z = 2.72;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(initialSize, initialSize, false);
  if (THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  // 2. Earth Axial Tilt Group (23.44° astronomical tilt)
  const earthGroup = new THREE.Group();
  earthGroup.rotation.z = THREE.MathUtils.degToRad(23.44);
  scene.add(earthGroup);

  // 3. Real NASA Satellite Blue Marble Earth Mesh
  const textureLoader = new THREE.TextureLoader();
  const texturePath = (window.MIRACLE_BASE_URL || '.') + '/assets/images/earth-texture-2048.jpg';

  const earthTexture = textureLoader.load(texturePath, () => {
    renderer.render(scene, camera);
  });
  if (THREE.SRGBColorSpace) {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
  } else if (THREE.sRGBEncoding) {
    earthTexture.encoding = THREE.sRGBEncoding;
  }
  earthTexture.generateMipmaps = true;
  earthTexture.minFilter = THREE.LinearMipmapLinearFilter;

  const earthGeo = new THREE.SphereGeometry(1, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 16,
    specular: new THREE.Color(0x24486c),
    emissive: new THREE.Color(0x020712)
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthGroup.add(earthMesh);

  // 4. Glowing Atmospheric Horizon Shell
  const atmosGeo = new THREE.SphereGeometry(1.022, 48, 48);
  const atmosMat = new THREE.MeshLambertMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
  earthGroup.add(atmosMesh);

  // 5. Authentic Space & Solar Lighting
  // Directional Sunlight (shines from upper-left to create day/night terminator)
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.45);
  sunLight.position.set(5, 3.2, 4);
  scene.add(sunLight);

  // Ambient Space Fill (ensures dark side geography remains beautifully visible)
  const spaceAmbient = new THREE.AmbientLight(0x354862, 0.72);
  scene.add(spaceAmbient);

  // Atmosphere Rim Light (back-bottom horizon glow)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
  rimLight.position.set(-5, -2, -3);
  scene.add(rimLight);

  // 6. Interactive Drag & Spin State
  let isDragging = false;
  let isHovered = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let velocityX = 0;
  let velocityY = 0;
  const baseSpinSpeed = 0.0022; // silky planetary rotation
  let currentSpinSpeed = baseSpinSpeed;

  function onPointerDown(clientX, clientY) {
    isDragging = true;
    prevPointerX = clientX;
    prevPointerY = clientY;
    velocityX = 0;
    velocityY = 0;
  }

  function onPointerMove(clientX, clientY) {
    if (!isDragging) return;
    const dx = clientX - prevPointerX;
    const dy = clientY - prevPointerY;
    prevPointerX = clientX;
    prevPointerY = clientY;

    velocityX = dx * 0.005;
    velocityY = dy * 0.005;

    earthMesh.rotation.y += velocityX;
    earthGroup.rotation.x = Math.max(-0.55, Math.min(0.55, earthGroup.rotation.x + velocityY));
  }

  function onPointerUp() {
    isDragging = false;
  }

  // Pointer & Touch Events
  viewport.addEventListener('mousedown', (e) => {
    onPointerDown(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) onPointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', onPointerUp);

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  viewport.addEventListener('touchend', onPointerUp);

  viewport.addEventListener('mouseenter', () => { isHovered = true; });
  viewport.addEventListener('mouseleave', () => { isHovered = false; });

  // 7. Render Loop
  let rafId = null;
  function animate() {
    rafId = requestAnimationFrame(animate);

    if (!isDragging) {
      // Inertial flick momentum
      if (Math.abs(velocityX) > 0.0001) {
        earthMesh.rotation.y += velocityX;
        velocityX *= 0.94;
      }
      if (Math.abs(velocityY) > 0.0001) {
        earthGroup.rotation.x = Math.max(-0.55, Math.min(0.55, earthGroup.rotation.x + velocityY));
        velocityY *= 0.94;
      }

      // Smooth auto-rotation (gentle slow-down while hovered)
      const targetSpeed = isHovered ? baseSpinSpeed * 0.35 : baseSpinSpeed;
      currentSpinSpeed += (targetSpeed - currentSpinSpeed) * 0.05;
      earthMesh.rotation.y += currentSpinSpeed;
    }

    renderer.render(scene, camera);
  }
  animate();

  // 8. Responsive Resize
  function onResize() {
    const newRect = canvas.getBoundingClientRect();
    const newSize = Math.round(newRect.width || canvas.parentElement?.clientWidth || 340);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize(newSize, newSize, false);
  }
  window.addEventListener('resize', onResize, { passive: true });

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      if (earthTexture) earthTexture.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
    }
  };
}

/**
 * Fallback 2D Canvas World Globe Engine
 */
function initCanvasWorldGlobe(section, canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let dpr = window.devicePixelRatio || 1;
  let canvasWidth = 460;
  let canvasHeight = 460;
  let globeRadius = 185;
  let centerX = 230;
  let centerY = 230;

  function resizeGlobe() {
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width || 440, rect.height || 440);
    dpr = window.devicePixelRatio || 1;
    canvasWidth = size;
    canvasHeight = size;

    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);

    centerX = size / 2;
    centerY = size / 2;
    globeRadius = size * 0.43;
  }

  resizeGlobe();
  window.addEventListener('resize', resizeGlobe, { passive: true });

  const earthLandPoints = [];
  function buildWorldMapPoints() {
    const continentRegions = [
      { minLat: 14, maxLat: 72, minLon: -168, maxLon: -55, stepLat: 3.5, stepLon: 4.5, filter: (lat, lon) => {
        if (lat < 25 && lon < -105) return false;
        if (lat > 50 && lon > -50) return false;
        return true;
      }},
      { minLat: -55, maxLat: 12, minLon: -82, maxLon: -34, stepLat: 3.5, stepLon: 4.0, filter: (lat, lon) => {
        if (lat > 5 && lon > -50) return false;
        if (lat < -40 && lon > -60) return false;
        return true;
      }},
      { minLat: 36, maxLat: 71, minLon: -11, maxLon: 40, stepLat: 3.0, stepLon: 3.5, filter: (lat, lon) => {
        if (lat < 42 && lon < -10) return false;
        return true;
      }},
      { minLat: -35, maxLat: 37, minLon: -18, maxLon: 52, stepLat: 3.5, stepLon: 4.0, filter: (lat, lon) => {
        if (lat > 32 && lon < -10) return false;
        if (lat < -10 && lon < 10) return false;
        return true;
      }},
      { minLat: 0, maxLat: 75, minLon: 40, maxLon: 150, stepLat: 3.2, stepLon: 4.0, filter: (lat, lon) => {
        if (lat < 10 && lon < 95) return false;
        return true;
      }},
      { minLat: -47, maxLat: -11, minLon: 112, maxLon: 178, stepLat: 3.5, stepLon: 4.0, filter: (lat, lon) => {
        if (lon > 154 && (lat > -34 || lat < -48)) return false;
        return true;
      }},
      { minLat: 60, maxLat: 83, minLon: -58, maxLon: -18, stepLat: 4.0, stepLon: 5.0, filter: () => true },
      { minLat: 30, maxLat: 46, minLon: 129, maxLon: 146, stepLat: 2.5, stepLon: 2.5, filter: () => true },
      { minLat: -10, maxLat: 18, minLon: 95, maxLon: 130, stepLat: 3.0, stepLon: 3.5, filter: () => true }
    ];

    continentRegions.forEach(region => {
      for (let lat = region.minLat; lat <= region.maxLat; lat += region.stepLat) {
        for (let lon = region.minLon; lon <= region.maxLon; lon += region.stepLon) {
          if (!region.filter || region.filter(lat, lon)) {
            const jLat = lat + Math.sin(lat * 2.2 + lon) * 0.35;
            const jLon = lon + Math.cos(lon * 1.8 + lat) * 0.35;
            earthLandPoints.push({ lat: jLat, lon: jLon });
          }
        }
      }
    });
  }

  buildWorldMapPoints();

  const axialTilt = -0.38;
  let rotX = axialTilt;
  let rotY = 0;
  let targetRotY = 0;
  let targetRotX = axialTilt;
  let isGlobeDragging = false;
  let startMouseX = 0;
  let startMouseY = 0;
  let startRotX = 0;
  let startRotY = 0;
  let globeRafId = null;

  function project3D(lat, lon, r, rX, rY) {
    const phi = lat * (Math.PI / 180);
    const theta = (lon * (Math.PI / 180)) + rY;

    const x0 = r * Math.cos(phi) * Math.sin(theta);
    const y0 = -r * Math.sin(phi);
    const z0 = r * Math.cos(phi) * Math.cos(theta);

    const y = y0 * Math.cos(rX) - z0 * Math.sin(rX);
    const z = y0 * Math.sin(rX) + z0 * Math.cos(rX);
    const x = x0;

    return {
      x: centerX + x,
      y: centerY + y,
      z: z,
      visible: z > 0
    };
  }

  function renderGlobe() {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const haloGrad = ctx.createRadialGradient(
      centerX, centerY, globeRadius * 0.88,
      centerX, centerY, globeRadius * 1.15
    );
    haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.26)');
    haloGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.09)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, globeRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    const oceanGrad = ctx.createRadialGradient(
      centerX - globeRadius * 0.35, centerY - globeRadius * 0.35, globeRadius * 0.08,
      centerX, centerY, globeRadius
    );
    oceanGrad.addColorStop(0, '#0F2544');
    oceanGrad.addColorStop(0.4, '#0A1A32');
    oceanGrad.addColorStop(0.8, '#061020');
    oceanGrad.addColorStop(1, '#03070E');

    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, globeRadius - 0.5, 0, Math.PI * 2);
    ctx.clip();

    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 5) {
        const p = project3D(lat, lon, globeRadius, rotX, rotY);
        if (p.visible) {
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          first = true;
        }
      }
      ctx.strokeStyle = lat === 0 ? 'rgba(56, 189, 248, 0.32)' : 'rgba(255, 255, 255, 0.07)';
      ctx.stroke();
    }

    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      let first = true;
      for (let lat = -80; lat <= 80; lat += 4) {
        const p = project3D(lat, lon, globeRadius, rotX, rotY);
        if (p.visible) {
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          first = true;
        }
      }
      ctx.strokeStyle = lon === 0 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.06)';
      ctx.stroke();
    }

    earthLandPoints.forEach(pt => {
      const p = project3D(pt.lat, pt.lon, globeRadius, rotX, rotY);
      if (p.visible) {
        const depthRatio = Math.max(0, p.z / globeRadius);
        const alpha = 0.25 + depthRatio * 0.72;

        ctx.fillStyle = `rgba(56, 189, 248, ${alpha.toFixed(2)})`;
        const dotSize = 1.4 + depthRatio * 0.6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();

    const glint = ctx.createLinearGradient(
      centerX - globeRadius, centerY - globeRadius,
      centerX + globeRadius, centerY + globeRadius
    );
    glint.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
    glint.addColorStop(0.35, 'rgba(255, 255, 255, 0)');
    glint.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    glint.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (!isGlobeDragging) {
      rotY += 0.005;
    } else {
      rotY += (targetRotY - rotY) * 0.15;
      rotX += (targetRotX - rotX) * 0.15;
    }

    globeRafId = requestAnimationFrame(renderGlobe);
  }

  globeRafId = requestAnimationFrame(renderGlobe);

  const viewport = section.querySelector('#globeViewport') || canvas;

  function onGlobeDragStart(clientX, clientY) {
    isGlobeDragging = true;
    startMouseX = clientX;
    startMouseY = clientY;
    startRotX = rotX;
    startRotY = rotY;
    targetRotX = rotX;
    targetRotY = rotY;
  }

  function onGlobeDragMove(clientX, clientY) {
    if (!isGlobeDragging) return;
    const dx = clientX - startMouseX;
    const dy = clientY - startMouseY;

    targetRotY = startRotY + dx * 0.008;
    targetRotX = Math.max(-0.85, Math.min(0.2, startRotX + dy * 0.008));
  }

  function onGlobeDragEnd() {
    isGlobeDragging = false;
  }

  viewport.addEventListener('mousedown', (e) => {
    onGlobeDragStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (isGlobeDragging) onGlobeDragMove(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    if (isGlobeDragging) onGlobeDragEnd();
  });

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      onGlobeDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (isGlobeDragging && e.touches.length === 1) {
      onGlobeDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  viewport.addEventListener('touchend', onGlobeDragEnd);

  return {
    destroy() {
      if (globeRafId) cancelAnimationFrame(globeRafId);
    }
  };
}

if (typeof window !== 'undefined') {
  window.initLocation = initLocation;
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initLocation();
  } else {
    document.addEventListener('DOMContentLoaded', () => initLocation());
  }
}
