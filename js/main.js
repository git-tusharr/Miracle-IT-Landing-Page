/**
 * MIRACLE IT CAREER ACADEMY — MASTER ORCHESTRATOR (v3.1 OPTIMIZED)
 * 
 * High-performance, lightweight component loader designed specifically for Live Server.
 * Features:
 *  - Parallel asynchronous component mounting with no-store cache busting
 *  - Native IntersectionObserver scroll animations
 *  - Central configuration DOM injection
 *  - Analytics event dispatching & CTA click binding
 *  - Zero external dependencies or build tools
 */

const LANDING_COMPONENTS = [
  'header',
  'hero',
  'problem',
  'courses',
  'why-miracle-it',
  'learning-experience',
  'who-can-join',
  'counselling-process',
  'proof',
  'location',
  'faq',
  'counselling-form',
  'final-cta',
  'footer',
  'mobile-sticky-cta'
];

// In-memory component HTML cache
const componentCache = new Map();

/**
 * Fetches and mounts a single component HTML chunk
 */
async function loadComponent(name) {
  const mountPoint = document.querySelector(`[data-component="${name}"]`);
  if (!mountPoint) return;

  const initFnName = `init${name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`;

  // If already pre-rendered in index.html, initialize immediately (100% zero-config file:// & server support)
  if (mountPoint.children.length > 0) {
    mountPoint.classList.add('component-loaded');
    if (typeof window[initFnName] === 'function') {
      window[initFnName](mountPoint);
    }
    return;
  }

  const componentPath = `./components/${name}/${name}.html?v=${Date.now()}`;

  try {
    let html = componentCache.get(name);
    if (!html) {
      const response = await fetch(componentPath, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading ${componentPath}`);
      }
      html = await response.text();
      componentCache.set(name, html);
    }

    // Ensure component-specific stylesheet is registered in document.head
    const existingCss = document.querySelector(`link[href*="${name}.css"]`);
    if (!existingCss) {
      const link = document.createElement('link');
      link.id = `css-comp-${name}`;
      link.rel = 'stylesheet';
      link.href = `./components/${name}/${name}.css?v=${Date.now()}`;
      document.head.appendChild(link);
    }

    mountPoint.innerHTML = html;
    mountPoint.classList.add('component-loaded');

    // Trigger component-specific initializer if defined
    const initFnName = `init${name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`;
    if (typeof window[initFnName] === 'function') {
      window[initFnName](mountPoint);
    }
  } catch (error) {
    console.error(`[ComponentLoader] Error loading ${name}:`, error);

    if (window.location.protocol === 'file:') {
      mountPoint.innerHTML = `
        <div style="padding: 2rem; background: #FFFBEB; border: 1px dashed #D97706; border-radius: 8px; margin: 1rem 0; font-family: sans-serif; text-align: center;">
          <h3 style="color: #B45309; margin-bottom: 0.5rem;">Live Server Required for Component: <code>${name}</code></h3>
          <p style="color: #78350F; font-size: 0.9rem;">Modern browsers restrict modular HTML fetching over <code>file://</code>.<br>
          Please right-click <strong>index.html</strong> in VS Code and select <strong>"Open with Live Server"</strong>.</p>
        </div>
      `;
    }
  }
}

/**
 * Initializes IntersectionObserver for gentle on-scroll transitions
 */
function initScrollObserver() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.card, .section-header, .experience-card, .process-step-item').forEach(el => {
    el.classList.add('fade-in-up');
    observer.observe(el);
  });
}

/**
 * Smooth scrolling offset calculation for sticky header
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile drawer if open
        const navMenu = document.querySelector('#navMenu');
        if (navMenu && navMenu.classList.contains('is-open')) {
          navMenu.classList.remove('is-open');
          const toggleBtn = document.querySelector('#navToggle');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

/**
 * Master Page Assembly
 */
async function assemblePage() {
  const startTime = performance.now();
  console.log('[Miracle IT] Assembling optimized modular components...');

  // Mount components concurrently
  await Promise.all(LANDING_COMPONENTS.map(name => loadComponent(name)));

  // Populate dynamic central business configuration (phone, address, etc.)
  if (typeof window.applySiteConfig === 'function') {
    window.applySiteConfig(document);
  }

  // Bind CTA click tracking
  if (typeof window.Analytics?.initCTATracking === 'function') {
    window.Analytics.initCTATracking(document);
  }

  // Populate UTM parameters into counselling form
  const leadForm = document.querySelector('#counsellingForm');
  if (leadForm && typeof window.populateFormUTMs === 'function') {
    window.populateFormUTMs(leadForm);
  }

  // Initialize smooth scroll & subtle scroll observer
  initSmoothScroll();
  initScrollObserver();

  // Fire analytics page_view event
  if (typeof window.trackEvent === 'function') {
    window.trackEvent('page_view', {
      page: 'Career Counselling Landing Page (Bhopal)',
      path: window.location.pathname
    });
  }

  const duration = Math.round(performance.now() - startTime);
  console.log(`[Miracle IT] Page assembly completed in ${duration}ms. Ready for visitor conversion.`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', assemblePage);
} else {
  assemblePage();
}
