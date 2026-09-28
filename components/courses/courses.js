/**
 * COURSES SECTION CONTROLLER — EDITORIAL INDEX & DIRECTIONAL SLIDE PREVIEW (v4.5)
 * Miracle IT Career Academy
 * 
 * Features:
 * - Fluid, instantaneous desktop hover & keyboard focus selection
 * - Non-blocking rapid cursor tracking (no stuck states, seamless interruption)
 * - Directional subtle horizontal glide animations (260ms hardware-accelerated)
 * - Mobile tap / click selection
 * - ARIA tablist / tabpanel synchronization
 * - Reduced motion instant switching support
 * - Counselling form pre-selection integration
 */

function initCourses(container = document) {
  const section = container.querySelector('#courses') || document.querySelector('#courses');
  if (!section) return;

  // Prevent multiple bindings
  if (section.dataset.coursesInitialized === 'true') return;
  section.dataset.coursesInitialized = 'true';

  const navItems = Array.from(section.querySelectorAll('.course-nav-item'));
  const cards = Array.from(section.querySelectorAll('.course-preview-card'));

  if (!navItems.length || !cards.length) return;

  let activeIndex = 0;
  let transitionTimer = null;
  let hoverDebounceTimer = null;

  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Directional slide transition between course cards
   * Non-blocking, interruptible, robust against fast cursor movements
   */
  const setActiveCourse = (newIndex) => {
    if (newIndex === activeIndex && cards[newIndex].classList.contains('is-active')) {
      return;
    }

    const prevIndex = activeIndex;
    const direction = newIndex > prevIndex ? 'forward' : 'backward';

    // Clear any pending animation cleanup timer
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      transitionTimer = null;
    }

    const prevNav = navItems[prevIndex];
    const nextNav = navItems[newIndex];
    const prevCard = cards[prevIndex];
    const nextCard = cards[newIndex];

    if (!nextNav || !nextCard) return;

    // Immediately update Nav Items active & ARIA states for instant feedback
    navItems.forEach((item, idx) => {
      const isCurrent = idx === newIndex;
      item.classList.toggle('is-active', isCurrent);
      item.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    if (window.innerWidth < 768) {
      nextNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Clean up any cards that are neither previous nor next
    cards.forEach((c, idx) => {
      if (idx !== newIndex && idx !== prevIndex) {
        c.classList.remove('is-active', 'is-entering-left', 'is-entering-right', 'is-exiting-left', 'is-exiting-right');
        c.hidden = true;
      }
    });

    // Reduced motion fallback: instant swap
    if (prefersReducedMotion()) {
      if (prevCard && prevCard !== nextCard) {
        prevCard.classList.remove('is-active', 'is-entering-left', 'is-entering-right', 'is-exiting-left', 'is-exiting-right');
        prevCard.hidden = true;
      }
      nextCard.classList.remove('is-entering-left', 'is-entering-right', 'is-exiting-left', 'is-exiting-right');
      nextCard.classList.add('is-active');
      nextCard.hidden = false;
      activeIndex = newIndex;
      return;
    }

    // Prepare incoming card position
    nextCard.hidden = false;
    nextCard.classList.remove('is-active', 'is-exiting-left', 'is-exiting-right');
    nextCard.classList.add(direction === 'forward' ? 'is-entering-right' : 'is-entering-left');

    // Force layout reflow before triggering CSS transition
    void nextCard.offsetWidth;

    // Animate previous card out
    if (prevCard && prevCard !== nextCard) {
      prevCard.classList.remove('is-active', 'is-entering-left', 'is-entering-right');
      prevCard.classList.add(direction === 'forward' ? 'is-exiting-left' : 'is-exiting-right');
    }

    // Animate incoming card to center active position
    requestAnimationFrame(() => {
      nextCard.classList.remove('is-entering-left', 'is-entering-right');
      nextCard.classList.add('is-active');
    });

    activeIndex = newIndex;

    // Transition completion cleanup
    transitionTimer = setTimeout(() => {
      if (prevCard && prevCard !== cards[activeIndex]) {
        prevCard.classList.remove('is-exiting-left', 'is-exiting-right', 'is-active');
        prevCard.hidden = true;
      }
      transitionTimer = null;
    }, 280);
  };

  // Nav Item Event Listeners
  navItems.forEach((item, index) => {
    // Desktop: Smooth, non-blocking hover selection
    const handleHover = () => {
      if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
      hoverDebounceTimer = setTimeout(() => {
        setActiveCourse(index);
      }, 35);
    };

    item.addEventListener('mouseenter', handleHover);
    item.addEventListener('pointerenter', handleHover);

    // Immediate selection on click / touch
    item.addEventListener('click', () => {
      if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
      setActiveCourse(index);
    });

    // Keyboard focus selection
    item.addEventListener('focus', () => {
      if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
      setActiveCourse(index);
    });

    // Keyboard Arrow navigation (ArrowUp / ArrowDown)
    item.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (index + 1) % navItems.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (index - 1 + navItems.length) % navItems.length;
      }

      if (targetIndex !== null) {
        navItems[targetIndex].focus();
        setActiveCourse(targetIndex);
      }
    });
  });

  // Pre-select course in counselling form when "Book Free Counselling" is clicked
  section.querySelectorAll('[data-track-cta^="book_course_"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ctaType = btn.getAttribute('data-track-cta');
      let courseValue = 'Not Sure';

      if (ctaType.includes('fullstack')) courseValue = 'Full Stack';
      else if (ctaType.includes('data_analytics')) courseValue = 'Data Analytics / Data Science';
      else if (ctaType.includes('aiml')) courseValue = 'AI / ML';
      else if (ctaType.includes('cybersecurity')) courseValue = 'Cybersecurity';
      else if (ctaType.includes('devops')) courseValue = 'Cloud / DevOps';
      else if (ctaType.includes('custom')) courseValue = 'Other';

      const courseSelect = document.querySelector('#courseInterest');
      if (courseSelect) {
        courseSelect.value = courseValue;
        courseSelect.dispatchEvent(new Event('change'));
      }
    });
  });
}

// Global registration and auto-initialization
if (typeof window !== 'undefined') {
  window.initCourses = initCourses;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCourses());
  } else {
    initCourses();
  }
}
