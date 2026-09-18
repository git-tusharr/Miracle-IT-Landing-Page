/**
 * WHO CAN JOIN SECTION CONTROLLER — GSAP SCROLL STACKING CARDS
 * Miracle IT Career Academy
 *
 * Features:
 * - GSAP ScrollTrigger hardware-accelerated 3D stacking card deck
 * - Preceding cards scale down, shift upward, and depth-dim to simulate physical card stacking
 * - Interactive navigation pill bar with live scroll position synchronization
 * - Direct click navigation to smoothly scroll to any card
 * - Snap-to-card scrub physics
 * - Full responsive handling with native sticky stacking fallback on mobile (< 768px)
 * - Accessibility & prefers-reduced-motion support
 */

function initWhoCanJoin(container = document) {
  const section = container.querySelector('#who-can-join') || document.querySelector('#who-can-join');
  if (!section) return;

  const stackContainer = section.querySelector('#whoStackContainer') || section.querySelector('.who-stack-container');
  if (!stackContainer) return;

  const deck = section.querySelector('#whoStackDeck');
  const cards = Array.from(section.querySelectorAll('.who-stack-card'));
  const pills = Array.from(section.querySelectorAll('.who-nav-pill'));

  if (cards.length < 2) return;

  // Reduced motion preference
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  if (prefersReducedMotion()) {
    console.log('[WhoCanJoin] prefers-reduced-motion active. High-accessibility mode enabled.');
    return;
  }

  // Guard: GSAP and ScrollTrigger availability
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    console.warn('[WhoCanJoin] GSAP or ScrollTrigger not loaded. Using fallback display.');
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Clean up any existing instance to avoid duplicate listeners on hot reload
  if (window.whoCanJoinScrollTrigger) {
    if (typeof window.whoCanJoinScrollTrigger.kill === 'function') {
      window.whoCanJoinScrollTrigger.kill(true);
    }
    window.whoCanJoinScrollTrigger = null;
  }

  // Helper to dynamically calculate deck height based on content
  const syncDeckHeight = () => {
    if (window.innerWidth >= 769 && deck) {
      const heights = cards.map(c => c.scrollHeight || c.offsetHeight || 380);
      const maxHeight = Math.max(...heights, 400);
      deck.style.minHeight = `${maxHeight + 20}px`;
    } else if (deck) {
      deck.style.minHeight = 'auto';
    }
  };

  syncDeckHeight();
  window.addEventListener('resize', syncDeckHeight);

  // Use ScrollTrigger.matchMedia for clean responsive switching
  ScrollTrigger.matchMedia({
    // DESKTOP & TABLET SCREENS (>= 769px)
    "(min-width: 769px)": function() {
      syncDeckHeight();

      // Set initial stacked state
      cards.forEach((card, index) => {
        gsap.set(card, {
          zIndex: index + 1,
          scale: 1,
          yPercent: index === 0 ? 0 : 115,
          opacity: index === 0 ? 1 : 0,
          filter: "brightness(1) blur(0px)",
          transformOrigin: "top center",
          immediateRender: true
        });
      });

      // Master scrubbing timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackContainer,
          start: "top 95px",
          end: "+=2600",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.8,
          snap: {
            snapTo: [0, 0.3333, 0.6666, 1.0],
            duration: { min: 0.25, max: 0.55 },
            delay: 0.05,
            ease: "power2.inOut"
          },
          onUpdate: (self) => {
            const p = self.progress; // 0 to 1
            // Active index (0, 1, 2, or 3)
            const activeIndex = Math.min(Math.floor(p * 3 + 0.5), 3);

            // Update pills
            pills.forEach((pill, idx) => {
              const isActive = idx === activeIndex;
              pill.classList.toggle('is-active', isActive);
              pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
          }
        }
      });

      // Segment 1: Card 1 glides up over Card 0; Card 0 scales down and shifts up
      tl.to(cards[1], {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        duration: 1
      }, 0);
      tl.to(cards[0], {
        scale: 0.94,
        y: -18,
        filter: "brightness(0.65) blur(0.5px)",
        ease: "none",
        duration: 1
      }, 0);

      // Segment 2: Card 2 glides up over Card 1; Card 1 and Card 0 scale down
      tl.to(cards[2], {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        duration: 1
      }, 1);
      tl.to(cards[1], {
        scale: 0.94,
        y: -18,
        filter: "brightness(0.65) blur(0.5px)",
        ease: "none",
        duration: 1
      }, 1);
      tl.to(cards[0], {
        scale: 0.88,
        y: -36,
        filter: "brightness(0.35) blur(1.5px)",
        ease: "none",
        duration: 1
      }, 1);

      // Segment 3: Card 3 glides up over Card 2; previous cards cascade down
      tl.to(cards[3], {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        duration: 1
      }, 2);
      tl.to(cards[2], {
        scale: 0.94,
        y: -18,
        filter: "brightness(0.65) blur(0.5px)",
        ease: "none",
        duration: 1
      }, 2);
      tl.to(cards[1], {
        scale: 0.88,
        y: -36,
        filter: "brightness(0.35) blur(1.5px)",
        ease: "none",
        duration: 1
      }, 2);
      tl.to(cards[0], {
        scale: 0.82,
        y: -54,
        filter: "brightness(0.2) blur(2.5px)",
        ease: "none",
        duration: 1
      }, 2);

      // Save reference globally
      window.whoCanJoinScrollTrigger = tl.scrollTrigger;

      // Handle pill click navigation
      const pillCleanupFns = [];
      pills.forEach((pill) => {
        const clickHandler = (e) => {
          e.preventDefault();
          const targetIndex = parseInt(pill.getAttribute('data-card-target'), 10);
          if (isNaN(targetIndex)) return;

          const st = tl.scrollTrigger;
          if (st) {
            const targetProgress = targetIndex / (cards.length - 1);
            const targetScroll = st.start + (st.end - st.start) * targetProgress;
            window.scrollTo({
              top: targetScroll + 2,
              behavior: 'smooth'
            });
          }
        };

        pill.addEventListener('click', clickHandler);
        pillCleanupFns.push(() => pill.removeEventListener('click', clickHandler));
      });

      // Delayed refresh to guarantee correct trigger coordinates after image/layout settles
      setTimeout(() => {
        syncDeckHeight();
        ScrollTrigger.refresh();
      }, 250);

      return function() {
        tl.kill();
        pillCleanupFns.forEach(fn => fn());
        window.whoCanJoinScrollTrigger = null;
      };
    },

    // MOBILE SCREENS (< 769px)
    "(max-width: 768px)": function() {
      // Clear all GSAP inline styles to let native responsive layout take effect
      cards.forEach(card => {
        gsap.set(card, { clearProps: "all" });
      });
      if (deck) deck.style.minHeight = 'auto';

      // Connect pill clicks to smooth scroll to the target card
      const mobilePillCleanups = [];
      pills.forEach((pill) => {
        const clickHandler = (e) => {
          e.preventDefault();
          const targetIndex = parseInt(pill.getAttribute('data-card-target'), 10);
          if (isNaN(targetIndex) || !cards[targetIndex]) return;

          cards[targetIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });

          pills.forEach((p, i) => {
            p.classList.toggle('is-active', i === targetIndex);
            p.setAttribute('aria-selected', i === targetIndex ? 'true' : 'false');
          });
        };

        pill.addEventListener('click', clickHandler);
        mobilePillCleanups.push(() => pill.removeEventListener('click', clickHandler));
      });

      // Highlight active pill on mobile scroll via IntersectionObserver
      let activeObserver = null;
      if ('IntersectionObserver' in window) {
        activeObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const idx = parseInt(entry.target.getAttribute('data-card-index'), 10);
              if (!isNaN(idx)) {
                pills.forEach((p, i) => {
                  p.classList.toggle('is-active', i === idx);
                  p.setAttribute('aria-selected', i === idx ? 'true' : 'false');
                });
              }
            }
          });
        }, {
          threshold: 0.6
        });

        cards.forEach(card => activeObserver.observe(card));
      }

      return function() {
        mobilePillCleanups.forEach(fn => fn());
        if (activeObserver) activeObserver.disconnect();
      };
    }
  });

  // Global window load refresh
  window.addEventListener('load', () => {
    syncDeckHeight();
    ScrollTrigger.refresh();
  });
}

// Export globally
if (typeof window !== 'undefined') {
  window.initWhoCanJoin = initWhoCanJoin;
}
