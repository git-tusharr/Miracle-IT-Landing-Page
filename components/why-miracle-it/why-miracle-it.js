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

  const chapterTitles = [
    'Chapter 1 of 5 • Classroom Formula',
    'Chapter 2 of 5 • Production Capstones',
    'Chapter 3 of 5 • 1-on-1 Code Audits',
    'Chapter 4 of 5 • Institution Matrix',
    'Chapter 5 of 5 • Transparency Pledge'
  ];

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-slide-target'), 10);
      if (isNaN(targetIdx)) return;

      // If ScrollTrigger timeline exists on desktop, let ScrollTrigger scroll to it
      if (window.whyTabletTimeline && window.whyTabletTimeline.scrollTrigger) {
        const progress = targetIdx / (dots.length - 1);
        const st = window.whyTabletTimeline.scrollTrigger;
        const targetScroll = st.start + (st.end - st.start) * progress;
        window.scrollTo({ top: targetScroll + 2, behavior: 'smooth' });
      } else if (track) {
        // Fallback for mobile / reduced motion
        const pct = targetIdx * 20; // 5 slides, 20% each
        track.style.transform = `translate3d(-${pct}%, 0, 0)`;
        track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        dots.forEach((d, i) => d.classList.toggle('is-active', i === targetIdx));
        if (chapterText && chapterTitles[targetIdx]) {
          chapterText.textContent = chapterTitles[targetIdx];
        }
        if (progressBar) {
          progressBar.style.width = `${((targetIdx + 1) / dots.length) * 100}%`;
        }
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.initWhyMiracleIt = initWhyMiracleIt;
}
