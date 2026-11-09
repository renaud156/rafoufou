// Pause Pilates — app : tarifs (écran Infos), chargés en direct depuis le
// site (éditables via /admin), avec repli hors-ligne sur les derniers
// tarifs connus (cache) ou, à défaut, sur ceux ci-dessous.
(function () {
  var CACHE_KEY = 'pp_tarifs_cache_v1';
  var REMOTE_URL = 'https://pause-pilates.netlify.app/data/tarifs.json';

  var DEFAULT_TARIFS = {
    collectif: [
      { id: 'decouverte', name: 'Offre découverte', badge: '1re visite', price: '20 €', priceDetail: 'pour 2 cours, soit 10 €/cours', validity: 'Valable 15 jours' },
      { id: 'unite', name: "Cours à l'unité", badge: '', price: '20 €', priceDetail: 'le cours', validity: 'Sans engagement' },
      { id: 'pack10', name: 'Pack 10 cours', badge: '', price: '180 €', priceDetail: 'soit 18 €/cours', validity: 'Valable 6 mois · 160 € (16 €/cours) pour les moins de 30 ans' },
      { id: 'pack20', name: 'Pack 20 cours', badge: 'Meilleur prix', price: '300 €', priceDetail: 'soit 15 €/cours', validity: 'Valable 12 mois', featured: true },
    ],
    individuel: { name: 'Cours individuel de Pilates', price: '60 €', priceDetail: 'la séance', validity: 'Bilan postural et séance personnalisée, sur rendez-vous' },
  };

  var tarifs = DEFAULT_TARIFS;

  (function loadCache() {
    try {
      var raw = window.localStorage && localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.collectif)) tarifs = parsed;
    } catch (e) {}
  })();

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cardHtml(card) {
    return (
      '<div class="tarif-card' + (card.featured ? ' tarif-card--featured' : '') + '">' +
      '<div class="tarif-card__head">' +
      '<span class="tarif-card__name">' + escapeHtml(card.name) + '</span>' +
      (card.badge ? '<span class="tarif-card__badge">' + escapeHtml(card.badge) + '</span>' : '') +
      '</div>' +
      '<div class="tarif-card__price"><strong>' + escapeHtml(card.price) + '</strong><span>' + escapeHtml(card.priceDetail || '') + '</span></div>' +
      (card.validity ? '<p class="tarif-card__note">' + escapeHtml(card.validity) + '</p>' : '') +
      '</div>'
    );
  }

  function render() {
    var collectifEl = document.getElementById('tarif-list-collectif');
    var individuelEl = document.getElementById('tarif-list-individuel');
    if (collectifEl) collectifEl.innerHTML = (tarifs.collectif || []).map(cardHtml).join('');
    if (individuelEl && tarifs.individuel) individuelEl.innerHTML = cardHtml(tarifs.individuel);
  }

  function refresh() {
    if (!window.fetch) return;
    fetch(REMOTE_URL, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.collectif)) return;
        var changed = JSON.stringify(data) !== JSON.stringify(tarifs);
        tarifs = data;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
        if (changed) render();
      })
      .catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    refresh();
  });
})();
