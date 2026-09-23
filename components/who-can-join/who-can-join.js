/**
 * WHO CAN JOIN SECTION CONTROLLER — GSAP SCROLL STACKING CARDS
 * Miracle IT Career Academy
 *
 * Ultra-smooth, hardware-accelerated 3D stacking card deck.
 * Uses pure GPU compositor properties (transform & opacity) with zero dynamic blur filters
 * for flawless 60+ FPS performance.
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

  // Clean up any existing instance to avoid duplicate listeners on repeated calls
  if (window._whoCanJoinCleanup && typeof window._whoCanJoinCleanup === 'function') {
    window._whoCanJoinCleanup();
    window._whoCanJoinCleanup = null;
  }

  // Reduced motion preference
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  if (prefersReducedMotion()) {
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
    return;
  }

  // Guard: GSAP and ScrollTrigger availability
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

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

  // Track matchMedia and pill listeners for global cleanup
  const cleanupFns = [
    () => window.removeEventListener('resize', syncDeckHeight)
  ];

  // Use ScrollTrigger.matchMedia for clean responsive switching
  ScrollTrigger.matchMedia({
    // DESKTOP & TABLET SCREENS (>= 769px)
    "(min-width: 769px)": function() {
      syncDeckHeight();

      // Set initial stacked state using pure GPU transform/opacity (no expensive blur filters)
      cards.forEach((card, index) => {
        gsap.set(card, {
          zIndex: index + 1,
          scale: 1,
          yPercent: index === 0 ? 0 : 112,
          y: 0,
          opacity: index === 0 ? 1 : 0,
          transformOrigin: "top center",
          immediateRender: true
        });
      });

      // Master scrubbing timeline with luxurious 1.0s smoothing dampening
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackContainer,
          start: "top 95px",
          end: "+=2600",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1.0,
          snap: {
            snapTo: [0, 0.3333, 0.6666, 1.0],
            duration: { min: 0.25, max: 0.5 },
            delay: 0.18,
            ease: "power1.out"
          },
          onUpdate: (self) => {
            const p = self.progress;
            const activeIndex = Math.min(Math.floor(p * 3 + 0.5), 3);

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
        ease: "power1.out",
        duration: 1
      }, 0);
      tl.to(cards[0], {
        scale: 0.94,
        y: -22,
        opacity: 0.65,
        ease: "power1.out",
        duration: 1
      }, 0);

      // Segment 2: Card 2 glides up over Card 1; Card 1 and Card 0 cascade down
      tl.to(cards[2], {
        yPercent: 0,
        opacity: 1,
        ease: "power1.out",
        duration: 1
      }, 1);
      tl.to(cards[1], {
        scale: 0.94,
        y: -22,
        opacity: 0.65,
        ease: "power1.out",
        duration: 1
      }, 1);
      tl.to(cards[0], {
        scale: 0.88,
        y: -42,
        opacity: 0.35,
        ease: "power1.out",
        duration: 1
      }, 1);

      // Segment 3: Card 3 glides up over Card 2; previous cards cascade down
      tl.to(cards[3], {
        yPercent: 0,
        opacity: 1,
        ease: "power1.out",
        duration: 1
      }, 2);
      tl.to(cards[2], {
        scale: 0.94,
        y: -22,
        opacity: 0.65,
        ease: "power1.out",
        duration: 1
      }, 2);
      tl.to(cards[1], {
        scale: 0.88,
        y: -42,
        opacity: 0.35,
        ease: "power1.out",
        duration: 1
      }, 2);
      tl.to(cards[0], {
        scale: 0.82,
        y: -60,
        opacity: 0.18,
        ease: "power1.out",
        duration: 1
      }, 2);

      window.whoCanJoinScrollTrigger = tl.scrollTrigger;

      // Pill click navigation
      const pillCleanups = [];
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
        pillCleanups.push(() => pill.removeEventListener('click', clickHandler));
      });

      // Quick settle check
      setTimeout(() => {
        syncDeckHeight();
        ScrollTrigger.refresh();
      }, 200);

      return function() {
        tl.kill();
        pillCleanups.forEach(fn => fn());
        window.whoCanJoinScrollTrigger = null;
      };
    },

    // MOBILE SCREENS (< 769px)
    "(max-width: 768px)": function() {
      cards.forEach(card => {
        gsap.set(card, { clearProps: "all" });
      });
      if (deck) deck.style.minHeight = 'auto';

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
        }, { threshold: 0.6 });

        cards.forEach(card => activeObserver.observe(card));
      }

      return function() {
        mobilePillCleanups.forEach(fn => fn());
        if (activeObserver) activeObserver.disconnect();
      };
    }
  });

  window._whoCanJoinCleanup = () => {
    cleanupFns.forEach(fn => fn());
    if (window.whoCanJoinScrollTrigger && typeof window.whoCanJoinScrollTrigger.kill === 'function') {
      window.whoCanJoinScrollTrigger.kill(true);
      window.whoCanJoinScrollTrigger = null;
    }
  };
}

if (typeof window !== 'undefined') {
  window.initWhoCanJoin = initWhoCanJoin;
}
