/**
 * COUNSELLING PROCESS COMPONENT CONTROLLER
 * Miracle IT Career Academy
 *
 * Effortlessly smooth 5-step centered journey on scroll.
 * Features:
 * - GSAP ScrollTrigger hardware-accelerated pinned sequence
 * - Natural dwell reading windows per step before gentle transitions
 * - Synchronized 5-step progress pill bar with direct click navigation
 * - Mathematical snap points matching step dwell positions
 * - Full mobile touch horizontal snap fallback
 */

function initCounsellingProcess(container = document) {
  const section = container.querySelector('#counselling-process') || document.querySelector('#counselling-process');
  if (!section) return;

  const panels = Array.from(section.querySelectorAll('.counselling-step-panel'));
  const pills = Array.from(section.querySelectorAll('.counselling-nav-pill'));
  if (panels.length < 2) return;

  // Clean up any previous instance on re-initialization
  if (window._counsellingCleanup && typeof window._counsellingCleanup === 'function') {
    window._counsellingCleanup();
    window._counsellingCleanup = null;
  }

  // Check reduced motion preference
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  if (prefersReducedMotion()) {
    panels.forEach(p => {
      p.classList.add('is-active');
      p.style.opacity = '1';
      p.style.visibility = 'visible';
      p.style.transform = 'none';
      p.style.pointerEvents = 'auto';
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

  // Responsive switching using ScrollTrigger.matchMedia
  ScrollTrigger.matchMedia({
    // DESKTOP & LARGE TABLETS (>= 992px)
    "(min-width: 992px)": function() {
      // Initialize states: Panel 0 active, others queued below
      panels.forEach((p, idx) => {
        const outer = p.querySelector('.step-outer');
        if (idx === 0) {
          gsap.set(p, { autoAlpha: 1, zIndex: 10, immediateRender: true });
          p.classList.add('is-active');
          if (outer) gsap.set(outer, { y: 0, opacity: 1, scale: 1, immediateRender: true });
        } else {
          gsap.set(p, { autoAlpha: 0, zIndex: 1, immediateRender: true });
          p.classList.remove('is-active');
          if (outer) gsap.set(outer, { y: 30, opacity: 0, scale: 0.96, immediateRender: true });
        }
      });

      // Master ScrollTrigger timeline pinned with smooth 1.0s scrub dampening
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 76px",
          end: "+=2800",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1.0,
          snap: {
            snapTo: [0, 0.25, 0.5, 0.75, 1.0],
            duration: { min: 0.25, max: 0.5 },
            delay: 0.18,
            ease: "power1.out"
          },
          onUpdate: (self) => {
            const p = self.progress;
            const activeIndex = Math.min(Math.floor(p * 4 + 0.5), 4);

            pills.forEach((pill, idx) => {
              const isActive = idx === activeIndex;
              pill.classList.toggle('is-active', isActive);
              pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach((panel, idx) => {
              const isActive = idx === activeIndex;
              panel.classList.toggle('is-active', isActive);
            });
          }
        }
      });

      // Sequence the 4 transitions with deliberate dwell windows (0.35s dwell + 0.65s transition)
      for (let i = 0; i < panels.length - 1; i++) {
        const current = panels[i];
        const next = panels[i + 1];
        const curOuter = current.querySelector('.step-outer');
        const nextOuter = next.querySelector('.step-outer');

        const transitionStart = i + 0.35;
        const transitionEnd = i + 1.0;

        // Current card gently glides upward and fades out
        if (curOuter) {
          tl.to(curOuter, {
            y: -26,
            opacity: 0,
            scale: 0.96,
            ease: "power1.inOut",
            duration: 0.65
          }, transitionStart);
        }
        tl.set(current, { autoAlpha: 0, zIndex: 1 }, transitionEnd);

        // Next card smoothly rises into place from below
        tl.set(next, { autoAlpha: 1, zIndex: 10 + i }, transitionStart);
        if (nextOuter) {
          tl.fromTo(nextOuter,
            { y: 30, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, ease: "power1.inOut", duration: 0.65 },
            transitionStart
          );
        }
      }

      window.counsellingScrollTrigger = tl.scrollTrigger;

      // Handle pill click navigation
      const pillCleanups = [];
      pills.forEach((pill) => {
        const clickHandler = (e) => {
          e.preventDefault();
          const targetIndex = parseInt(pill.getAttribute('data-step-target'), 10);
          if (isNaN(targetIndex)) return;

          const st = tl.scrollTrigger;
          if (st) {
            const targetProgress = targetIndex / (panels.length - 1);
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

      return function() {
        tl.kill();
        pillCleanups.forEach(fn => fn());
        window.counsellingScrollTrigger = null;
      };
    },

    // MOBILE & TABLET SCREENS (< 992px)
    "(max-width: 991px)": function() {
      panels.forEach((p) => {
        gsap.set(p, { clearProps: "all" });
        const outer = p.querySelector('.step-outer');
        if (outer) gsap.set(outer, { clearProps: "all" });
        p.classList.add('is-active');
      });

      const mobilePillCleanups = [];
      pills.forEach((pill) => {
        const clickHandler = (e) => {
          e.preventDefault();
          const targetIndex = parseInt(pill.getAttribute('data-step-target'), 10);
          if (isNaN(targetIndex) || !panels[targetIndex]) return;

          panels[targetIndex].scrollIntoView({
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
              const idx = parseInt(entry.target.getAttribute('data-step-index'), 10);
              if (!isNaN(idx)) {
                pills.forEach((p, i) => {
                  p.classList.toggle('is-active', i === idx);
                  p.setAttribute('aria-selected', i === idx ? 'true' : 'false');
                });
              }
            }
          });
        }, { threshold: 0.5 });

        panels.forEach(panel => activeObserver.observe(panel));
      }

      return function() {
        mobilePillCleanups.forEach(fn => fn());
        if (activeObserver) activeObserver.disconnect();
      };
    }
  });

  window._counsellingCleanup = () => {
    if (window.counsellingScrollTrigger && typeof window.counsellingScrollTrigger.kill === 'function') {
      window.counsellingScrollTrigger.kill(true);
      window.counsellingScrollTrigger = null;
    }
  };
}

// Global alias & export
if (typeof window !== 'undefined') {
  window.initCounsellingProcess = initCounsellingProcess;
}