/**
 * MIRACLE IT CAREER ACADEMY — FAQ ACCORDION CONTROLLER
 * High-performance, fully accessible Vanilla JS dropdown accordion.
 * Features:
 *  - Event delegation with double-initialization guard (prevents duplicate bindings)
 *  - Smooth dropdown accordion animation with ARIA state management
 *  - Category filter tabs with live item counter
 *  - Real-time Instant Search with auto-clear
 *  - URL hash linking support (e.g. #faq-2)
 */

function initFAQ(container = document) {
  const accordion = container.querySelector('#faqAccordion') || document.querySelector('#faqAccordion');
  if (!accordion) return;

  // Prevent duplicate initialization when both DOMContentLoaded & main.js invoke it
  if (accordion.dataset.faqInitialized === 'true') {
    return;
  }
  accordion.dataset.faqInitialized = 'true';

  const items = Array.from(accordion.querySelectorAll('.faq-item'));
  const searchInput = container.querySelector('#faqSearchInput') || document.querySelector('#faqSearchInput');
  const searchClearBtn = container.querySelector('#faqSearchClear') || document.querySelector('#faqSearchClear');
  const filterTabs = container.querySelectorAll('.faq-tab-btn');
  const statusText = container.querySelector('#faqStatusText') || document.querySelector('#faqStatusText');
  const emptyState = container.querySelector('#faqEmptyState') || document.querySelector('#faqEmptyState');
  const resetSearchBtn = container.querySelector('#faqResetSearchBtn') || document.querySelector('#faqResetSearchBtn');

  let activeFilter = 'all';

  // Reliable Event Delegation on Accordion Container
  accordion.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;

    e.preventDefault();
    const item = trigger.closest('.faq-item');
    if (!item) return;

    const isCurrentlyActive = item.classList.contains('is-active');

    // Close all other items for a clean single-open accordion experience
    items.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('is-active');
        const otherTrigger = otherItem.querySelector('.faq-trigger');
        if (otherTrigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Toggle clicked item
    if (isCurrentlyActive) {
      item.classList.remove('is-active');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('is-active');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  // Filtering & Live Search Logic
  function applyFilterAndSearch() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    items.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const itemText = item.textContent.toLowerCase();
      const matchesCategory = (activeFilter === 'all' || itemCategory === activeFilter);
      const matchesQuery = (!query || itemText.includes(query));

      if (matchesCategory && matchesQuery) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Update Status Bar
    if (statusText) {
      if (query) {
        statusText.textContent = `Showing ${visibleCount} matching question${visibleCount === 1 ? '' : 's'} for "${query}"`;
      } else if (activeFilter !== 'all') {
        statusText.textContent = `Showing ${visibleCount} question${visibleCount === 1 ? '' : 's'} in selected topic`;
      } else {
        statusText.textContent = `Showing ${visibleCount} of ${items.length} questions`;
      }
    }

    // Empty state handling
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
        accordion.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        accordion.style.display = 'flex';
      }
    }

    // Toggle clear search button
    if (searchClearBtn) {
      searchClearBtn.style.display = query ? 'flex' : 'none';
    }
  }

  // Category Tabs click binding
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      applyFilterAndSearch();
    });
  });

  // Search input binding
  if (searchInput) {
    searchInput.addEventListener('input', applyFilterAndSearch);
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        applyFilterAndSearch();
      }
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeFilter = 'all';
      filterTabs.forEach(t => {
        const isAll = t.getAttribute('data-filter') === 'all';
        t.classList.toggle('is-active', isAll);
        t.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      applyFilterAndSearch();
    });
  }

  // Handle URL hash direct linking (e.g. #faq-2)
  if (window.location.hash && window.location.hash.startsWith('#faq-')) {
    const targetId = parseInt(window.location.hash.replace('#faq-', ''), 10);
    if (!isNaN(targetId) && targetId >= 1 && targetId <= items.length) {
      setTimeout(() => {
        const targetItem = accordion.querySelector(`[data-faq-id="${targetId}"]`);
        if (targetItem) {
          const trigger = targetItem.querySelector('.faq-trigger');
          if (trigger) trigger.click();
          targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }
}

// Global exports for component loaders and inline scripts
if (typeof window !== 'undefined') {
  window.initFAQ = initFAQ;
  window.initFaq = initFAQ; // Support main.js camelCase mapping
}

// Auto-run if DOM is already ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initFAQ();
} else {
  document.addEventListener('DOMContentLoaded', () => initFAQ());
}
