/**
 * PROBLEM COMPONENT CONTROLLER
 * Toggles between Dilemma Cards and Before/After Comparison views
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
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        targetCard.style.transition = 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)';
        targetCard.style.boxShadow = '0 0 35px 4px rgba(99, 102, 241, 0.7), 0 0 15px rgba(56, 189, 248, 0.4)';
        targetCard.style.borderColor = 'rgba(99, 102, 241, 0.9)';
        targetCard.style.transform = 'translateY(-6px) scale(1.02)';

        setTimeout(() => {
          targetCard.style.boxShadow = '';
          targetCard.style.borderColor = '';
          targetCard.style.transform = '';
        }, 1200);
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.initProblem = initProblem;
}
