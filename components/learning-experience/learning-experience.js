/**
 * LEARNING EXPERIENCE CONTROLLER — 3D CIRCULAR COVERFLOW CAROUSEL (v4.1)
 * Miracle IT Career Academy
 * 
 * Features:
 * - Automatic rotation every 2.5 seconds (2–3s interval)
 * - Immediate stop when hovering over the carousel
 * - Resumes automatic scrolling when mouse leaves
 * - Continuous 4-card 3D perspective circular orbit
 * - Hardware-accelerated GSAP transitions (window.gsap)
 * - Prev / Next navigation buttons
 * - Interactive pagination dots with ARIA synchronization
 * - Direct clicking on visible side cards to bring them to center
 * - Touch & swipe gesture detection
 * - Keyboard navigation (ArrowLeft / ArrowRight)
 * - Accessibility & prefers-reduced-motion support
 */

function initLearningExperience(container = document) {
  const section = container.querySelector('#learning-experience') || document.querySelector('#learning-experience');
  if (!section) return;

  // Prevent multiple bindings
  if (section.dataset.carouselInitialized === 'true') return;
  section.dataset.carouselInitialized = 'true';

  const wrapper = section.querySelector('.learning-carousel-wrapper');
  const stage = section.querySelector('.learning-carousel-stage');
  const cards = Array.from(section.querySelectorAll('.carousel-card'));
  const prevBtn = section.querySelector('.carousel-prev');
  const nextBtn = section.querySelector('.carousel-next');
  const indicatorBtns = Array.from(section.querySelectorAll('.carousel-indicator'));

  if (!cards.length) return;

  const totalCards = cards.length;
  let activeIndex = 0;
  let autoplayTimer = null;
  let isTransitioning = false;
  let isHovered = false;
  const AUTOPLAY_INTERVAL = 2500; // 2.5 seconds (between 2-3 seconds)

  // Check reduced motion preference
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Calculate responsive 3D transformation values
   */
  const getDimensions = () => {
    const width = window.innerWidth;
    if (width <= 420) {
      return {
        sideOffset: 140,
        depthCenter: 30,
        depthSide: -35,
        depthBack: -110,
        rotateAngle: 12,
        scaleCenter: 1,
        scaleSide: 0.83,
        scaleBack: 0.62
      };
    } else if (width <= 768) {
      return {
        sideOffset: 195,
        depthCenter: 45,
        depthSide: -50,
        depthBack: -145,
        rotateAngle: 16,
        scaleCenter: 1,
        scaleSide: 0.85,
        scaleBack: 0.64
      };
    } else if (width <= 1024) {
      return {
        sideOffset: 265,
        depthCenter: 70,
        depthSide: -60,
        depthBack: -180,
        rotateAngle: 22,
        scaleCenter: 1,
        scaleSide: 0.86,
        scaleBack: 0.66
      };
    } else {
      return {
        sideOffset: 345,
        depthCenter: 100,
        depthSide: -65,
        depthBack: -220,
        rotateAngle: 26,
        scaleCenter: 1,
        scaleSide: 0.86,
        scaleBack: 0.66
      };
    }
  };

  /**
   * Determine relative position offset in range {-1, 0, 1, 2}
   */
  const getRelativePosition = (cardIndex, currentActive) => {
    let diff = (cardIndex - currentActive) % totalCards;
    if (diff < 0) diff += totalCards;
    if (diff === 0) return 0;   // Center
    if (diff === 1) return 1;   // Right
    if (diff === 2) return 2;   // Back
    if (diff === 3) return -1;  // Left
    return 0;
  };

  /**
   * Position all cards in 3D orbit
   */
  const updatePositions = (immediate = false) => {
    const dim = getDimensions();
    const gsap = window.gsap;
    const reducedMotion = prefersReducedMotion();

    cards.forEach((card, index) => {
      const pos = getRelativePosition(index, activeIndex);

      let targetX = 0;
      let targetZ = 0;
      let targetRotateY = 0;
      let targetScale = 1;
      let targetOpacity = 1;
      let targetZIndex = 1;

      card.classList.remove('is-center', 'is-side', 'is-back');

      if (pos === 0) {
        // CENTER active card
        targetX = 0;
        targetZ = dim.depthCenter;
        targetRotateY = 0;
        targetScale = dim.scaleCenter;
        targetOpacity = 1;
        targetZIndex = 10;
        card.classList.add('is-center');
        card.setAttribute('aria-hidden', 'false');
      } else if (pos === 1) {
        // RIGHT side card
        targetX = dim.sideOffset;
        targetZ = dim.depthSide;
        targetRotateY = -dim.rotateAngle;
        targetScale = dim.scaleSide;
        targetOpacity = 0.72;
        targetZIndex = 5;
        card.classList.add('is-side');
        card.setAttribute('aria-hidden', 'true');
      } else if (pos === -1) {
        // LEFT side card
        targetX = -dim.sideOffset;
        targetZ = dim.depthSide;
        targetRotateY = dim.rotateAngle;
        targetScale = dim.scaleSide;
        targetOpacity = 0.72;
        targetZIndex = 5;
        card.classList.add('is-side');
        card.setAttribute('aria-hidden', 'true');
      } else {
        // BACK card in orbit
        targetX = 0;
        targetZ = dim.depthBack;
        targetRotateY = 0;
        targetScale = dim.scaleBack;
        targetOpacity = 0.18;
        targetZIndex = 1;
        card.classList.add('is-back');
        card.setAttribute('aria-hidden', 'true');
      }

      if (gsap && !reducedMotion) {
        gsap.to(card, {
          xPercent: -50,
          yPercent: -50,
          x: targetX,
          z: targetZ,
          rotationY: targetRotateY,
          scale: targetScale,
          opacity: targetOpacity,
          zIndex: targetZIndex,
          duration: immediate ? 0 : 0.75,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: () => {
            if (index === totalCards - 1) {
              isTransitioning = false;
            }
          }
        });
      } else {
        // CSS fallback / Reduced Motion
        card.style.transform = `translate3d(calc(-50% + ${targetX}px), -50%, ${targetZ}px) rotateY(${targetRotateY}deg) scale(${targetScale})`;
        card.style.opacity = targetOpacity;
        card.style.zIndex = targetZIndex;
        isTransitioning = false;
      }
    });

    // Update indicator buttons
    indicatorBtns.forEach((btn, idx) => {
      const isActive = idx === activeIndex;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
  };

  /**
   * Navigate to specific index
   */
  const goTo = (newIndex) => {
    if (newIndex === activeIndex) return;
    isTransitioning = true;
    activeIndex = (newIndex % totalCards + totalCards) % totalCards;
    updatePositions(false);
  };

  const next = () => {
    goTo(activeIndex + 1);
  };

  const prev = () => {
    goTo(activeIndex - 1);
  };

  /**
   * Autoplay management: runs every 2.5s, stops when hovered
   */
  const startAutoplay = () => {
    if (prefersReducedMotion() || isHovered) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (!isHovered && !document.hidden) {
        next();
      }
    }, AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  // Hover detection on carousel wrapper: stops on hover, resumes on leave
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });

    wrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoplay();
    });

    // Keyboard support (ArrowLeft / ArrowRight)
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
        if (!isHovered) startAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
        if (!isHovered) startAutoplay();
      }
    });
  }

  // Event Listeners: Prev / Next buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
      if (!isHovered) startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      if (!isHovered) startAutoplay();
    });
  }

  // Event Listeners: Indicator dots
  indicatorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const slideIndex = parseInt(btn.getAttribute('data-slide-to'), 10);
      if (!isNaN(slideIndex)) {
        goTo(slideIndex);
        if (!isHovered) startAutoplay();
      }
    });
  });

  // Event Listeners: Click on visible side cards to center them
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index !== activeIndex) {
        goTo(index);
        if (!isHovered) startAutoplay();
      }
    });
  });

  // Touch / Swipe support
  if (stage) {
    let touchStartX = 0;
    let touchStartY = 0;

    stage.addEventListener('touchstart', (e) => {
      stopAutoplay();
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      if (!isHovered) startAutoplay();
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        // Check horizontal swipe threshold
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            next();
          } else {
            prev();
          }
        }
      }
    }, { passive: true });
  }

  // Handle tab visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (!isHovered) {
      startAutoplay();
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updatePositions(true);
    }, 100);
  }, { passive: true });

  // Initial layout mounting and start automatic scrolling
  updatePositions(true);
  startAutoplay();
}

// Global registration and auto-initialization
if (typeof window !== 'undefined') {
  window.initLearningExperience = initLearningExperience;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLearningExperience());
  } else {
    initLearningExperience();
  }
}
