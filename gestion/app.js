// Pause Pilates — Espace de gestion : interface sur-mesure (remplace une
// interface générique type CMS) pour éditer le planning, les tarifs et
// quelques textes du site, sans aucune notion technique.
//
// Lit/écrit directement les fichiers data/*.json du dépôt GitHub via le
// proxy "Git Gateway" de Netlify Identity (même mécanisme que Decap CMS,
// mais avec une interface entièrement adaptée à Pause Pilates).
(function () {
  'use strict';

  var GATEWAY = '/.netlify/git/github';
  var BRANCH = 'main';
  var app = document.getElementById('app');
  var logoutBtn = document.getElementById('logout-btn');
  var backToSiteBtn = document.getElementById('back-to-site');

  // Navigation la plus robuste possible : on force la redirection en JS
  // (au lieu de compter uniquement sur le clic natif du lien) et on
  // prévient la page d'accueil de sauter son écran de chargement, pour
  // éviter tout flash sombre qui pourrait ressembler à un bug sur mobile.
  if (backToSiteBtn) {
    backToSiteBtn.addEventListener('click', function (event) {
      event.preventDefault();
      try { sessionStorage.setItem('pp_skip_loader', '1'); } catch (e) {}
      window.location.href = '/';
    });
  }

  var DAY_OPTIONS = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' },
  ];

  var TYPE_OPTIONS = [
    { value: 'pilates', label: 'Pilates' },
    { value: 'pilates-inter', label: 'Pilates intermédiaire' },
    { value: 'abdos', label: 'Abdos de Gasquet' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'cardio', label: 'Cardio renfo' },
  ];

  // --- Utilitaires génériques ---------------------------------------

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === 'text') node.textContent = attrs[key];
      else if (key.indexOf('on') === 0 && typeof attrs[key] === 'function') node.addEventListener(key.slice(2), attrs[key]);
      else if (attrs[key] !== false && attrs[key] != null) node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function b64EncodeUnicode(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  function b64DecodeUnicode(str) {
    var binary = atob(str.replace(/\n/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // --- Accès aux données (Git Gateway) --------------------------------

  function authHeaders() {
    var user = window.netlifyIdentity && window.netlifyIdentity.currentUser();
    if (!user) return Promise.reject(new Error('Session expirée — reconnectez-vous.'));
    return user.jwt().then(function (token) {
      return { Authorization: 'Bearer ' + token };
    });
  }

  function readJSON(path) {
    return authHeaders().then(function (headers) {
      return fetch(GATEWAY + '/contents/' + path + '?ref=' + BRANCH, { headers: headers }).then(function (res) {
        if (!res.ok) throw new Error('Lecture impossible (' + path + ', code ' + res.status + ')');
        return res.json();
      });
    }).then(function (data) {
      return { value: JSON.parse(b64DecodeUnicode(data.content)), sha: data.sha };
    });
  }

  function writeJSON(path, value, sha, message) {
    return authHeaders().then(function (headers) {
      var body = {
        message: message,
        content: b64EncodeUnicode(JSON.stringify(value, null, 2) + '\n'),
        sha: sha,
        branch: BRANCH,
      };
      headers['Content-Type'] = 'application/json';
      return fetch(GATEWAY + '/contents/' + path, { method: 'PUT', headers: headers, body: JSON.stringify(body) }).then(function (res) {
        if (!res.ok) {
          return res.text().then(function (text) {
            throw new Error('La publication a échoué (code ' + res.status + '). ' + (res.status === 409 ? 'Quelqu’un d’autre a modifié ce fichier entre-temps — rechargez la page et réessayez.' : text.slice(0, 200)));
          });
        }
        return res.json();
      });
    });
  }

  // --- Message de statut (en haut de chaque écran d'édition) ---------

  function statusEl() {
    return document.getElementById('gestion-status');
  }

  function setStatus(kind, text) {
    var node = statusEl();
    if (!node) return;
    node.className = 'gestion-status is-visible gestion-status--' + kind;
    node.textContent = text;
  }

  function clearStatus() {
    var node = statusEl();
    if (!node) return;
    node.className = 'gestion-status';
    node.textContent = '';
  }

  // --- Écran d'accueil -------------------------------------------------

  function renderHome() {
    app.innerHTML = '';
    var wrap = el('div', { class: 'gestion-shell gestion-home' }, [
      el('h1', { text: 'Bonjour 👋' }),
      el('p', { text: 'Que voulez-vous modifier aujourd’hui ?' }),
      el('div', { class: 'gestion-tiles' }, [
        el('a', { class: 'gestion-tile', href: '#/planning' }, [
          el('span', { class: 'gestion-tile__icon', text: '🗓️' }),
          el('strong', { text: 'Planning des cours' }),
          el('span', { text: 'Jours, horaires, types de cours' }),
        ]),
        el('a', { class: 'gestion-tile', href: '#/tarifs' }, [
          el('span', { class: 'gestion-tile__icon', text: '💶' }),
          el('strong', { text: 'Tarifs' }),
          el('span', { text: 'Prix et formules, cours collectifs et individuels' }),
        ]),
        el('a', { class: 'gestion-tile', href: '#/textes' }, [
          el('span', { class: 'gestion-tile__icon', text: '✏️' }),
          el('strong', { text: 'Textes du site' }),
          el('span', { text: 'Horaires du studio, FAQ, offre d’emploi' }),
        ]),
      ]),
    ]);
    app.appendChild(wrap);
  }

  function screenHeader(title) {
    return el('div', {}, [
      el('a', { class: 'gestion-back', href: '#/', text: '← Retour à l’accueil' }),
      el('div', { class: 'gestion-header-row' }, [
        el('h1', { text: title }),
        el('span', { id: 'gestion-status', class: 'gestion-status' }),
      ]),
    ]);
  }

  function actionsBar(onPublish) {
    var publishBtn = el('button', { type: 'button', class: 'gestion-button', onclick: onPublish, text: 'Publier les modifications' });
    return { bar: el('div', { class: 'gestion-actions-bar' }, [publishBtn]), publishBtn: publishBtn };
  }

  // --- Écran Planning ---------------------------------------------------

  function renderPlanning() {
    app.innerHTML = '';
    var shell = el('div', { class: 'gestion-shell' });
    shell.appendChild(screenHeader('Planning des cours'));
    var list = el('div', { id: 'planning-list' });
    shell.appendChild(list);
    var addBtn = el('button', { type: 'button', class: 'gestion-add-row', text: '+ Ajouter un cours' });
    shell.appendChild(addBtn);
    app.appendChild(shell);

    setStatus('loading', 'Chargement…');
    readJSON('data/schedule.json').then(function (result) {
      clearStatus();
      var sha = result.sha;
      var rows = result.value.map(cloneSlot);

      function cloneSlot(s) {
        return { day: s.day, start: s.start, end: s.end, type: s.type, name: s.name, level: s.level || '', desc: s.desc || '' };
      }

      function renderRows() {
        list.innerHTML = '';
        if (!rows.length) {
          list.appendChild(el('p', { class: 'gestion-empty', text: 'Aucun cours pour l’instant — ajoutez-en un ci-dessous.' }));
        }
        rows.forEach(function (row, index) {
          list.appendChild(renderSlotCard(row, index));
        });
      }

      function renderSlotCard(row, index) {
        var daySelect = el('select', {}, DAY_OPTIONS.map(function (d) {
          return el('option', { value: d.value, selected: String(row.day) === String(d.value) ? 'selected' : false, text: d.label });
        }));
        daySelect.addEventListener('change', function () { row.day = Number(daySelect.value); });

        var typeSelect = el('select', {}, TYPE_OPTIONS.map(function (t) {
          return el('option', { value: t.value, selected: row.type === t.value ? 'selected' : false, text: t.label });
        }));
        typeSelect.addEventListener('change', function () { row.type = typeSelect.value; });

        var startInput = el('input', { type: 'time', value: row.start });
        startInput.addEventListener('change', function () { row.start = startInput.value; });
        var endInput = el('input', { type: 'time', value: row.end });
        endInput.addEventListener('change', function () { row.end = endInput.value; });

        var nameInput = el('input', { type: 'text', value: row.name, placeholder: 'Ex. Pilates' });
        nameInput.addEventListener('input', function () { row.name = nameInput.value; });

        var levelInput = el('input', { type: 'text', value: row.level, placeholder: 'Ex. Tous niveaux (laisser vide si non précisé)' });
        levelInput.addEventListener('input', function () { row.level = levelInput.value; });

        var descInput = el('textarea', { rows: 2, placeholder: 'Description visible dans l’application (optionnel)' }, [document.createTextNode(row.desc)]);
        descInput.addEventListener('input', function () { row.desc = descInput.value; });

        var deleteBtn = el('button', {
          type: 'button', class: 'gestion-icon-button', title: 'Supprimer ce cours', 'aria-label': 'Supprimer ce cours',
          onclick: function () {
            if (!confirm('Supprimer ce cours du planning ?')) return;
            rows.splice(index, 1);
            renderRows();
          },
        }, [document.createTextNode('✕')]);

        return el('div', { class: 'gestion-card' }, [
          el('div', { class: 'gestion-card__head' }, [
            el('span', { class: 'gestion-card__title', text: 'Cours ' + (index + 1) }),
            deleteBtn,
          ]),
          el('div', { class: 'gestion-field-grid' }, [
            field('Jour', daySelect),
            field('Type de cours', typeSelect),
            field('Heure de début', startInput),
            field('Heure de fin', endInput),
            field('Nom affiché', nameInput),
            field('Niveau (optionnel)', levelInput),
            fieldFull('Description (application uniquement, optionnel)', descInput),
          ]),
        ]);
      }

      addBtn.addEventListener('click', function () {
        rows.push({ day: 1, start: '09:00', end: '10:00', type: 'pilates', name: 'Pilates', level: '', desc: '' });
        renderRows();
      });

      var actions = actionsBar(function () {
        var error = validateRows(rows);
        if (error) { setStatus('error', error); return; }
        actions.publishBtn.disabled = true;
        setStatus('loading', 'Publication en cours…');
        writeJSON('data/schedule.json', trimStrings(rows), sha, 'Mise à jour du planning depuis l’espace de gestion')
          .then(function (res) {
            sha = res.content ? res.content.sha : sha;
            setStatus('ok', 'Planning publié ✓ — en ligne sous quelques instants.');
            actions.publishBtn.disabled = false;
          })
          .catch(function (err) {
            setStatus('error', err.message);
            actions.publishBtn.disabled = false;
          });
      });
      shell.appendChild(actions.bar);

      renderRows();
    }).catch(function (err) {
      setStatus('error', err.message);
    });
  }

  // Évite les espaces oubliés en début/fin de champ (ex. "Expert ") dans
  // tout ce qui part vers le dépôt — appliqué juste avant chaque publication.
  function trimStrings(value) {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(trimStrings);
    if (value && typeof value === 'object') {
      var out = {};
      Object.keys(value).forEach(function (key) { out[key] = trimStrings(value[key]); });
      return out;
    }
    return value;
  }

  function validateRows(rows) {
    var timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!r.name || !r.name.trim()) return 'Le cours ' + (i + 1) + ' n’a pas de nom.';
      if (!timePattern.test(r.start) || !timePattern.test(r.end)) return 'Le cours ' + (i + 1) + ' a une heure invalide.';
      if (r.start >= r.end) return 'Le cours ' + (i + 1) + ' : l’heure de fin doit être après l’heure de début.';
    }
    return null;
  }

  function field(label, input) {
    return el('div', { class: 'gestion-field' }, [el('label', { text: label }), input]);
  }

  function fieldFull(label, input) {
    return el('div', { class: 'gestion-field gestion-field--full' }, [el('label', { text: label }), input]);
  }

  // --- Écran Tarifs -------------------------------------------------

  function renderTarifs() {
    app.innerHTML = '';
    var shell = el('div', { class: 'gestion-shell' });
    shell.appendChild(screenHeader('Tarifs'));
    var collectifList = el('div', { id: 'tarifs-collectif-list' });
    var indivWrap = el('div', { id: 'tarifs-individuel' });
    shell.appendChild(el('h2', { style: 'font-family:var(--font-serif);color:var(--color-sage-dark);font-size:1.1rem;margin:1.5rem 0 0.8rem;', text: 'Formules collectives' }));
    shell.appendChild(collectifList);
    var addBtn = el('button', { type: 'button', class: 'gestion-add-row', text: '+ Ajouter une formule' });
    shell.appendChild(addBtn);
    shell.appendChild(el('h2', { style: 'font-family:var(--font-serif);color:var(--color-sage-dark);font-size:1.1rem;margin:2rem 0 0.8rem;', text: 'Cours individuel' }));
    shell.appendChild(indivWrap);
    app.appendChild(shell);

    setStatus('loading', 'Chargement…');
    readJSON('data/tarifs.json').then(function (result) {
      clearStatus();
      var sha = result.sha;
      var data = {
        collectif: result.value.collectif.map(function (c) {
          return { id: c.id, name: c.name, badge: c.badge || '', price: c.price, priceDetail: c.priceDetail || '', validity: c.validity || '', features: (c.features || []).slice(), featured: !!c.featured };
        }),
        individuel: Object.assign({}, result.value.individuel, { features: (result.value.individuel.features || []).slice() }),
      };

      function renderCollectif() {
        collectifList.innerHTML = '';
        data.collectif.forEach(function (card, index) {
          collectifList.appendChild(renderCollectifCard(card, index));
        });
      }

      function renderCollectifCard(card, index) {
        var nameInput = el('input', { type: 'text', value: card.name });
        nameInput.addEventListener('input', function () { card.name = nameInput.value; });
        var badgeInput = el('input', { type: 'text', value: card.badge, placeholder: 'Ex. Meilleur prix (laisser vide si aucune)' });
        badgeInput.addEventListener('input', function () { card.badge = badgeInput.value; });
        var priceInput = el('input', { type: 'text', value: card.price, placeholder: 'Ex. 20 €' });
        priceInput.addEventListener('input', function () { card.price = priceInput.value; });
        var priceDetailInput = el('input', { type: 'text', value: card.priceDetail, placeholder: 'Ex. pour 2 cours, soit 10 €/cours' });
        priceDetailInput.addEventListener('input', function () { card.priceDetail = priceDetailInput.value; });
        var validityInput = el('input', { type: 'text', value: card.validity, placeholder: 'Ex. Valable 15 jours' });
        validityInput.addEventListener('input', function () { card.validity = validityInput.value; });
        var featuredInput = el('input', { type: 'checkbox', checked: card.featured ? 'checked' : false });
        featuredInput.checked = card.featured;
        featuredInput.addEventListener('change', function () { card.featured = featuredInput.checked; });

        var deleteBtn = el('button', {
          type: 'button', class: 'gestion-icon-button', title: 'Supprimer cette formule', 'aria-label': 'Supprimer cette formule',
          onclick: function () {
            if (!confirm('Supprimer la formule « ' + card.name + ' » ?')) return;
            data.collectif.splice(index, 1);
            renderCollectif();
          },
        }, [document.createTextNode('✕')]);

        return el('div', { class: 'gestion-card' }, [
          el('div', { class: 'gestion-card__head' }, [
            el('span', { class: 'gestion-card__title', text: card.name || 'Formule ' + (index + 1) }),
            deleteBtn,
          ]),
          el('div', { class: 'gestion-field-grid' }, [
            field('Nom de la formule', nameInput),
            field('Étiquette (optionnelle)', badgeInput),
            field('Prix', priceInput),
            field('Détail du prix', priceDetailInput),
            field('Validité', validityInput),
            el('label', { class: 'gestion-checkbox' }, [featuredInput, document.createTextNode('Mettre en avant cette formule')]),
            featuresField(card),
          ]),
        ]);
      }

      function featuresField(card) {
        var rowsWrap = el('div', { class: 'gestion-features' });
        function renderFeatureRows() {
          rowsWrap.innerHTML = '';
          card.features.forEach(function (feat, i) {
            var input = el('input', { type: 'text', value: feat });
            input.addEventListener('input', function () { card.features[i] = input.value; });
            var del = el('button', { type: 'button', class: 'gestion-icon-button', text: '✕', onclick: function () { card.features.splice(i, 1); renderFeatureRows(); } });
            rowsWrap.appendChild(el('div', { class: 'gestion-features__row' }, [input, del]));
          });
          rowsWrap.appendChild(el('button', {
            type: 'button', class: 'gestion-add-row', text: '+ Ajouter un point',
            onclick: function () { card.features.push(''); renderFeatureRows(); },
          }));
        }
        renderFeatureRows();
        return el('div', { class: 'gestion-field gestion-field--full' }, [el('label', { text: 'Points clés' }), rowsWrap]);
      }

      function renderIndividuel() {
        indivWrap.innerHTML = '';
        var ind = data.individuel;
        var nameInput = el('input', { type: 'text', value: ind.name });
        nameInput.addEventListener('input', function () { ind.name = nameInput.value; });
        var priceInput = el('input', { type: 'text', value: ind.price });
        priceInput.addEventListener('input', function () { ind.price = priceInput.value; });
        var priceDetailInput = el('input', { type: 'text', value: ind.priceDetail || '' });
        priceDetailInput.addEventListener('input', function () { ind.priceDetail = priceDetailInput.value; });

        var rowsWrap = el('div', { class: 'gestion-features' });
        function renderFeatureRows() {
          rowsWrap.innerHTML = '';
          ind.features.forEach(function (feat, i) {
            var input = el('input', { type: 'text', value: feat });
            input.addEventListener('input', function () { ind.features[i] = input.value; });
            var del = el('button', { type: 'button', class: 'gestion-icon-button', text: '✕', onclick: function () { ind.features.splice(i, 1); renderFeatureRows(); } });
            rowsWrap.appendChild(el('div', { class: 'gestion-features__row' }, [input, del]));
          });
          rowsWrap.appendChild(el('button', {
            type: 'button', class: 'gestion-add-row', text: '+ Ajouter un point',
            onclick: function () { ind.features.push(''); renderFeatureRows(); },
          }));
        }
        renderFeatureRows();

        indivWrap.appendChild(el('div', { class: 'gestion-card' }, [
          el('div', { class: 'gestion-field-grid' }, [
            field('Nom', nameInput),
            field('Prix', priceInput),
            field('Détail du prix', priceDetailInput),
            el('div', { class: 'gestion-field gestion-field--full' }, [el('label', { text: 'Points clés' }), rowsWrap]),
          ]),
        ]));
      }

      addBtn.addEventListener('click', function () {
        data.collectif.push({ id: 'formule-' + Date.now(), name: 'Nouvelle formule', badge: '', price: '', priceDetail: '', validity: '', features: [], featured: false });
        renderCollectif();
      });

      var actions = actionsBar(function () {
        var error = validateTarifs(data);
        if (error) { setStatus('error', error); return; }
        actions.publishBtn.disabled = true;
        setStatus('loading', 'Publication en cours…');
        writeJSON('data/tarifs.json', trimStrings(data), sha, 'Mise à jour des tarifs depuis l’espace de gestion')
          .then(function (res) {
            sha = res.content ? res.content.sha : sha;
            setStatus('ok', 'Tarifs publiés ✓ — en ligne sous quelques instants.');
            actions.publishBtn.disabled = false;
          })
          .catch(function (err) {
            setStatus('error', err.message);
            actions.publishBtn.disabled = false;
          });
      });
      shell.appendChild(actions.bar);

      renderCollectif();
      renderIndividuel();
    }).catch(function (err) {
      setStatus('error', err.message);
    });
  }

  function validateTarifs(data) {
    for (var i = 0; i < data.collectif.length; i++) {
      var c = data.collectif[i];
      if (!c.name || !c.name.trim()) return 'La formule ' + (i + 1) + ' n’a pas de nom.';
      if (!c.price || !c.price.trim()) return 'La formule « ' + c.name + ' » n’a pas de prix.';
    }
    if (!data.individuel.name || !data.individuel.price) return 'Le cours individuel doit avoir un nom et un prix.';
    return null;
  }

  // --- Écran Textes -------------------------------------------------

  function renderTextes() {
    app.innerHTML = '';
    var shell = el('div', { class: 'gestion-shell' });
    shell.appendChild(screenHeader('Textes du site'));
    var form = el('div', { id: 'textes-form' });
    shell.appendChild(form);
    app.appendChild(shell);

    setStatus('loading', 'Chargement…');
    readJSON('data/content.json').then(function (result) {
      clearStatus();
      var sha = result.sha;
      var data = Object.assign({}, result.value);

      var horairesInput = el('input', { type: 'text', value: data.horaires });
      horairesInput.addEventListener('input', function () { data.horaires = horairesInput.value; });

      var faqAnnulInput = el('textarea', { rows: 3 }, [document.createTextNode(data.faqAnnulation)]);
      faqAnnulInput.addEventListener('input', function () { data.faqAnnulation = faqAnnulInput.value; });

      var faqPaiementInput = el('textarea', { rows: 3 }, [document.createTextNode(data.faqPaiement)]);
      faqPaiementInput.addEventListener('input', function () { data.faqPaiement = faqPaiementInput.value; });

      var emploiInput = el('textarea', { rows: 4 }, [document.createTextNode(data.emploiOffre)]);
      emploiInput.addEventListener('input', function () { data.emploiOffre = emploiInput.value; });

      form.appendChild(el('div', { class: 'gestion-card' }, [
        fieldFull('Horaires du studio (affichés sur la page Contact)', horairesInput),
        el('div', { style: 'height:1rem' }),
        fieldFull('FAQ — Comment annuler ou reporter un cours ?', faqAnnulInput),
        el('div', { style: 'height:1rem' }),
        fieldFull('FAQ — Quels moyens de paiement sont acceptés ?', faqPaiementInput),
        el('div', { style: 'height:1rem' }),
        fieldFull('Offre d’emploi (page Emploi)', emploiInput),
      ]));

      var actions = actionsBar(function () {
        actions.publishBtn.disabled = true;
        setStatus('loading', 'Publication en cours…');
        writeJSON('data/content.json', trimStrings(data), sha, 'Mise à jour des textes depuis l’espace de gestion')
          .then(function (res) {
            sha = res.content ? res.content.sha : sha;
            setStatus('ok', 'Textes publiés ✓ — en ligne sous quelques instants.');
            actions.publishBtn.disabled = false;
          })
          .catch(function (err) {
            setStatus('error', err.message);
            actions.publishBtn.disabled = false;
          });
      });
      shell.appendChild(actions.bar);
    }).catch(function (err) {
      setStatus('error', err.message);
    });
  }

  // --- Routeur minimal (hash) ---------------------------------------

  var ROUTES = { '': renderHome, '/': renderHome, '/planning': renderPlanning, '/tarifs': renderTarifs, '/textes': renderTextes };

  function route() {
    var hash = window.location.hash.replace(/^#/, '');
    var render = ROUTES[hash] || renderHome;
    render();
  }

  window.addEventListener('hashchange', route);

  // --- Authentification (Netlify Identity) ---------------------------

  function renderGate(promptLogin) {
    app.innerHTML = '';
    logoutBtn.hidden = true;
    app.appendChild(el('div', { class: 'gestion-gate' }, [
      el('h1', { text: 'Espace de gestion' }),
      el('p', { text: 'Réservé à l’équipe Pause Pilates. Connectez-vous pour continuer.' }),
      el('button', { type: 'button', class: 'gestion-button', onclick: promptLogin, text: 'Se connecter' }),
    ]));
  }

  function boot() {
    if (!window.netlifyIdentity) {
      app.innerHTML = '';
      app.appendChild(el('div', { class: 'gestion-gate' }, [
        el('h1', { text: 'Service indisponible' }),
        el('p', { text: 'Le service de connexion n’a pas pu se charger. Vérifiez votre connexion internet et rechargez la page.' }),
      ]));
      return;
    }

    window.netlifyIdentity.on('init', function (user) {
      if (user) {
        logoutBtn.hidden = false;
        route();
      } else {
        renderGate(function () { window.netlifyIdentity.open('login'); });
      }
    });

    window.netlifyIdentity.on('login', function () {
      window.netlifyIdentity.close();
      logoutBtn.hidden = false;
      route();
    });

    window.netlifyIdentity.on('logout', function () {
      renderGate(function () { window.netlifyIdentity.open('login'); });
    });

    logoutBtn.addEventListener('click', function () {
      window.netlifyIdentity.logout();
    });

    window.netlifyIdentity.init();
  }

  boot();
})();
