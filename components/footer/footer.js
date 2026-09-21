/**
 * FOOTER COMPONENT CONTROLLER
 */
function initFooter(container = document) {
  const privacyModal = container.querySelector('#privacyModal') || document.querySelector('#privacyModal');
  const termsModal = container.querySelector('#termsModal') || document.querySelector('#termsModal');
  const btnOpenPrivacy = container.querySelector('#btnOpenPrivacy') || document.querySelector('#btnOpenPrivacy');
  const btnOpenTerms = container.querySelector('#btnOpenTerms') || document.querySelector('#btnOpenTerms');
  const btnClosePrivacy = container.querySelector('#btnClosePrivacy') || document.querySelector('#btnClosePrivacy');
  const btnCloseTerms = container.querySelector('#btnCloseTerms') || document.querySelector('#btnCloseTerms');

  const openModal = (modal) => {
    if (!modal) return;
    modal.removeAttribute('hidden');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };

  btnOpenPrivacy?.addEventListener('click', () => openModal(privacyModal));
  btnOpenTerms?.addEventListener('click', () => openModal(termsModal));
  btnClosePrivacy?.addEventListener('click', () => closeModal(privacyModal));
  btnCloseTerms?.addEventListener('click', () => closeModal(termsModal));

  [privacyModal, termsModal].forEach(m => {
    if (!m) return;
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(privacyModal);
      closeModal(termsModal);
    }
  });
}

if (typeof window !== 'undefined') {
  window.initFooter = initFooter;
}
