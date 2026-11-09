// Pause Pilates — site web : rend le planning, les tarifs et quelques
// textes à partir de fichiers JSON (data/*.json), éditables sans toucher
// au code via l'interface d'admin (/admin). Les fichiers HTML ne contiennent
// plus que des conteneurs vides pour ces sections ; ce script les remplit
// avant que main.js n'attache ses interactions (filtres, etc.).
(function () {
  var RESERVE_URL = 'https://member-app.deciplus.pro/pausepilates/home';
  var DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  var DAY_NAMES = { 0: 'Dimanche', 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeRangeLabel(start, end) {
    return start.replace(':', 'h').replace(/h00$/, 'h') + ' – ' + end.replace(':', 'h').replace(/h00$/, 'h');
  }

  function fetchJSON(path) {
    return fetch(path, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function renderSchedule() {
    var container = document.getElementById('schedule-grid');
    if (!container) return Promise.resolve();
    return fetchJSON('data/schedule.json')
      .then(function (slots) {
        var byDay = {};
        slots.forEach(function (slot) {
          (byDay[slot.day] = byDay[slot.day] || []).push(slot);
        });
        var html = '';
        DAY_ORDER.forEach(function (day) {
          var daySlots = byDay[day];
          if (!daySlots || !daySlots.length) return;
          daySlots.sort(function (a, b) { return a.start.localeCompare(b.start); });
          html += '<div class="schedule-day"><h3>' + DAY_NAMES[day] + '</h3>';
          daySlots.forEach(function (slot) {
            html +=
              '<a class="class-slot" data-type="' + escapeHtml(slot.type) + '" href="' + RESERVE_URL + '" target="_blank" rel="noopener">' +
              '<span class="class-slot__time">' + escapeHtml(timeRangeLabel(slot.start, slot.end)) + '</span>' +
              '<span class="class-slot__name">' + escapeHtml(slot.name) + '</span>' +
              (slot.level ? '<span class="class-slot__level">' + escapeHtml(slot.level) + '</span>' : '') +
              '<span class="class-slot__cta">Réserver <span aria-hidden="true">→</span></span>' +
              '</a>';
          });
          html += '</div>';
        });
        container.innerHTML = html;
      })
      .catch(function (err) {
        console.error('Planning indisponible', err);
      });
  }

  var CTA = {
    decouverte: { href: 'contact.html', label: 'Réserver mon offre découverte', className: 'button button--ghost', external: false },
    unite: { href: RESERVE_URL, label: 'Réserver un cours', className: 'button button--ghost', external: true },
    pack10: { href: RESERVE_URL, label: 'Choisir ce pack', className: 'button button--primary', external: true },
    pack20: { href: RESERVE_URL, label: 'Choisir ce pack', className: 'button button--ghost', external: true },
  };
  var DEFAULT_CTA = { href: 'contact.html', label: 'Nous contacter', className: 'button button--ghost', external: false };

  function pricingCardHtml(card, isFeatured) {
    var cta = CTA[card.id] || DEFAULT_CTA;
    return (
      '<div class="pricing-card' + (isFeatured ? ' pricing-card--featured' : '') + '">' +
      (card.badge ? '<span class="pricing-card__ribbon">' + escapeHtml(card.badge) + '</span>' : '') +
      '<h3>' + escapeHtml(card.name) + '</h3>' +
      '<strong>' + escapeHtml(card.price) + '</strong>' +
      (card.priceDetail ? '<small>' + escapeHtml(card.priceDetail) + '</small>' : '') +
      (card.validity ? '<small>' + escapeHtml(card.validity) + '</small>' : '') +
      '<ul>' + (card.features || []).map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('') + '</ul>' +
      '<a class="' + cta.className + '" href="' + cta.href + '"' + (cta.external ? ' target="_blank" rel="noopener"' : '') + '>' + cta.label + '</a>' +
      '</div>'
    );
  }

  function renderTarifs() {
    var collectifEl = document.getElementById('pricing-grid-collectif');
    var individuelEl = document.getElementById('pricing-grid-individuel');
    if (!collectifEl && !individuelEl) return Promise.resolve();
    return fetchJSON('data/tarifs.json')
      .then(function (data) {
        if (collectifEl) {
          collectifEl.innerHTML = (data.collectif || [])
            .map(function (card) { return pricingCardHtml(card, !!card.featured); })
            .join('');
        }
        if (individuelEl && data.individuel) {
          var ind = data.individuel;
          individuelEl.innerHTML =
            '<div class="pricing-card">' +
            '<h3>' + escapeHtml(ind.name) + '</h3>' +
            '<strong>' + escapeHtml(ind.price) + '</strong>' +
            (ind.priceDetail ? '<small>' + escapeHtml(ind.priceDetail) + '</small>' : '') +
            '<ul>' + (ind.features || []).map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('') + '</ul>' +
            '<a class="button button--ghost" href="contact.html">Demander un rendez-vous</a>' +
            '</div>';
        }
      })
      .catch(function (err) {
        console.error('Tarifs indisponibles', err);
      });
  }

  function renderTexts() {
    var targets = {
      'contact-horaires': 'horaires',
      'faq-annulation-text': 'faqAnnulation',
      'faq-paiement-text': 'faqPaiement',
      'emploi-offre-text': 'emploiOffre',
    };
    var present = Object.keys(targets).filter(function (id) { return document.getElementById(id); });
    if (!present.length) return Promise.resolve();
    return fetchJSON('data/content.json')
      .then(function (data) {
        present.forEach(function (id) {
          var el = document.getElementById(id);
          var value = data[targets[id]];
          if (el && value) el.textContent = value;
        });
      })
      .catch(function (err) {
        console.error('Textes indisponibles', err);
      });
  }

  window.PauseDynamicContent = {
    ready: Promise.all([renderSchedule(), renderTarifs(), renderTexts()]),
  };
})();
