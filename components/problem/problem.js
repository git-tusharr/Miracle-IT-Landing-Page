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
}

if (typeof window !== 'undefined') {
  window.initProblem = initProblem;
}
