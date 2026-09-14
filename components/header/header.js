/**
 * HEADER COMPONENT CONTROLLER (v2.0 OPTIMIZED)
 * Mobile drawer management, scroll elevation, and scrollspy active links.
 */

function initHeader(container = document) {
  const header = container.querySelector('#siteHeader') || document.querySelector('#siteHeader');
  const toggleBtn = container.querySelector('#navToggle') || document.querySelector('#navToggle');
  const navMenu = container.querySelector('#navMenu') || document.querySelector('#navMenu');

  if (!header) return;

  // Toggle mobile navigation
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    });
  }

  // Scroll Elevation & ScrollSpy
  const navLinks = header.querySelectorAll('.nav-link[href^="#"]');
  const sections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('href');
    return document.querySelector(id);
  }).filter(Boolean);

  const handleScroll = () => {
    // Header shadow
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // ScrollSpy active link detection
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = `#${section.id}`;
      const matchingLink = header.querySelector(`.nav-link[href="${id}"]`);

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('is-active'));
        if (matchingLink) matchingLink.classList.add('is-active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

if (typeof window !== 'undefined') {
  window.initHeader = initHeader;
}
