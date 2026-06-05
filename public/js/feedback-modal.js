/**
 * Modal de feedback reutilizável (erros, avisos, confirmações).
 *
 * Uso server-side: incluir `feedback-modal.ejs` com objeto `modal`.
 * O overlay com classe `is-open` abre automaticamente ao carregar a página.
 */
(function FeedbackModalModule() {
  'use strict';

  function getOpenOverlay() {
    return document.querySelector('.feedback-modal-overlay.is-open');
  }

  function close() {
    var overlay = getOpenOverlay();
    if (!overlay) return;

    overlay.classList.remove('is-open');
    document.body.classList.remove('feedback-modal-open');
  }

  function open(overlay) {
    if (!overlay) return;

    overlay.classList.add('is-open');
    document.body.classList.add('feedback-modal-open');

    var primaryBtn = overlay.querySelector('[data-feedback-modal-close]');
    if (primaryBtn) primaryBtn.focus();
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-feedback-modal-close]')) {
        event.preventDefault();
        close();
      }
    });

    document.addEventListener('click', function (event) {
      var overlay = event.target.closest('.feedback-modal-overlay');
      if (overlay && event.target === overlay) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
  }

  function initAutoOpen() {
    var overlay = getOpenOverlay();
    if (overlay) open(overlay);
  }

  function init() {
    bindEvents();
    initAutoOpen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.FeedbackModal = {
    open: open,
    close: close,
  };
})();
