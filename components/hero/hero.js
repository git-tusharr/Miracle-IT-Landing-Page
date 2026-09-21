/**
 * HERO COMPONENT CONTROLLER — STACKED CODE CARDS SHUFFLE ENGINE
 * Miracle IT Career Academy
 * 
 * Features:
 * - 3 Layered cards (roadmap.js, ai_model.py, insights.sql) stacked in 3D perspective
 * - Automatic shuffle every 2 seconds with fluid GPU-accelerated motion
 * - Instant hover stop on desktop and touch-hold on mobile
 * - Interactive tab clicking to bring any card to the front
 * - Direct click on background cards to bring them forward
 * - Respects prefers-reduced-motion
 */

function initHero(container = document) {
  const heroSection = container.querySelector('#hero') || document.querySelector('#hero');
  if (!heroSection) return;

  if (heroSection.dataset.heroInitialized === 'true') return;
  heroSection.dataset.heroInitialized = 'true';

  const stackContainer = heroSection.querySelector('#codeCardsStack');
  const cards = Array.from(heroSection.querySelectorAll('.code-stack-card'));
  const tabs = Array.from(heroSection.querySelectorAll('.stack-tab'));

  if (!stackContainer || !cards.length) return;

  // Stack state: index 0 is top (front), 1 is middle, 2 is back
  let stackOrder = [0, 1, 2];
  let shuffleTimer = null;
  let isShuffling = false;

  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Apply stack positions to the 3 cards
   */
  const updateStackClasses = () => {
    const topIdx = stackOrder[0];
    const midIdx = stackOrder[1];
    const backIdx = stackOrder[2];

    cards.forEach((card, idx) => {
      card.classList.remove('is-top', 'is-middle', 'is-back', 'is-shuffling-out');
      if (idx === topIdx) {
        card.classList.add('is-top');
        card.setAttribute('aria-hidden', 'false');
      } else if (idx === midIdx) {
        card.classList.add('is-middle');
        card.setAttribute('aria-hidden', 'true');
      } else if (idx === backIdx) {
        card.classList.add('is-back');
        card.setAttribute('aria-hidden', 'true');
      }
    });

    tabs.forEach((tab, idx) => {
      const active = idx === topIdx;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };

  /**
   * Smoothly shuffle the top card out and tuck it into the back
   */
  const shuffleNext = () => {
    if (isShuffling) return;

    if (prefersReducedMotion()) {
      const prevTop = stackOrder.shift();
      stackOrder.push(prevTop);
      updateStackClasses();
      return;
    }

    isShuffling = true;
    const topCard = cards[stackOrder[0]];

    // 1. Top card glides out with rotation
    topCard.classList.add('is-shuffling-out');

    // 2. Advance the stack after slight delay
    setTimeout(() => {
      const prevTop = stackOrder.shift();
      stackOrder.push(prevTop);
      updateStackClasses();

      // 3. Reset animation flag
      setTimeout(() => {
        isShuffling = false;
      }, 340);
    }, 280);
  };

  /**
   * Shuffle directly to a target card index
   */
  const shuffleTo = (targetIndex) => {
    if (isShuffling || stackOrder[0] === targetIndex) return;

    if (stackOrder[1] === targetIndex) {
      shuffleNext();
    } else if (stackOrder[2] === targetIndex) {
      if (prefersReducedMotion()) {
        stackOrder = [targetIndex, stackOrder[0], stackOrder[1]];
        updateStackClasses();
      } else {
        shuffleNext();
        setTimeout(() => {
          shuffleNext();
        }, 320);
      }
    }
  };

  /**
   * 2-Second Shuffle Loop
   */
  const startShuffleTimer = () => {
    clearInterval(shuffleTimer);
    if (prefersReducedMotion()) return;

    shuffleTimer = setInterval(() => {
      shuffleNext();
    }, 4800); // Relaxed 4.8s interval for natural reading pace
  };

  const stopShuffleTimer = () => {
    clearInterval(shuffleTimer);
  };

  // Tab click listeners
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIndex = parseInt(tab.dataset.index, 10);
      shuffleTo(targetIndex);
      startShuffleTimer();
    });
  });

  // Direct card click listeners (clicking background card brings it forward)
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (idx !== stackOrder[0]) {
        shuffleTo(idx);
        startShuffleTimer();
      }
    });
  });

  // Desktop hover pause / resume
  stackContainer.addEventListener('mouseenter', stopShuffleTimer);
  stackContainer.addEventListener('mouseleave', startShuffleTimer);

  const switcher = heroSection.querySelector('.code-stack-switcher');
  if (switcher) {
    switcher.addEventListener('mouseenter', stopShuffleTimer);
    switcher.addEventListener('mouseleave', startShuffleTimer);
  }

  // Mobile touch pause / resume
  stackContainer.addEventListener('touchstart', stopShuffleTimer, { passive: true });
  stackContainer.addEventListener('touchend', startShuffleTimer, { passive: true });

  // Initial render & timer start
  updateStackClasses();
  startShuffleTimer();

  console.log('[HeroComponent] Stacked code cards shuffle engine initialized (2s interval).');
}

/**
 * HERO SCROLL MOTION
 * Adds a subtle scroll state to the hero.
 */
function initHeroScrollMotion() {
  const heroSection = document.querySelector('#hero');
  if (!heroSection) return;

  let ticking = false;

  const updateHeroScroll = () => {
    const rect = heroSection.getBoundingClientRect();
    if (rect.top < 0 && rect.bottom > 0) {
      heroSection.classList.add('is-scrolling');
    } else {
      heroSection.classList.remove('is-scrolling');
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeroScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateHeroScroll();
}

/**
 * HERO TECH PARALLAX
 * Subtle cursor tracking for ambient tech nodes (desktop only)
 */
function initHeroParallax() {
  const heroSection = document.querySelector('#hero');
  if (!heroSection) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 992) return;

  const orbits = Array.from(heroSection.querySelectorAll('.hero-tech-orbit'));
  if (!orbits.length) return;

  let rafId = null;
  heroSection.addEventListener('mousemove', (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const xRel = (e.clientX - rect.left) / rect.width - 0.5;
      const yRel = (e.clientY - rect.top) / rect.height - 0.5;

      orbits.forEach((orbit, i) => {
        const factor = (i % 2 === 0 ? 1 : -1) * (6 + (i * 2));
        orbit.style.transform = `translate3d(${xRel * factor}px, ${yRel * factor}px, 0)`;
      });
      rafId = null;
    });
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    orbits.forEach(orbit => {
      orbit.style.transform = '';
    });
  }, { passive: true });
}

// Global registration and auto-initialization
if (typeof window !== 'undefined') {
  window.initHero = initHero;
  window.initHeroScrollMotion = initHeroScrollMotion;
  window.initHeroParallax = initHeroParallax;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHero();
      initHeroScrollMotion();
      initHeroParallax();
    });
  } else {
    initHero();
    initHeroScrollMotion();
    initHeroParallax();
  }
}