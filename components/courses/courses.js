/**
 * COURSES SECTION CONTROLLER — EDITORIAL INDEX & DIRECTIONAL SLIDE PREVIEW (v4.0)
 * Miracle IT Career Academy
 * 
 * Features:
 * - Desktop hover & keyboard focus selection
 * - Directional horizontal slide animations (enter-from-right / enter-from-left)
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
  let isTransitioning = false;

  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Directional slide transition between course cards
   */
  const setActiveCourse = (newIndex) => {
    if (newIndex === activeIndex || isTransitioning) return;

    const prevIndex = activeIndex;
    const direction = newIndex > prevIndex ? 'forward' : 'backward';
    isTransitioning = true;

    const prevNav = navItems[prevIndex];
    const nextNav = navItems[newIndex];
    const prevCard = cards[prevIndex];
    const nextCard = cards[newIndex];

    // Update Nav Items active & ARIA states
    if (prevNav) {
      prevNav.classList.remove('is-active');
      prevNav.setAttribute('aria-selected', 'false');
    }
    if (nextNav) {
      nextNav.classList.add('is-active');
      nextNav.setAttribute('aria-selected', 'true');
      if (window.innerWidth < 768) {
        nextNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }

    // Reduced motion fallback: instant swap
    if (prefersReducedMotion()) {
      if (prevCard) {
        prevCard.classList.remove('is-active');
        prevCard.hidden = true;
      }
      if (nextCard) {
        nextCard.classList.add('is-active');
        nextCard.hidden = false;
      }
      activeIndex = newIndex;
      isTransitioning = false;
      return;
    }

    // Prepare incoming card position
    nextCard.hidden = false;
    nextCard.classList.remove('is-active', 'is-exiting-left', 'is-exiting-right', 'is-entering-left', 'is-entering-right');

    if (direction === 'forward') {
      nextCard.classList.add('is-entering-right');
    } else {
      nextCard.classList.add('is-entering-left');
    }

    // Force layout reflow before triggering CSS transition
    void nextCard.offsetWidth;

    // Animate previous card out
    if (prevCard) {
      prevCard.classList.remove('is-active', 'is-entering-left', 'is-entering-right');
      if (direction === 'forward') {
        prevCard.classList.add('is-exiting-left');
      } else {
        prevCard.classList.add('is-exiting-right');
      }
    }

    // Animate incoming card to center
    requestAnimationFrame(() => {
      nextCard.classList.remove('is-entering-left', 'is-entering-right');
      nextCard.classList.add('is-active');
    });

    activeIndex = newIndex;

    // Transition completion cleanup
    setTimeout(() => {
      if (prevCard && prevIndex !== activeIndex) {
        prevCard.classList.remove('is-exiting-left', 'is-exiting-right');
        prevCard.hidden = true;
      }
      isTransitioning = false;
    }, 540);
  };

  // Nav Item Event Listeners
  navItems.forEach((item, index) => {
    // Desktop: Hover selection
    item.addEventListener('mouseenter', () => {
      setActiveCourse(index);
    });

    // Keyboard & Mobile: Click / Touch selection
    item.addEventListener('click', (e) => {
      setActiveCourse(index);
    });

    // Keyboard focus selection
    item.addEventListener('focus', () => {
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
