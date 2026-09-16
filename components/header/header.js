/**
 * HEADER COMPONENT CONTROLLER (v4.0 OPTIMIZED & PIN-SPACER AWARE)
 * Miracle IT Career Academy
 * 
 * Features:
 * - Mobile drawer management with outside-click & escape-key closing
 * - Auto-close mobile drawer when any link or CTA is tapped
 * - Synchronized accessibility (aria-expanded, aria-label)
 * - Optimized scroll elevation with requestAnimationFrame throttling
 * - Accurate ScrollSpy with full GSAP pin-spacer & dynamic offset awareness
 */

function initHeader(container = document) {
  const header = container.querySelector('#siteHeader') || document.querySelector('#siteHeader');
  if (!header) return;

  // Prevent multiple bindings on re-initialization
  if (header.dataset.initialized === 'true') return;
  header.dataset.initialized = 'true';

  const toggleBtn = header.querySelector('#navToggle') || document.querySelector('#navToggle');
  const navMenu = header.querySelector('#navMenu') || document.querySelector('#navMenu');

  const closeMobileMenu = () => {
    if (navMenu && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      }
    }
  };

  const openMobileMenu = () => {
    if (navMenu) {
      navMenu.classList.add('is-open');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('aria-label', 'Close navigation menu');
      }
    }
  };

  // Mobile toggle button listener
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on navigation link or mobile CTA button click
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on click outside header
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('is-open') &&
        !navMenu.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMobileMenu();
        toggleBtn.focus();
      }
    });

    // Close mobile drawer on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    }, { passive: true });
  }

  // Scroll Elevation & ScrollSpy
  const navLinks = header.querySelectorAll('.nav-link[href^="#"]');
  const sections = Array.from(navLinks)
    .map((link) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return null;
      try {
        const el = document.querySelector(id);
        return el ? { id, el, link } : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  let isTicking = false;

  const updateHeaderOnScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    // Header scroll elevation
    if (scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // ScrollSpy active link detection (immune to pin-spacers and offsetParent bugs)
    if (sections.length > 0) {
      const headerHeight = 85;
      let currentSectionId = null;

      // At top of page (hero area), clear all active links
      if (scrollY < 300) {
        sections.forEach(({ link }) => link.classList.remove('is-active'));
        isTicking = false;
        return;
      }

      // Check each section in DOM order
      sections.forEach(({ id, el }) => {
        // If element is pinned, check its pin spacer if available for true physical viewport span
        const spacer = el.closest('.pin-spacer') || el.parentElement?.closest('.pin-spacer');
        const targetEl = spacer || el;
        const rect = targetEl.getBoundingClientRect();

        // Active if top is at or above detection line and bottom is still below header
        if (rect.top <= headerHeight + 120 && rect.bottom > headerHeight + 60) {
          currentSectionId = id;
        }
      });

      sections.forEach(({ id, link }) => {
        if (id === currentSectionId) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }

    isTicking = false;
  };

  const handleScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateHeaderOnScroll);
      isTicking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateHeaderOnScroll();
}

// Auto-run if DOM is already ready, and register globally
if (typeof window !== 'undefined') {
  window.initHeader = initHeader;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initHeader());
  } else {
    initHeader();
  }
}