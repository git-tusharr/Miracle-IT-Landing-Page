/**
 * WHY MIRACLE IT COMPONENT CONTROLLER
 * Handles:
 *  1. Live clock update in Tablet OS bar
 *  2. Story dot click navigation
 *  3. Mobile touch swipe / manual slide navigation
 */
function initWhyMiracleIt(container = document) {
  const section = container.querySelector('#why-miracle-it') || document.querySelector('#why-miracle-it');
  if (!section) return;

  // 1. Live Tablet Clock Update
  const clockEl = section.querySelector('#tabletClock');
  if (clockEl) {
    const updateTime = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 60000);
  }

  // 2. Story Nav Dots Click Interaction
  const dots = Array.from(section.querySelectorAll('.story-dot'));
  const track = section.querySelector('#tabletStoryTrack');
  const chapterText = section.querySelector('#tabletChapterText');
  const progressBar = section.querySelector('#tabletProgressBar');

  const chapterTitlesFull = [
    'Chapter 1 of 5 • Classroom Formula',
    'Chapter 2 of 5 • Production Capstones',
    'Chapter 3 of 5 • 1-on-1 Code Audits',
    'Chapter 4 of 5 • Institution Matrix',
    'Chapter 5 of 5 • Transparency Pledge'
  ];

  const chapterTitlesShort = [
    'Ch. 1/5 • Formula',
    'Ch. 2/5 • Capstones',
    'Ch. 3/5 • Code Audits',
    'Ch. 4/5 • Matrix',
    'Ch. 5/5 • Pledge'
  ];

  const chapterTitlesMini = [
    'Ch. 1/5',
    'Ch. 2/5',
    'Ch. 3/5',
    'Ch. 4/5',
    'Ch. 5/5'
  ];

  const getChapterTitle = (idx) => {
    const w = window.innerWidth;
    if (w <= 420) return chapterTitlesMini[idx] || '';
    if (w <= 680) return chapterTitlesShort[idx] || '';
    return chapterTitlesFull[idx] || '';
  };

  let activeSlideIndex = 0;

  // Set initial chapter text based on current width
  if (chapterText) {
    chapterText.textContent = getChapterTitle(0);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-slide-target'), 10);
      if (isNaN(targetIdx)) return;
      activeSlideIndex = targetIdx;

      // If ScrollTrigger timeline exists on desktop, let ScrollTrigger scroll to it
      if (window.whyTabletTimeline && window.whyTabletTimeline.scrollTrigger) {
        const progress = targetIdx / (dots.length - 1);
        const st = window.whyTabletTimeline.scrollTrigger;
        const targetScroll = st.start + (st.end - st.start) * progress;
        window.scrollTo({ top: targetScroll + 2, behavior: 'smooth' });
      } else {
        // Fallback for mobile / touch / reduced motion
        const viewport = section.querySelector('#tabletStoryViewport');
        if (viewport && viewport.clientWidth) {
          viewport.scrollTo({ left: targetIdx * viewport.clientWidth, behavior: 'smooth' });
        } else if (track) {
          const pct = targetIdx * 20; // 5 slides, 20% each
          track.style.transform = `translate3d(-${pct}%, 0, 0)`;
          track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        
        dots.forEach((d, i) => d.classList.toggle('is-active', i === targetIdx));
        if (chapterText) {
          chapterText.textContent = getChapterTitle(targetIdx);
        }
        if (progressBar) {
          progressBar.style.width = `${((targetIdx + 1) / dots.length) * 100}%`;
        }
        animateMobileSlide(targetIdx);
      }
    });
  });

  const animateMobileSlide = (idx) => {
    const slides = Array.from(section.querySelectorAll('.tablet-slide'));
    const slide = slides[idx];
    if (!slide) return;
    const cards = slide.querySelectorAll('.routine-phase, .pillar-story-card, .comp-row, .pledge-card-wrap');
    if (cards.length && typeof window.gsap !== 'undefined') {
      gsap.fromTo(cards, { opacity: 0.5, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' });
    }
  };

  // 3. Mobile touch swipe scroll listener to sync dots & chapters
  const viewport = section.querySelector('#tabletStoryViewport');
  if (viewport) {
    let scrollTimer;
    viewport.addEventListener('scroll', () => {
      if (window.whyTabletTimeline && window.whyTabletTimeline.scrollTrigger) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const w = viewport.clientWidth;
        if (!w) return;
        const currentIdx = Math.min(Math.max(Math.round(viewport.scrollLeft / w), 0), dots.length - 1);
        if (currentIdx !== activeSlideIndex) {
          activeSlideIndex = currentIdx;
          dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIdx));
          if (chapterText) {
            chapterText.textContent = getChapterTitle(currentIdx);
          }
          if (progressBar) {
            progressBar.style.width = `${((currentIdx + 1) / dots.length) * 100}%`;
          }
          animateMobileSlide(currentIdx);
        }
      }, 60);
    }, { passive: true });

    // Window resize handler to update text density dynamically
    window.addEventListener('resize', () => {
      if (chapterText && (!window.whyTabletTimeline || !window.whyTabletTimeline.scrollTrigger)) {
        chapterText.textContent = getChapterTitle(activeSlideIndex);
      }
    }, { passive: true });
  }
}

if (typeof window !== 'undefined') {
  window.initWhyMiracleIt = initWhyMiracleIt;
}
