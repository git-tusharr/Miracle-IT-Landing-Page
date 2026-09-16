/**
 * COUNSELLING PROCESS COMPONENT CONTROLLER
 *
 * NOTE: The 5-step centered on-scroll transitions for this section are managed
 * centrally by MiracleMotion.initCounsellingProcessTransition() in js/motion.js.
 * This file is kept as a lightweight component extension point.
 */

function initCounsellingProcess(container = document) {
  // Motion and on-scroll transitions owned centrally in js/motion.js
}

if (typeof window !== 'undefined') {
  window.initCounsellingProcess = initCounsellingProcess;
}