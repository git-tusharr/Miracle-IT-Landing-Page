/**
 * LEARNING EXPERIENCE CONTROLLER — HIGH-PERFORMANCE 3D COVERFLOW (v5.0)
 * Miracle IT Career Academy
 * 
 * Enhancements:
 * - Ultra-snappy 0.42s GSAP power3.out hardware-accelerated transitions
 * - Dynamic 3.5-second auto-orbit with instant pause-on-hover & resume
 * - Smooth 3D circular coverflow geometry with depth-of-field hierarchy
 * - Direct click-to-center on visible side cards
 * - Frictionless touch & swipe gesture detection
 * - Keyboard navigation (ArrowLeft / ArrowRight)
 * - Viewport-driven animated counter for campus statistics
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
  const AUTOPLAY_INTERVAL = 3500; // 3.5s dynamic showcase interval

  // Check reduced motion preference
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Calculate responsive 3D transformation values
   */
  const getDimensions = () => {
    const width = window.innerWidth;
    if (width <= 360) {
      return {
        sideOffset: 65,
        depthCenter: 12,
        depthSide: -25,
        depthBack: -75,
        rotateAngle: 5,
        scaleCenter: 1,
        scaleSide: 0.70,
        scaleBack: 0.50,
        opacitySide: 0.25
      };
    } else if (width <= 420) {
      return {
        sideOffset: 95,
        depthCenter: 18,
        depthSide: -30,
        depthBack: -85,
        rotateAngle: 8,
        scaleCenter: 1,
        scaleSide: 0.75,
        scaleBack: 0.56,
        opacitySide: 0.30
      };
    } else if (width <= 768) {
      return {
        sideOffset: 145,
        depthCenter: 30,
        depthSide: -40,
        depthBack: -110,
        rotateAngle: 10,
        scaleCenter: 1,
        scaleSide: 0.80,
        scaleBack: 0.62,
        opacitySide: 0.35
      };
    } else if (width <= 1024) {
      return {
        sideOffset: 240,
        depthCenter: 55,
        depthSide: -50,
        depthBack: -140,
        rotateAngle: 15,
        scaleCenter: 1,
        scaleSide: 0.86,
        scaleBack: 0.66,
        opacitySide: 0.65
      };
    } else {
      return {
        sideOffset: 340,
        depthCenter: 80,
        depthSide: -55,
        depthBack: -170,
        rotateAngle: 18,
        scaleCenter: 1,
        scaleSide: 0.88,
        scaleBack: 0.70,
        opacitySide: 0.68
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
        targetOpacity = dim.opacitySide !== undefined ? dim.opacitySide : 0.68;
        targetZIndex = 5;
        card.classList.add('is-side');
        card.setAttribute('aria-hidden', 'true');
      } else if (pos === -1) {
        // LEFT side card
        targetX = -dim.sideOffset;
        targetZ = dim.depthSide;
        targetRotateY = dim.rotateAngle;
        targetScale = dim.scaleSide;
        targetOpacity = dim.opacitySide !== undefined ? dim.opacitySide : 0.68;
        targetZIndex = 5;
        card.classList.add('is-side');
        card.setAttribute('aria-hidden', 'true');
      } else {
        // BACK card in orbit
        targetX = 0;
        targetZ = dim.depthBack;
        targetRotateY = 0;
        targetScale = dim.scaleBack;
        targetOpacity = 0.10;
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
          duration: immediate ? 0 : 0.42, // Fast, silky 0.42s transition
          ease: 'power3.out',
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
   * Navigate to specific index with tight debounce
   */
  const goTo = (newIndex) => {
    if (newIndex === activeIndex) return;
    isTransitioning = true;
    activeIndex = (newIndex % totalCards + totalCards) % totalCards;
    updatePositions(false);
    setTimeout(() => { isTransitioning = false; }, 380);
  };

  const next = () => {
    goTo(activeIndex + 1);
  };

  const prev = () => {
    goTo(activeIndex - 1);
  };

  /**
   * Autoplay management: runs every 3.5s, stops when hovered
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
    card.addEventListener('click', (e) => {
      // If clicking directly on a CTA link, let the link navigate
      if (e.target.closest('.card-action-chip')) return;
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

        // Check horizontal swipe threshold (35px for responsive flicking)
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
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
    }, 80);
  }, { passive: true });

  // Initial layout mounting and start automatic scrolling
  updatePositions(true);
  startAutoplay();

  // Initialize animated counter for campus stats bar (count up from 0)
  initCampusStatsCounter(section);
}

/**
 * CAMPUS STATS ANIMATED COUNTER
 * Numbers count up from 0 when entering viewport or upon page load/refresh:
 * - 1:0 -> 1:15 (Trainer-to-Student Ratio)
 * - 0 hrs/day -> 10 hrs/day (Open Lab Workstation Access)
 * - 0% -> 100% (Practical Code-First Sessions)
 */
function initCampusStatsCounter(section) {
  if (!section) return;
  const statsBar = section.querySelector('.campus-stats-bar');
  if (!statsBar) return;

  const statElements = Array.from(statsBar.querySelectorAll('.campus-stat .stat-number'));
  if (!statElements.length) return;

  // Metadata definition for each statistic
  const statsConfig = [
    {
      target: 15,
      render: (val) => `1:${val}`,
      finalText: '1:15'
    },
    {
      target: 10,
      render: (val) => `${val} hrs/day`,
      finalText: '10 hrs/day'
    },
    {
      target: 100,
      render: (val) => `${val}%`,
      finalText: '100%'
    }
  ];

  const setZeroState = () => {
    statElements.forEach((el, idx) => {
      const cfg = statsConfig[idx];
      if (cfg) {
        el.textContent = cfg.render(0);
        el.classList.remove('is-complete');
        el.classList.remove('is-counting');
      }
    });
  };

  const setFinalState = () => {
    statElements.forEach((el, idx) => {
      const cfg = statsConfig[idx];
      if (cfg) {
        el.textContent = cfg.finalText;
        el.classList.remove('is-counting');
        el.classList.add('is-complete');
      }
    });
  };

  // Respect reduced-motion preferences
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    setFinalState();
    return;
  }

  let isAnimating = false;
  let hasAnimated = false;
  let animationFrameId = null;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const startCountAnimation = () => {
    if (isAnimating) return;
    isAnimating = true;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    setZeroState();
    statElements.forEach(el => {
      el.classList.remove('is-complete');
      el.classList.add('is-counting');
    });

    const duration = 1200; // 1.2 seconds smooth counter
    let startTime = null;

    const frame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(rawProgress);

      statElements.forEach((el, idx) => {
        const cfg = statsConfig[idx];
        if (!cfg) return;

        if (rawProgress >= 1) {
          el.textContent = cfg.finalText;
        } else {
          const currentVal = Math.round(cfg.target * easedProgress);
          el.textContent = cfg.render(currentVal);
        }
      });

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(frame);
      } else {
        isAnimating = false;
        hasAnimated = true;
        setFinalState();
      }
    };

    animationFrameId = requestAnimationFrame(frame);
  };

  // Check if currently visible in viewport
  const isElementInViewport = () => {
    const rect = statsBar.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < windowHeight * 0.9 && rect.bottom > windowHeight * 0.1;
  };

  // Set initial zero values
  setZeroState();

  // If already in viewport on load or refresh, start counting immediately
  if (isElementInViewport()) {
    setTimeout(() => {
      startCountAnimation();
    }, 150);
  }

  // IntersectionObserver for scroll-in detection
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!hasAnimated && !isAnimating) {
            startCountAnimation();
          }
        } else {
          if (!isAnimating && hasAnimated) {
            setZeroState();
            hasAnimated = false;
          }
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -30px 0px'
    });

    observer.observe(statsBar);
  } else {
    window.addEventListener('scroll', () => {
      if (isElementInViewport()) {
        if (!hasAnimated && !isAnimating) {
          startCountAnimation();
        }
      } else {
        if (!isAnimating && hasAnimated) {
          setZeroState();
          hasAnimated = false;
        }
      }
    }, { passive: true });
  }
}

// Global registration and auto-initialization
if (typeof window !== 'undefined') {
  window.initLearningExperience = initLearningExperience;
  window.initCampusStatsCounter = initCampusStatsCounter;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLearningExperience());
  } else {
    initLearningExperience();
  }
}
