/**
 * LEARNING EXPERIENCE CONTROLLER (v3.0 OPTIMIZED)
 * Facility Showcase Tab Switching Controller
 */

function initLearningExperience(container = document) {
  const section = container.querySelector('#learning-experience') || document.querySelector('#learning-experience');
  if (!section) return;

  const tabs = section.querySelectorAll('.facility-tab');
  const panels = section.querySelectorAll('.facility-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-facility');

      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        if (panel.id === `facility-${targetId}`) {
          panel.classList.add('is-active');
          panel.hidden = false;
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });
    });
  });
}

if (typeof window !== 'undefined') {
  window.initLearningExperience = initLearningExperience;
}
