/**
 * MIRACLE IT CAREER ACADEMY — EDITORIAL ACCORDION CONTROLLER
 * Fully accessible Vanilla JS Accordion:
 *  - Only ONE FAQ open at a time
 *  - Clicking active question closes it
 *  - Accessible ARIA states (aria-expanded, aria-controls, role="region")
 *  - Keyboard navigable (Enter / Space / Tab)
 *  - Butter-smooth CSS Grid height transition
 */

function initFAQ(container = document) {
  const accordion = container.querySelector('#faqAccordion') || document.querySelector('#faqAccordion');
  if (!accordion) return;

  // Prevent duplicate initialization
  if (accordion.dataset.faqInitialized === 'true') {
    return;
  }
  accordion.dataset.faqInitialized = 'true';

  const items = Array.from(accordion.querySelectorAll('.faq-item'));

  // Event delegation on accordion container
  accordion.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question-btn');
    if (!btn) return;

    e.preventDefault();
    const currentItem = btn.closest('.faq-item');
    if (!currentItem) return;

    const isCurrentlyOpen = currentItem.classList.contains('is-open');

    // Close all other items (Single open accordion behavior)
    items.forEach(item => {
      if (item !== currentItem && item.classList.contains('is-open')) {
        item.classList.remove('is-open');
        const trigger = item.querySelector('.faq-question-btn');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Toggle current item
    if (isCurrentlyOpen) {
      currentItem.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      currentItem.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

// Support both casing conventions for automatic loader
if (typeof window !== 'undefined') {
  window.initFAQ = initFAQ;
  window.initFaq = initFAQ;
}

// Fallback auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFAQ());
  } else {
    initFAQ();
  }
}
