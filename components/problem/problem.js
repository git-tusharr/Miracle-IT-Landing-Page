/**
 * PROBLEM COMPONENT CONTROLLER
 * Toggles between Dilemma Cards and Before/After Comparison views,
 * handles interactive diagnostic quick-filter and card highlight states.
 */

function initProblem(container = document) {
  const section = container.querySelector('#problem') || document.querySelector('#problem');
  if (!section) return;

  const btnDilemmas = section.querySelector('#btnShowDilemmas');
  const btnComparison = section.querySelector('#btnShowComparison');
  const viewDilemmas = section.querySelector('#viewDilemmas');
  const viewComparison = section.querySelector('#viewComparison');

  if (btnDilemmas && btnComparison && viewDilemmas && viewComparison) {
    btnDilemmas.addEventListener('click', () => {
      btnDilemmas.classList.add('is-active');
      btnDilemmas.setAttribute('aria-selected', 'true');
      btnComparison.classList.remove('is-active');
      btnComparison.setAttribute('aria-selected', 'false');

      viewDilemmas.classList.remove('is-hidden');
      viewComparison.classList.add('is-hidden');
    });

    btnComparison.addEventListener('click', () => {
      btnComparison.classList.add('is-active');
      btnComparison.setAttribute('aria-selected', 'true');
      btnDilemmas.classList.remove('is-active');
      btnDilemmas.setAttribute('aria-selected', 'false');

      viewComparison.classList.remove('is-hidden');
      viewDilemmas.classList.add('is-hidden');
    });
  }

  // Instant Dilemma Diagnostic Quick-Filter
  const diagnosticBtns = section.querySelectorAll('.diagnostic-btn');
  const dilemmaCards = section.querySelectorAll('.problem-cards-grid .problem-card');

  diagnosticBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Ensure dilemma view is active
      if (btnDilemmas && !btnDilemmas.classList.contains('is-active')) {
        btnDilemmas.click();
      }

      diagnosticBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const cardIdx = parseInt(btn.getAttribute('data-target-card'), 10);
      const targetCard = dilemmaCards[cardIdx];
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        
        // Remove highlight from all cards
        dilemmaCards.forEach(c => c.classList.remove('is-highlighted'));
        
        // Add active highlight to target card
        targetCard.classList.add('is-highlighted');

        setTimeout(() => {
          targetCard.classList.remove('is-highlighted');
        }, 1800);
      }
    });
  });

  // Optional: Clicking on a card's reality pill or contrast box also smooth-scrolls to booking form
  dilemmaCards.forEach((card, idx) => {
    const contrastBox = card.querySelector('.dilemma-contrast-box');
    if (contrastBox) {
      contrastBox.style.cursor = 'pointer';
      contrastBox.setAttribute('title', 'Click to consult a mentor about this dilemma');
      contrastBox.addEventListener('click', (e) => {
        const actionBtn = card.querySelector('.solution-link-btn');
        if (actionBtn) {
          actionBtn.click();
        }
      });
    }
  });
}

if (typeof window !== 'undefined') {
  window.initProblem = initProblem;
  // If document already loaded, initialize immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initProblem();
  } else {
    document.addEventListener('DOMContentLoaded', () => initProblem());
  }
}
