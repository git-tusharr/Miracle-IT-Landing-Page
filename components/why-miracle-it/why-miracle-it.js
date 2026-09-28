/**
 * WHY MIRACLE IT — REALISTIC TABLET CONTROLLER & HORIZONTAL STORY ENGINE
 * Handles:
 *  1. Interactive chapter tabs navigation (01 - 05)
 *  2. Smooth horizontal track sliding
 *  3. Live MiracleOS status bar clock & dynamic chapter pill text
 *  4. Prev / Next HUD buttons with active states
 *  5. Keyboard arrows navigation (Left / Right)
 *  6. Mobile touch swipe gesture support
 */

function initWhyMiracleIt(container = document) {
  const section = container.querySelector('#why-miracle-it') || document.querySelector('#why-miracle-it');
  if (!section) return;

  // Prevent duplicate initialization
  if (section.dataset.whyInitialized === 'true') {
    return;
  }
  section.dataset.whyInitialized = 'true';

  const tabs = Array.from(section.querySelectorAll('.story-dot, .chapter-tab'));
  const track = section.querySelector('#tabletStoryTrack');
  const viewport = section.querySelector('#tabletStoryViewport');
  const progressBar = section.querySelector('#tabletProgressBar');
  const chapterText = section.querySelector('#tabletChapterText');
  const clockEl = section.querySelector('#tabletClock');
  const clockMobileEl = section.querySelector('#tabletClockMobile');
  const iphoneChapterLabel = section.querySelector('#iphoneChapterLabel');
  const btnPrev = section.querySelector('#btnHudPrev');
  const btnNext = section.querySelector('#btnHudNext');
  const slides = Array.from(section.querySelectorAll('.tablet-slide'));

  const chapterSteps = ['Ch. 1 of 5', 'Ch. 2 of 5', 'Ch. 3 of 5', 'Ch. 4 of 5', 'Ch. 5 of 5'];
  const chapterNames = [
    'Classroom Formula',
    'Capstones & Mentors',
    '1-on-1 Code Audits',
    'Bhopal Comparison',
    'Ethical Pledge'
  ];

  let activeSlideIndex = 0;

  // 1. Live MiracleOS / iOS Real-Time Clock
  const updateClock = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    if (clockEl) {
      clockEl.textContent = `${displayHours}:${minutes} ${ampm}`;
    }
    if (clockMobileEl) {
      clockMobileEl.textContent = `${displayHours}:${minutes}`;
    }
  };
  updateClock();
  setInterval(updateClock, 30000);

  // 2. Micro-animation on Slide Enter
  const animateSlideCards = (idx) => {
    const currentSlide = slides[idx];
    if (!currentSlide) return;

    if (typeof window.gsap !== 'undefined') {
      const cards = currentSlide.querySelectorAll('.routine-phase, .pillar-story-card, .comp-row, .pledge-card-wrap');
      if (cards.length) {
        window.gsap.fromTo(cards, 
          { opacity: 0.4, y: 12 }, 
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
      }

      const codingBar = currentSlide.querySelector('.ratio-coding');
      if (codingBar) {
        window.gsap.fromTo(codingBar, { width: '0%' }, { width: '70%', duration: 0.75, ease: 'power2.out' });
      }
    }
  };

  // 3. Slide Switcher Function
  const goToSlide = (targetIdx) => {
    if (targetIdx < 0) targetIdx = 0;
    if (targetIdx >= slides.length) targetIdx = slides.length - 1;
    activeSlideIndex = targetIdx;

    // Shift horizontal track
    const pct = targetIdx * 20; // 5 slides = 20% each
    if (track) {
      if (window.gsap) {
        window.gsap.killTweensOf(track);
      }
      track.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = `translate3d(-${pct}%, 0, 0)`;
    }

    // Update active tab & story dot states
    tabs.forEach((tab) => {
      const tabTarget = parseInt(tab.getAttribute('data-slide-target'), 10);
      const isActive = tabTarget === targetIdx;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update MiracleOS dynamic chapter pill
    if (chapterText && chapterSteps[targetIdx]) {
      chapterText.innerHTML = `<span class="chapter-step">${chapterSteps[targetIdx]}</span><span class="chapter-name"> • ${chapterNames[targetIdx]}</span>`;
    }
    if (iphoneChapterLabel && chapterNames[targetIdx]) {
      iphoneChapterLabel.textContent = `${chapterSteps[targetIdx]} • ${chapterNames[targetIdx]}`;
    }

    // Update laser progress bar
    if (progressBar) {
      progressBar.style.width = `${((targetIdx + 1) / slides.length) * 100}%`;
    }

    // Update HUD button states (disable at ends)
    if (btnPrev) {
      btnPrev.disabled = targetIdx === 0;
    }
    if (btnNext) {
      btnNext.disabled = targetIdx === slides.length - 1;
    }

    animateSlideCards(targetIdx);
  };

  // 4. Bind Click Events on Story Dots
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(tab.getAttribute('data-slide-target'), 10);
      if (!isNaN(targetIdx)) {
        goToSlide(targetIdx);
      }
    });
  });

  // 5. Bind Prev / Next HUD Buttons
  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(activeSlideIndex - 1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(activeSlideIndex + 1);
    });
  }

  // 6. Keyboard Left / Right Navigation (when section is in focus or hovered)
  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToSlide(activeSlideIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      goToSlide(activeSlideIndex - 1);
    }
  });

  // 7. Interactive Unified Pointer & Touch Drag-to-Slide Engine
  if (viewport && track) {
    let isPointerDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let startTime = 0;
    let hasDecidedDirection = false;
    let isHorizontalGesture = false;
    let wasDragged = false;

    const onPointerDown = (e) => {
      // Ignore non-primary mouse clicks
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      isPointerDown = true;
      isDragging = false;
      hasDecidedDirection = false;
      isHorizontalGesture = false;
      wasDragged = false;

      startX = e.clientX;
      startY = e.clientY;
      currentX = e.clientX;
      currentY = e.clientY;
      startTime = Date.now();

      if (window.gsap) {
        window.gsap.killTweensOf(track);
      }
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;

      currentX = e.clientX;
      currentY = e.clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      // Determine intent on first few pixels of movement
      if (!hasDecidedDirection) {
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        if (absX > 6 || absY > 6) {
          hasDecidedDirection = true;
          if (absX >= absY) {
            isHorizontalGesture = true;
            isDragging = true;
            viewport.classList.add('is-dragging');
            if (e.target.setPointerCapture && e.pointerId) {
              try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
            }
          } else {
            // Vertical scroll: yield immediately so page scrolls normally
            isPointerDown = false;
            return;
          }
        }
      }

      if (isHorizontalGesture && isDragging) {
        if (e.cancelable) e.preventDefault();
        wasDragged = true;

        const viewportWidth = viewport.getBoundingClientRect().width || 1;
        const currentBaseOffsetPx = -activeSlideIndex * viewportWidth;

        // Apply rubber-band resistance when pulling past the boundaries
        let effectiveDiffX = diffX;
        if ((activeSlideIndex === 0 && diffX > 0) || (activeSlideIndex === slides.length - 1 && diffX < 0)) {
          effectiveDiffX = diffX * 0.32;
        }

        const newTranslatePx = currentBaseOffsetPx + effectiveDiffX;
        track.style.transition = 'none';
        track.style.transform = `translate3d(${newTranslatePx}px, 0, 0)`;
      }
    };

    const onPointerUp = (e) => {
      if (!isPointerDown && !isDragging) return;

      isPointerDown = false;
      viewport.classList.remove('is-dragging');

      if (e.target.releasePointerCapture && e.pointerId) {
        try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
      }

      if (isHorizontalGesture && isDragging) {
        const diffX = currentX - startX;
        const elapsedMs = Math.max(1, Date.now() - startTime);
        const velocity = Math.abs(diffX) / elapsedMs;
        const viewportWidth = viewport.getBoundingClientRect().width || 1;
        const dragRatio = Math.abs(diffX) / viewportWidth;

        // Snap to next/prev if dragged >= 16% width OR flicked with velocity >= 0.3 px/ms
        if (dragRatio >= 0.16 || velocity >= 0.3) {
          if (diffX < 0 && activeSlideIndex < slides.length - 1) {
            goToSlide(activeSlideIndex + 1);
          } else if (diffX > 0 && activeSlideIndex > 0) {
            goToSlide(activeSlideIndex - 1);
          } else {
            goToSlide(activeSlideIndex);
          }
        } else {
          goToSlide(activeSlideIndex);
        }
      }

      isDragging = false;
      hasDecidedDirection = false;
      isHorizontalGesture = false;
    };

    // Attach unified pointer listeners
    viewport.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Prevent accidental link/button trigger if user was sliding/dragging
    viewport.addEventListener('click', (e) => {
      if (wasDragged) {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => { wasDragged = false; }, 50);
      }
    }, true);
  }

  // Initial state setup
  goToSlide(0);
}

// Auto-init on DOMContentLoaded or immediate execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initWhyMiracleIt());
} else {
  initWhyMiracleIt();
}

if (typeof window !== 'undefined') {
  window.initWhyMiracleIt = initWhyMiracleIt;
}
