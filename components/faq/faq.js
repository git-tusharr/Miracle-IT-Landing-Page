/**
 * FAQ ACCORDION CONTROLLER
 * Accessible Vanilla JavaScript accordion with ARIA management.
 */

function initFAQ(container = document) {
  const accordion = container.querySelector('#faqAccordion') || document.querySelector('#faqAccordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.faq-item');

  // Remove physical hidden attribute so CSS grid rows can animate smoothly
  items.forEach(item => {
    const panel = item.querySelector('.faq-panel');
    if (panel) {
      panel.removeAttribute('hidden');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

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
            otherPanel.setAttribute('aria-hidden', 'true');
            otherItem.classList.remove('is-active');
          }
        }
      });

      // Toggle current panel smoothly
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        item.classList.remove('is-active');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        item.classList.add('is-active');
      }
    });
  });

  // Live Instant Search Filter (Skiper UI)
  const searchInput = container.querySelector('#faqSearchInput') || document.querySelector('#faqSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.initFAQ = initFAQ;
}
