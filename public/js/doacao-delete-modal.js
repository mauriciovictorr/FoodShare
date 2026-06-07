(function DoacaoDeleteModalModule() {
  'use strict';

  var overlay = null;
  var form = null;
  var descriptionEl = null;
  var defaultDescription = '';

  function close() {
    if (!overlay) return;

    if (window.AppMotion) {
      window.AppMotion.closeOverlay(overlay, { bodyClass: 'feedback-modal-open' });
      return;
    }

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('feedback-modal-open');
  }

  function open(doacaoId, label) {
    if (!overlay || !form || !doacaoId) return;

    if (window.DoacaoDetailModal && window.DoacaoDetailModal.close) {
      window.DoacaoDetailModal.close();
    }

    form.action = '/doacoes/' + doacaoId + '/excluir';

    if (descriptionEl) {
      descriptionEl.textContent = label
        ? 'Tem certeza que deseja excluir "' + label + '"? Esta ação não pode ser desfeita.'
        : defaultDescription;
    }

    overlay.classList.remove('is-closing');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('feedback-modal-open');

    var modal = overlay.querySelector('.feedback-modal');
    if (modal) {
      modal.style.animation = 'none';
      void modal.offsetWidth;
      modal.style.animation = '';
    }

    var cancelBtn = overlay.querySelector('[data-doacao-delete-close]');
    if (cancelBtn) cancelBtn.focus();
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-doacao-delete-open]');
      if (trigger) {
        event.preventDefault();
        event.stopPropagation();
        open(
          trigger.getAttribute('data-doacao-delete-open'),
          trigger.getAttribute('data-doacao-delete-label') || ''
        );
        return;
      }

      if (event.target.closest('[data-doacao-delete-close]')) {
        event.preventDefault();
        close();
        return;
      }

      if (event.target === overlay && overlay.classList.contains('is-open')) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
        close();
      }
    });
  }

  function init() {
    overlay = document.getElementById('doacao-delete-overlay');
    form = document.querySelector('[data-doacao-delete-form]');
    descriptionEl = document.querySelector('[data-doacao-delete-description]');
    if (!overlay || !form) return;

    if (descriptionEl) {
      defaultDescription = descriptionEl.textContent.trim();
    }

    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.DoacaoDeleteModal = { open: open, close: close };
})();
