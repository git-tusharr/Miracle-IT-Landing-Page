/**
 * COURSES COMPONENT CONTROLLER
 * Filter tabs management and pre-selection linking to the counselling form
 */

function initCourses(container = document) {
  const section = container.querySelector('#courses') || document.querySelector('#courses');
  if (!section) return;

  // Filter Tabs Logic
  const tabs = section.querySelectorAll('.filter-tab');
  const cards = section.querySelectorAll('.course-card');
  const matcherChips = section.querySelectorAll('.matcher-chip');

  function applyFilter(filter) {
    tabs.forEach(t => {
      const isMatch = t.getAttribute('data-filter') === filter;
      t.classList.toggle('is-active', isMatch);
      t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    cards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      matcherChips.forEach(c => c.classList.remove('is-active'));
      applyFilter(filter);
    });
  });

  // Background Quick Matcher Chips
  matcherChips.forEach(chip => {
    chip.addEventListener('click', () => {
      matcherChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const targetFilter = chip.getAttribute('data-target-filter');
      applyFilter(targetFilter);
    });
  });

  // Pre-select course in counselling form when "Book Counselling" is clicked
  section.querySelectorAll('[data-track-cta^="book_course_"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ctaType = btn.getAttribute('data-track-cta');
      let courseValue = 'Not Sure';
      
      if (ctaType.includes('fullstack')) courseValue = 'Full Stack';
      else if (ctaType.includes('data_analytics')) courseValue = 'Data Analytics / Data Science';
      else if (ctaType.includes('aiml')) courseValue = 'AI / ML';
      else if (ctaType.includes('cybersecurity')) courseValue = 'Cybersecurity';
      else if (ctaType.includes('devops')) courseValue = 'Cloud / DevOps';
      else if (ctaType.includes('custom')) courseValue = 'Other';

      const courseSelect = document.querySelector('#courseInterest');
      if (courseSelect) {
        courseSelect.value = courseValue;
        courseSelect.dispatchEvent(new Event('change'));
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.initCourses = initCourses;
}
