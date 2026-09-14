/**
 * FAQ ACCORDION CONTROLLER
 * Accessible Vanilla JavaScript accordion with ARIA management.
 */

function initFAQ(container = document) {
  const accordion = container.querySelector('#faqAccordion') || document.querySelector('#faqAccordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Optionally close other items for clean single-panel view
      items.forEach(otherItem => {
        if (otherItem !== item) {
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherPanel = otherItem.querySelector('.faq-panel');
          if (otherTrigger && otherPanel) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherPanel.hidden = true;
            otherItem.classList.remove('is-active');
          }
        }
      });

      // Toggle current panel
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        item.classList.remove('is-active');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        item.classList.add('is-active');
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.initFAQ = initFAQ;
}
