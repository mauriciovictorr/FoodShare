(function SolicitacoesRecebidasModule() {
  'use strict';

  var overlay = null;
  var bodyEl = null;
  var actionsEl = null;
  var catalog = {};
  var activeFilter = 'todos';

  var listEl = document.querySelector('[data-solicitacoes-list]');
  var countEl = document.querySelector('[data-solicitacoes-count]');
  var filterEmptyEl = document.querySelector('[data-solicitacoes-filter-empty]');
  var filterChips = document.querySelectorAll('[data-solicitacao-filter]');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadCatalog() {
    var script = document.getElementById('solicitacoes-detalhe-data');
    if (!script) return;
    try {
      catalog = JSON.parse(script.textContent || '{}');
    } catch (err) {
      catalog = {};
      console.error('[solicitacao-detail] JSON inválido:', err);
    }
  }

  function getItems() {
    if (!listEl) return [];
    return Array.prototype.slice.call(listEl.querySelectorAll('[data-solicitacao-id]'));
  }

  function updateFilterView() {
    var items = getItems();
    var visible = 0;

    items.forEach(function (item) {
      var status = item.getAttribute('data-status') || '';
      var show = activeFilter === 'todos' || status === activeFilter;
      item.classList.toggle('is-filter-hidden', !show);
      item.toggleAttribute('hidden', !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent = visible + (visible === 1 ? ' pedido' : ' pedidos');
    }

    if (filterEmptyEl) {
      filterEmptyEl.hidden = visible > 0;
    }
  }

  function bindFilters() {
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function (event) {
        event.preventDefault();
        filterChips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-solicitacao-filter') || 'todos';
        updateFilterView();
      });
    });
  }

  function renderDetail(detail) {
    var render = window.AppDetailModalRender;
    if (!render) return;

    var badges = [
      { key: detail.statusKey, label: detail.statusLabel },
      { key: 'neutral', label: detail.criadoLabel },
    ];

    var facts = [{ label: 'Pedido em', value: detail.criadoEm }];
    if (!detail.isPendente) {
      facts.push({ label: 'Atualizado em', value: detail.atualizadoEm });
    }
    if (detail.receptorEmail) {
      facts.push({ label: 'E-mail', value: detail.receptorEmail });
    }

    bodyEl.innerHTML = render.renderBody({
      titleId: 'solicitacao-detail-title',
      title: detail.title,
      deNome: detail.receptorNome,
      badges: badges,
      noteLabel: detail.observacoes ? 'Mensagem do solicitante' : null,
      noteText: detail.observacoes,
      factsLabel: 'Informações',
      facts: facts,
      items: detail.itens,
      itemsAriaLabel: 'Itens do pacote',
    });

    var actionsHtml = '';

    if (detail.isPendente) {
      actionsHtml +=
        '<form action="/solicitacoes/' + escapeHtml(detail.id) + '/recusar" method="POST" class="solicitacao-detail-modal__form">' +
          '<button type="submit" class="feedback-modal__btn feedback-modal__btn--secondary">Recusar</button>' +
        '</form>' +
        '<form action="/solicitacoes/' + escapeHtml(detail.id) + '/aceitar" method="POST" class="solicitacao-detail-modal__form">' +
          '<button type="submit" class="feedback-modal__btn feedback-modal__btn--primary">Aceitar</button>' +
        '</form>';
    } else {
      actionsHtml =
        '<button type="button" class="feedback-modal__btn feedback-modal__btn--secondary" data-solicitacao-detail-close>Fechar</button>';
    }

    actionsEl.innerHTML = actionsHtml;
  }

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

  function open(solicitacaoId) {
    var detail = catalog[solicitacaoId];
    if (!detail || !overlay) return;

    renderDetail(detail);
    overlay.classList.remove('is-closing');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('feedback-modal-open');

    var modal = overlay.querySelector('.doacao-detail-modal');
    if (modal) {
      modal.style.animation = 'none';
      void modal.offsetWidth;
      modal.style.animation = '';
    }

    var closeBtn = overlay.querySelector('[data-solicitacao-detail-close]');
    if (closeBtn) closeBtn.focus();
  }

  function shouldIgnoreClick(target) {
    return Boolean(
      target.closest('a, button, input, select, textarea, label, form, .home-request__actions')
    );
  }

  function bindModal() {
    if (!overlay) return;

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-solicitacao-detail-close]')) {
        event.preventDefault();
        close();
        return;
      }

      if (event.target === overlay && overlay.classList.contains('is-open')) {
        close();
        return;
      }

      if (shouldIgnoreClick(event.target)) return;

      var row = event.target.closest('[data-solicitacao-id]');
      if (!row || row.classList.contains('is-filter-hidden')) return;

      var solicitacaoId = row.getAttribute('data-solicitacao-id');
      if (!solicitacaoId || !catalog[solicitacaoId]) return;

      event.preventDefault();
      open(solicitacaoId);
    });

    document.addEventListener('keydown', function (event) {
      if (!overlay || !overlay.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();

      if (event.key === 'Enter' || event.key === ' ') {
        var row = event.target.closest('[data-solicitacao-id]');
        if (!row || shouldIgnoreClick(event.target) || row.classList.contains('is-filter-hidden')) return;
        if (event.key === ' ') event.preventDefault();
        var solicitacaoId = row.getAttribute('data-solicitacao-id');
        if (solicitacaoId && catalog[solicitacaoId]) open(solicitacaoId);
      }
    });
  }

  function init() {
    overlay = document.getElementById('solicitacao-detail-overlay');
    bodyEl = document.getElementById('solicitacao-detail-body');
    actionsEl = document.getElementById('solicitacao-detail-actions');

    loadCatalog();
    bindFilters();
    updateFilterView();

    if (!overlay || !bodyEl || !actionsEl || !window.AppDetailModalRender || Object.keys(catalog).length === 0) return;
    bindModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
