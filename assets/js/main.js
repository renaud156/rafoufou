import cart from './cart.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const TYPE_OPTIONS = [
  { id: 'stage', label: 'Stages jeunes' },
  { id: 'lesson', label: 'Leçons individuelles' },
];

const LOCATION_OPTIONS = [
  { id: 'paris', label: 'Paris' },
  { id: 'colmar', label: 'Colmar' },
  { id: 'poitiers', label: 'CREPS Poitiers' },
];

const EXTRA_OPTIONS = [
  {
    id: 'housing',
    label: 'Hébergement premium',
    description: 'Chambres twin, pension complète et team building soirée',
    price: 240,
    types: ['stage'],
    locations: ['poitiers', 'colmar'],
  },
  {
    id: 'transport',
    label: 'Navette gare ↔ académie',
    description: 'Aller-retour organisé le dimanche et le samedi',
    price: 90,
    types: ['stage'],
    locations: ['paris', 'colmar', 'poitiers'],
  },
  {
    id: 'futuroscope',
    label: 'Journée Futuroscope',
    description: 'Entrée + accompagnement (obligatoire pour Poitiers)',
    price: 65,
    types: ['stage'],
    locations: ['poitiers'],
    mandatory: true,
  },
];

const WEEK_OPTIONS = {
  stage: {
    paris: [
      { id: '2024-10-20', label: 'Semaine du 20 octobre', shortLabel: 'Du 20/10', status: 'available', spots: 6 },
      { id: '2024-10-27', label: 'Semaine du 27 octobre', shortLabel: 'Du 27/10', status: 'low', spots: 2 },
      { id: '2024-11-03', label: 'Semaine du 3 novembre', shortLabel: 'Du 03/11', status: 'full', spots: 0 },
    ],
    colmar: [
      { id: '2024-10-20', label: 'Semaine du 20 octobre', shortLabel: 'Du 20/10', status: 'available', spots: 8 },
      { id: '2024-10-27', label: 'Semaine du 27 octobre', shortLabel: 'Du 27/10', status: 'low', spots: 3 },
    ],
    poitiers: [
      { id: '2024-10-27', label: 'Semaine du 27 octobre', shortLabel: 'Du 27/10', status: 'low', spots: 2 },
      { id: '2024-11-03', label: 'Semaine du 3 novembre', shortLabel: 'Du 03/11', status: 'available', spots: 5 },
    ],
  },
  lesson: {
    paris: [
      { id: '2024-09-16', label: 'Semaine du 16 septembre', shortLabel: 'Du 16/09', status: 'available', spots: 5 },
      { id: '2024-09-23', label: 'Semaine du 23 septembre', shortLabel: 'Du 23/09', status: 'low', spots: 2 },
      { id: '2024-09-30', label: 'Semaine du 30 septembre', shortLabel: 'Du 30/09', status: 'available', spots: 4 },
    ],
    colmar: [
      { id: '2024-09-23', label: 'Semaine du 23 septembre', shortLabel: 'Du 23/09', status: 'available', spots: 4 },
      { id: '2024-09-30', label: 'Semaine du 30 septembre', shortLabel: 'Du 30/09', status: 'available', spots: 3 },
    ],
    poitiers: [
      { id: '2024-09-23', label: 'Semaine du 23 septembre', shortLabel: 'Du 23/09', status: 'available', spots: 3 },
      { id: '2024-09-30', label: 'Semaine du 30 septembre', shortLabel: 'Du 30/09', status: 'low', spots: 1 },
    ],
  },
};

const FORMULAS = [
  {
    id: 'stage-intensif',
    type: 'stage',
    title: 'Stage Intensif',
    tagline: '5 jours haute intensité, matchs coachés et vidéo feedback.',
    price: 780,
    badges: ['Compétition', 'Analyse vidéo'],
    availability: {
      paris: { spotsLabel: 'Plus que 8 places', weeks: ['2024-10-20', '2024-10-27'] },
      colmar: { spotsLabel: '6 places restantes', weeks: ['2024-10-20'] },
      poitiers: { spotsLabel: '4 places avec hébergement', weeks: ['2024-10-27'] },
    },
    features: [
      '2 × 2h de tennis intensif par jour',
      'Préparation physique individualisée',
      'Analyse vidéo quotidienne',
      'Bilan de performance personnalisé',
    ],
  },
  {
    id: 'stage-performance',
    type: 'stage',
    title: 'Stage Performance',
    tagline: 'Volume ciblé, routine mentale et statistiques de match.',
    price: 720,
    badges: ['Routines mentales', 'Stats match'],
    availability: {
      paris: { spotsLabel: '6 places disponibles', weeks: ['2024-10-20', '2024-10-27'] },
      colmar: { spotsLabel: '5 places ouvertes', weeks: ['2024-10-27'] },
      poitiers: { spotsLabel: 'Dernières places', weeks: ['2024-10-27', '2024-11-03'] },
    },
    features: [
      '2h de tennis technico-tactique / jour',
      'Ateliers statistiques et routines mentales',
      'Analyse de matchs encadrée',
      'Accès aux ateliers récupération & mobilité',
    ],
  },
  {
    id: 'stage-decouverte',
    type: 'stage',
    title: 'Stage Découverte',
    tagline: 'Progression fun & solide pour découvrir la méthode TI.',
    price: 490,
    badges: ['Fun & progression'],
    availability: {
      paris: { spotsLabel: '10 places garanties', weeks: ['2024-10-20', '2024-10-27'] },
      colmar: { spotsLabel: '8 places restantes', weeks: ['2024-10-20'] },
    },
    features: [
      '1h30 de tennis ludique / jour',
      'Mini-matchs coachés chaque après-midi',
      'Suivi technique individualisé',
      'Accueil matinal & goûter inclus',
    ],
  },
  {
    id: 'lesson-session',
    type: 'lesson',
    title: 'Séance individuelle 1h',
    tagline: 'Coaching 100 % personnalisé avec diagnostic vidéo.',
    price: 55,
    badges: ['Coaching 1:1'],
    availability: {
      paris: { spotsLabel: '6 créneaux restants', weeks: ['2024-09-16', '2024-09-23', '2024-09-30'] },
      colmar: { spotsLabel: '4 créneaux disponibles', weeks: ['2024-09-23', '2024-09-30'] },
      poitiers: { spotsLabel: '3 créneaux', weeks: ['2024-09-23'] },
    },
    features: [
      'Diagnostic vidéo et plan de progression',
      'Focus technique et mental sur votre objectif',
      'Support après la séance (drills & vidéos)',
    ],
  },
  {
    id: 'lesson-pack5',
    type: 'lesson',
    title: 'Pack progression 5 séances',
    tagline: 'Suivi sur cinq semaines pour installer vos routines.',
    price: 200,
    badges: ['Suivi 5 semaines'],
    availability: {
      paris: { spotsLabel: '5 packs disponibles', weeks: ['2024-09-23', '2024-09-30'] },
      colmar: { spotsLabel: '3 packs restants', weeks: ['2024-09-30'] },
    },
    features: [
      'Plan d’entraînement personnalisé',
      'Analyse vidéo mi-parcours',
      'Bilan complet avec recommandations',
    ],
  },
  {
    id: 'lesson-pack10',
    type: 'lesson',
    title: 'Pack expertise 10 séances',
    tagline: 'Coaching saison complet avec suivi data et mental.',
    price: 380,
    badges: ['Engagement saison'],
    availability: {
      paris: { spotsLabel: 'Places limitées', weeks: ['2024-09-16', '2024-09-23'] },
      poitiers: { spotsLabel: '2 packs restants', weeks: ['2024-09-30'] },
    },
    features: [
      'Analyse de matchs encadrée',
      'Routine mentale personnalisée',
      'Suivi trimestriel avec objectifs chiffrés',
    ],
  },
];

const getTypeLabel = (id) => TYPE_OPTIONS.find((option) => option.id === id)?.label ?? id;

const getLocationLabel = (id) => LOCATION_OPTIONS.find((option) => option.id === id)?.label ?? id;

const hasFormulasFor = (type, location) =>
  FORMULAS.some((formula) => formula.type === type && formula.availability?.[location]?.weeks?.length);

const getDefaultLocation = (type) => {
  const option = LOCATION_OPTIONS.find((location) => hasFormulasFor(type, location.id));
  return option ? option.id : LOCATION_OPTIONS[0].id;
};

const getWeeksForSelection = (type, location) => [...(WEEK_OPTIONS[type]?.[location] ?? [])];

const findWeek = (type, location, weekId) =>
  getWeeksForSelection(type, location).find((week) => week.id === weekId) ?? null;

const isExtraAvailable = (extra, type, location) =>
  extra.types.includes(type) && extra.locations.includes(location);

const computeAvailableExtras = (state) =>
  EXTRA_OPTIONS.filter((extra) => isExtraAvailable(extra, state.type, state.location));

const sanitizeExtras = (state) => {
  const availableExtras = computeAvailableExtras(state);
  const availableIds = new Set(availableExtras.map((extra) => extra.id));
  state.extras.forEach((id) => {
    if (!availableIds.has(id)) state.extras.delete(id);
  });
  availableExtras.forEach((extra) => {
    if (extra.mandatory) state.extras.add(extra.id);
  });
};

const ensureSelectedWeek = (state) => {
  const weeks = getWeeksForSelection(state.type, state.location);
  if (!weeks.length) {
    state.selectedWeek = null;
    return;
  }
  const found = weeks.find((week) => week.id === state.selectedWeek);
  if (!found) {
    const fallback = weeks.find((week) => week.status !== 'full') || weeks[0];
    state.selectedWeek = fallback ? fallback.id : null;
  }
};

const sanitizeCardSelections = (state) => {
  state.cardSelections.forEach((weekId, formulaId) => {
    const formula = FORMULAS.find((entry) => entry.id === formulaId);
    if (!formula) {
      state.cardSelections.delete(formulaId);
      return;
    }
    const availability = formula.availability?.[state.location];
    if (!availability || !availability.weeks.includes(weekId)) {
      state.cardSelections.delete(formulaId);
    }
  });
};

const composeMetaKey = (formulaId, type, location, weekId, extrasIds) => {
  const extrasKey = extrasIds.length ? extrasIds.join('-') : 'base';
  return [type, location, weekId || 'custom', extrasKey].join('__');
};

const buildDateLabel = ({ weekLabel, locationLabel, extras }) => {
  const parts = [];
  if (weekLabel) parts.push(weekLabel);
  if (locationLabel) parts.push(locationLabel);
  if (extras && extras.length) parts.push(extras.map((extra) => extra.label).join(', '));
  return parts.length ? parts.join(' • ') : locationLabel || weekLabel || 'Sélection personnalisée';
};

const describeCartItem = (item) => {
  const meta = item.meta || {};
  const parts = [];
  if (meta.weekLabel) parts.push(meta.weekLabel);
  if (meta.locationLabel) parts.push(meta.locationLabel);
  if (Array.isArray(meta.extras) && meta.extras.length) {
    parts.push(meta.extras.map((extra) => extra.label).join(', '));
  }
  return parts.length ? parts.join(' • ') : item.date;
};

const resolveScrollTarget = (hash) => {
  if (!hash || hash === '#') return null;
  try {
    const target = document.querySelector(hash);
    if (!target) return null;
    if (target.classList.contains('anchor-target')) {
      let sibling = target.nextElementSibling;
      while (sibling && sibling.classList.contains('anchor-target')) {
        sibling = sibling.nextElementSibling;
      }
      if (sibling instanceof HTMLElement) return sibling;
      if (target.parentElement instanceof HTMLElement) return target.parentElement;
    }
    return target;
  } catch (error) {
    console.warn('Ancre introuvable :', hash, error);
    return null;
  }
};

const getScrollOffset = (target) => {
  const header = document.querySelector('.navbar');
  if (!header) return 0;
  const headerHeight = header.offsetHeight;
  if (!target) return headerHeight;

  let adjustment = 0;
  try {
    const computed = window.getComputedStyle(target);
    const scrollMarginTop = parseFloat(computed.scrollMarginTop || '0');
    if (Number.isFinite(scrollMarginTop) && scrollMarginTop > 0) {
      adjustment = Math.min(scrollMarginTop * 0.5, 36);
    }
  } catch (error) {
    adjustment = 0;
  }

  return Math.max(0, headerHeight - adjustment + 12);
};

const scrollToTarget = (target) => {
  if (!(target instanceof HTMLElement)) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const offset = getScrollOffset(target);
  const top = Math.max(0, window.pageYOffset + target.getBoundingClientRect().top - offset);
  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
};

const initNavigation = () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('site-nav');
  const body = document.body;
  if (!navToggle || !navLinks) return;

  const toggleMenu = (open) => {
    const shouldOpen = open ?? !navToggle.classList.contains('is-open');
    navToggle.classList.toggle('is-open', shouldOpen);
    navToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', shouldOpen ? 'Fermer le menu' : 'Afficher le menu');
    navLinks.classList.toggle('open', shouldOpen);
    navLinks.classList.toggle('is-open', shouldOpen);
    body.classList.toggle('menu-open', shouldOpen);
  };

  navToggle.addEventListener('click', () => toggleMenu());
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => toggleMenu(false))
  );
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) toggleMenu(false);
  });
};

const initHero = () => {
  const heroActions = document.querySelector('.hero__actions');
  if (!heroActions) return;

  const buttons = Array.from(heroActions.querySelectorAll('a'));
  const seen = new Set();

  buttons.forEach((button) => {
    const href = button.getAttribute('href') || '';
    const label = button.textContent.trim();
    const key = `${href}::${label}`.toLowerCase();

    if (seen.has(key)) {
      button.remove();
      return;
    }

    seen.add(key);
  });

  const remaining = Array.from(heroActions.querySelectorAll('a'));
  remaining.slice(2).forEach((button) => button.remove());
};

const initSmoothScroll = () => {
  const links = Array.from(document.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  const isSamePageLink = (link) => {
    const linkPath = link.pathname?.replace(/^\//, '') ?? '';
    const currentPath = window.location.pathname.replace(/^\//, '');
    const samePath = linkPath === currentPath || linkPath === '';
    const sameHost = !link.hostname || link.hostname === window.location.hostname;
    return samePath && sameHost;
  };

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    link.addEventListener('click', (event) => {
      if (!isSamePageLink(link)) return;
      const target = resolveScrollTarget(href);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);

      if (history.replaceState) {
        history.replaceState(null, '', href);
      } else {
        window.location.hash = href;
      }
    });
  });
};

const initStickyHeader = () => {
  const header = document.querySelector('.navbar');
  if (!header) return;
  const threshold = 40;
  let lastState = null;

  const update = () => {
    const shouldStick = window.scrollY > threshold;
    if (shouldStick !== lastState) {
      header.classList.toggle('is-sticky', shouldStick);
      lastState = shouldStick;
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
};

const initScrollSpy = () => {
  if (!('IntersectionObserver' in window)) return;
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  const seenTargets = new Set();
  const sections = links
    .map((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return null;
      const target = resolveScrollTarget(href);
      if (!target) return null;
      return { id: href, link, target };
    })
    .filter(Boolean)
    .filter((section) => {
      if (seenTargets.has(section.target)) return false;
      seenTargets.add(section.target);
      return true;
    });

  if (!sections.length) return;

  let activeId = null;

  const setActive = (id) => {
    if (activeId === id) return;
    activeId = id;
    sections.forEach((section) => {
      const isActive = section.id === id;
      section.link.classList.toggle('is-active', isActive);
      if (isActive) {
        section.link.setAttribute('aria-current', 'true');
      } else {
        section.link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        const match = sections.find((section) => section.target === visible[0].target);
        if (match) setActive(match.id);
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0.25, 0.5, 0.75] }
  );

  sections.forEach((section) => observer.observe(section.target));

  const handleScroll = () => {
    const fallback = sections.find((section) => {
      const rect = section.target.getBoundingClientRect();
      const midpoint = window.innerHeight * 0.35;
      return rect.top <= midpoint && rect.bottom >= midpoint;
    });
    if (fallback) setActive(fallback.id);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
};

const initFAQ = () => {
  const items = Array.from(document.querySelectorAll('.faq-item'));
  if (!items.length) return;

  const entries = items
    .map((item, index) => {
      const button = item.querySelector('.faq-question');
      const panel = item.querySelector('.faq-answer');
      if (!button || !panel) return null;

      if (!panel.id) {
        panel.id = `faq-panel-${index + 1}`;
      }
      if (!button.getAttribute('aria-controls')) {
        button.setAttribute('aria-controls', panel.id);
      }
      if (!button.id) {
        button.id = `faq-question-${index + 1}`;
      }
      if (!panel.getAttribute('role')) {
        panel.setAttribute('role', 'region');
      }
      panel.setAttribute('aria-labelledby', button.id);

      const expanded = item.classList.contains('is-open') || item.classList.contains('active');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      item.classList.toggle('is-open', expanded);
      item.classList.toggle('active', expanded);
      panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      panel.style.maxHeight = expanded ? `${panel.scrollHeight}px` : '0px';

      const entry = { item, button, panel };

      entry.toggle = (open) => {
        const shouldOpen = Boolean(open);
        button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        item.classList.toggle('is-open', shouldOpen);
        item.classList.toggle('active', shouldOpen);
        panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
        if (shouldOpen) {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        } else {
          const currentHeight = panel.scrollHeight;
          panel.style.maxHeight = `${currentHeight}px`;
          requestAnimationFrame(() => {
            panel.style.maxHeight = '0px';
          });
        }
      };

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const shouldOpen = !isExpanded;
        const enforceSingle = window.matchMedia('(max-width: 767px)').matches;
        if (shouldOpen && enforceSingle) {
          entries.forEach((other) => {
            if (other && other !== entry) other.toggle(false);
          });
        }
        entry.toggle(shouldOpen);
      });

      return entry;
    })
    .filter(Boolean);

  if (!entries.length) return;

  const updateOpenHeights = () => {
    const enforceSingle = window.matchMedia('(max-width: 767px)').matches;
    let firstHandled = false;

    entries.forEach((entry) => {
      const isOpen = entry.item.classList.contains('is-open');
      if (enforceSingle && isOpen) {
        if (firstHandled) {
          entry.toggle(false);
          return;
        }
        firstHandled = true;
      }

      if (entry.item.classList.contains('is-open')) {
        entry.panel.style.maxHeight = `${entry.panel.scrollHeight}px`;
      }
    });
  };

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateOpenHeights, 180);
  });

  updateOpenHeights();
};

const initContactPopup = () => {
  const popup = document.getElementById('contact-popup');
  if (!popup) return;
  const triggers = document.querySelectorAll('[data-popup="contact-popup"]');
  const closeButton = popup.querySelector('.close-btn');
  const form = popup.querySelector('#contactForm');

  const open = () => popup.classList.add('is-visible');
  const close = () => popup.classList.remove('is-visible');

  triggers.forEach((trigger) => trigger.addEventListener('click', open));
  closeButton?.addEventListener('click', close);
  popup.addEventListener('click', (event) => {
    if (event.target === popup) close();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    close();
    alert('Message envoyé avec succès !');
  });
};

const initReservationModal = () => {
  const modal = document.getElementById('reservation-modal');
  if (!modal) return;
  const openers = document.querySelectorAll('[data-modal-open="reservation-modal"]');
  const closers = modal.querySelectorAll('[data-modal-close]');
  let previouslyFocused = null;

  const setState = (open) => {
    modal.dataset.modalState = open ? 'open' : 'closed';
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    modal.classList.toggle('is-visible', open);
    document.body.classList.toggle('modal-open', open);
  };

  setState(false);

  const getFocusable = () =>
    Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

  const focusFirst = () => {
    const focusable = getFocusable();
    focusable[0]?.focus({ preventScroll: true });
  };

  const openModal = () => {
    if (modal.dataset.modalState === 'open') return;
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setState(true);
    focusFirst();
  };

  const closeModal = (skipHistory = false) => {
    if (modal.dataset.modalState !== 'open') return;
    setState(false);
    if (!skipHistory && window.location.hash === '#reservation-modal') {
      history.replaceState(null, '', '#inscription-stage');
    }
    previouslyFocused?.focus({ preventScroll: true });
  };

  openers.forEach((opener) => opener.addEventListener('click', openModal));
  closers.forEach((closer) => closer.addEventListener('click', closeModal));

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.dataset.modalState === 'open') {
      closeModal();
    }
  });

  const syncWithHash = () => {
    if (window.location.hash === '#reservation-modal') {
      openModal();
    } else if (modal.dataset.modalState === 'open') {
      closeModal(true);
    }
  };

  window.addEventListener('hashchange', syncWithHash);
  syncWithHash();
};

const initSlider = () => {
  const root = document.querySelector('.slider');
  if (!root) return;

  const track = root.querySelector('.track');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const prev = root.querySelector('.prev');
  const next = root.querySelector('.next');
  const dotsWrap = root.querySelector('.dots');
  if (!track || !slides.length || !prev || !next || !dotsWrap) return;

  let index = 0;
  let startX = 0;
  let dx = 0;
  const width = () => root.clientWidth;

  const updateDots = () => {
    dotsWrap.querySelectorAll('button').forEach((button, i) =>
      button.classList.toggle('is-active', i === index)
    );
  };

  const go = (i, animate = true) => {
    index = Math.max(0, Math.min(i, slides.length - 1));
    track.style.transition = animate ? 'transform .35s ease' : 'none';
    track.style.transform = `translateX(${-index * width()}px)`;
    updateDots();
  };

  slides.forEach((_, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => go(i));
    dotsWrap.appendChild(button);
  });

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));

  track.addEventListener(
    'touchstart',
    (event) => {
      startX = event.touches[0].clientX;
      dx = 0;
      track.style.transition = 'none';
    },
    { passive: true }
  );

  track.addEventListener(
    'touchmove',
    (event) => {
      dx = event.touches[0].clientX - startX;
      track.style.transform = `translateX(${ -index * width() + dx }px)`;
    },
    { passive: true }
  );

  track.addEventListener('touchend', () => {
    const threshold = width() * 0.2;
    if (dx > threshold) go(index - 1);
    else if (dx < -threshold) go(index + 1);
    else go(index);
  });

  window.addEventListener('resize', () => go(index, false));

  let timer = setInterval(() => go((index + 1) % slides.length), 4000);
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener(
    'mouseleave',
    () => (timer = setInterval(() => go((index + 1) % slides.length), 4000))
  );

  go(0);
};

const initAOS = () => {
  if (window.AOS) {
    window.AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
      offset: 120,
    });
  }
};

const initStages = () => {
  const stageSection = document.getElementById('stage-jeunes');
  if (!stageSection) return;

  const list = stageSection.querySelector('[data-catalog-list]');
  const catalogEmpty = stageSection.querySelector('[data-catalog-empty]');
  const typeControls = stageSection.querySelector('[data-type-controls]');
  const locationControls = stageSection.querySelector('[data-location-controls]');
  const extrasNote = stageSection.querySelector('[data-extras-note]');
  const extrasContainer = stageSection.querySelector('[data-extras-list]');
  const calendarGrid = stageSection.querySelector('[data-week-grid]');
  const cartPanel = document.getElementById('stage-cart');
  const cartItems = cartPanel?.querySelector('.cart__items');
  const cartEmptyNotice = cartPanel?.querySelector('[data-cart-empty]');
  const totalNode = cartPanel?.querySelector('[data-cart-total]');
  const announcement = cartPanel?.querySelector('.cart__announcement');
  const drawerToggle = stageSection.querySelector('.stages__drawer-toggle');
  const backdrop = stageSection.querySelector('[data-drawer-backdrop]');
  const clearButtons = stageSection.querySelectorAll('[data-cart-clear]');
  const form = document.getElementById('stage-registration');
  const summaryField = document.getElementById('cart-summary');
  const payloadField = document.getElementById('cart-payload');
  const paymentButton = cartPanel?.querySelector('.cart__payment');
  if (!list || !cartPanel || !cartItems || !cartEmptyNotice || !totalNode || !announcement) return;

  const uiState = {
    type: 'stage',
    location: getDefaultLocation('stage'),
    selectedWeek: null,
    extras: new Set(),
    cardSelections: new Map(),
  };

  let lastItems = new Map();

  const closeDrawer = () => {
    cartPanel.classList.remove('is-open');
    drawerToggle?.setAttribute('aria-expanded', 'false');
    backdrop?.classList.remove('is-active');
    document.body.classList.remove('cart-drawer-open');
  };

  const openDrawer = () => {
    cartPanel.classList.add('is-open');
    drawerToggle?.setAttribute('aria-expanded', 'true');
    backdrop?.classList.add('is-active');
    document.body.classList.add('cart-drawer-open');
  };

  drawerToggle?.addEventListener('click', () => {
    if (cartPanel.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  backdrop?.addEventListener('click', closeDrawer);
  cartPanel.querySelector('.cart__close')?.addEventListener('click', closeDrawer);
  cartPanel.querySelector('.cart__checkout')?.addEventListener('click', () => {
    if (cartPanel.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && cartPanel.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  const sanitizeState = () => {
    if (!hasFormulasFor(uiState.type, uiState.location)) {
      uiState.location = getDefaultLocation(uiState.type);
    }
    sanitizeExtras(uiState);
    ensureSelectedWeek(uiState);
    sanitizeCardSelections(uiState);
  };

  const renderTypeControls = () => {
    if (!typeControls) return;
    typeControls.querySelectorAll('[data-type-option]').forEach((button) => {
      const option = button.dataset.typeOption;
      const isActive = option === uiState.type;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderLocationControls = () => {
    if (!locationControls) return;
    locationControls.querySelectorAll('[data-location-option]').forEach((button) => {
      const option = button.dataset.locationOption;
      const available = option ? hasFormulasFor(uiState.type, option) : false;
      const isActive = option === uiState.location;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.disabled = !available;
      button.setAttribute('aria-disabled', available ? 'false' : 'true');
    });
  };

  const renderExtras = () => {
    if (!extrasContainer || !extrasNote) return;
    const availableExtras = computeAvailableExtras(uiState);
    extrasContainer.innerHTML = '';
    if (!availableExtras.length) {
      extrasNote.textContent =
        'Les leçons individuelles se réservent sans option supplémentaire. Tout se fait sur place.';
      return;
    }
    extrasNote.textContent = 'Sélectionnez vos options pour personnaliser l’expérience de stage.';
    availableExtras.forEach((extra) => {
      const isMandatory = Boolean(extra.mandatory);
      if (isMandatory) uiState.extras.add(extra.id);
      const isChecked = uiState.extras.has(extra.id);
      const wrapper = document.createElement('label');
      wrapper.className = 'reservation-extras__option';
      wrapper.innerHTML = `
        <input type="checkbox" value="${extra.id}" data-extra-option="${extra.id}" ${
        isChecked ? 'checked' : ''
      } ${isMandatory ? 'disabled' : ''} />
        <span>
          <strong>${extra.label}</strong>
          ${extra.description ? `<small>${extra.description}</small>` : ''}
        </span>
        <span class="reservation-extras__price">${formatCurrency(extra.price)}</span>
      `;
      extrasContainer.appendChild(wrapper);
    });
  };

  const renderCalendar = () => {
    if (!calendarGrid) return;
    const weeks = getWeeksForSelection(uiState.type, uiState.location);
    calendarGrid.innerHTML = '';
    if (!weeks.length) {
      const empty = document.createElement('p');
      empty.className = 'reservation-calendar__empty';
      empty.textContent = 'Aucune semaine planifiée pour ce programme.';
      calendarGrid.appendChild(empty);
      return;
    }
    weeks.forEach((week) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reservation-calendar__week';
      if (week.status === 'low') button.classList.add('is-low');
      if (week.status === 'full') button.classList.add('is-full');
      const isActive = week.id === uiState.selectedWeek;
      button.classList.toggle('is-active', isActive);
      button.dataset.weekId = week.id;
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.disabled = week.status === 'full';
      button.innerHTML = `
        <span class="reservation-calendar__week-label">${week.shortLabel}</span>
        <span class="reservation-calendar__week-status">${
          week.status === 'full' ? 'Complet' : `${week.spots} places`
        }</span>
      `;
      calendarGrid.appendChild(button);
    });
  };

  const getActiveExtras = () => {
    const availableExtras = computeAvailableExtras(uiState);
    return availableExtras.filter((extra) => uiState.extras.has(extra.id));
  };

  const renderStageButtons = (cartState) => {
    const keys = new Set(cartState.items.map((item) => item.meta?.key));
    list.querySelectorAll('.formula-card').forEach((card) => {
      const button = card.querySelector('.formula-card__cta');
      if (!button) return;
      const metaKey = card.dataset.metaKey;
      const isAdded = metaKey ? keys.has(metaKey) : false;
      button.classList.toggle('is-added', isAdded);
      button.textContent = isAdded ? 'Ajouté' : 'Ajouter au panier';
      button.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
    });
  };

  const renderCatalog = (cartState) => {
    list.innerHTML = '';
    const formulas = FORMULAS.filter(
      (formula) => formula.type === uiState.type && formula.availability?.[uiState.location]
    );
    if (!formulas.length) {
      if (catalogEmpty) catalogEmpty.hidden = false;
      return;
    }
    if (catalogEmpty) catalogEmpty.hidden = true;

    const cartKeys = new Set(cartState.items.map((item) => item.meta?.key));
    const keepIds = [];

    formulas.forEach((formula) => {
      const availability = formula.availability[uiState.location];
      const weeksAll = getWeeksForSelection(uiState.type, uiState.location).filter((week) =>
        availability.weeks.includes(week.id)
      );
      const selectableWeeks = weeksAll.filter((week) => week.status !== 'full');
      let selectedWeekId = uiState.cardSelections.get(formula.id) || null;
      if (!selectableWeeks.some((week) => week.id === selectedWeekId)) {
        if (uiState.selectedWeek && selectableWeeks.some((week) => week.id === uiState.selectedWeek)) {
          selectedWeekId = uiState.selectedWeek;
        } else {
          selectedWeekId = selectableWeeks[0]?.id ?? null;
        }
      }
      if (selectedWeekId) {
        uiState.cardSelections.set(formula.id, selectedWeekId);
      }
      keepIds.push(formula.id);

      const extrasList = getActiveExtras();
      const extrasIds = extrasList.map((extra) => extra.id).sort();
      const extrasTotal = extrasList.reduce((acc, extra) => acc + extra.price, 0);
      const totalPrice = formula.price + extrasTotal;
      const weekMeta = selectedWeekId ? findWeek(uiState.type, uiState.location, selectedWeekId) : null;
      const locationLabel = getLocationLabel(uiState.location);
      const metaKey = composeMetaKey(formula.id, uiState.type, uiState.location, selectedWeekId, extrasIds);
      const extrasLabel = extrasList.length
        ? extrasList.map((extra) => extra.label).join(', ')
        : 'Aucune option sélectionnée';

      const card = document.createElement('article');
      card.className = 'formula-card';
      card.classList.add(`formula-card--${formula.id}`);
      card.setAttribute('role', 'listitem');
      card.dataset.formulaId = formula.id;
      card.dataset.metaKey = metaKey;
      card.dataset.totalPrice = String(totalPrice);
      card.dataset.weekId = selectedWeekId || '';
      card.dataset.location = uiState.location;

      const badgesHtml = formula.badges?.length
        ? `<ul class="formula-card__badges">${formula.badges.map((badge) => `<li>${badge}</li>`).join('')}</ul>`
        : '';

      const weeksHtml = weeksAll
        .map((week) => {
          const isActive = week.id === selectedWeekId;
          const disabled = week.status === 'full';
          const statusClass = week.status === 'low' ? ' is-low' : disabled ? ' is-full' : '';
          const spotsLabel = week.status === 'full' ? 'Complet' : `${week.spots} places`;
          return `
            <button type="button" class="formula-card__week${statusClass}${
              isActive ? ' is-active' : ''
            }" data-week-option="${week.id}" ${disabled ? 'disabled' : ''} aria-pressed="${isActive}">
              <span>${week.shortLabel}</span>
              <small>${spotsLabel}</small>
            </button>
          `;
        })
        .join('');

      card.innerHTML = `
        <div class="formula-card__media" aria-hidden="true"></div>
        <header class="formula-card__header">
          <div>
            <p class="formula-card__eyebrow">${getTypeLabel(formula.type)} • ${locationLabel}</p>
            <h3 class="formula-card__title">${formula.title}</h3>
            <p class="formula-card__tagline">${formula.tagline}</p>
          </div>
          <div class="formula-card__pricing">
            <span class="formula-card__base">À partir de ${formatCurrency(formula.price)}</span>
            <span class="formula-card__total">Avec options : ${formatCurrency(totalPrice)}</span>
            <span class="formula-card__note">Prix sans hébergement</span>
          </div>
        </header>
        ${badgesHtml}
        <p class="formula-card__availability">${availability.spotsLabel}</p>
        <div class="formula-card__weeks" role="group" aria-label="Semaines disponibles">
          ${
            weeksHtml ||
            '<p class="formula-card__empty">Toutes les semaines sont complètes pour ce lieu.</p>'
          }
        </div>
        <ul class="formula-card__features">${formula.features
          .map((feature) => `<li>${feature}</li>`)
          .join('')}</ul>
        <p class="formula-card__extras" data-formula-extras>${extrasLabel}</p>
        <div class="formula-card__cta-wrapper">
          <button type="button" class="btn btn-gold formula-card__cta" ${
            selectedWeekId ? '' : 'disabled'
          } aria-pressed="false">Ajouter au panier</button>
          <span class="formula-card__feedback" aria-live="polite"></span>
        </div>
      `;

      list.appendChild(card);

      const button = card.querySelector('.formula-card__cta');
      if (button) {
        const isAdded = cartKeys.has(metaKey);
        button.classList.toggle('is-added', isAdded);
        button.textContent = isAdded ? 'Ajouté' : 'Ajouter au panier';
        button.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
      }
    });

    uiState.cardSelections.forEach((_, key) => {
      if (!keepIds.includes(key)) uiState.cardSelections.delete(key);
    });
  };

  const renderAll = (cartState = cart.getState()) => {
    sanitizeState();
    renderTypeControls();
    renderLocationControls();
    renderExtras();
    renderCalendar();
    renderCatalog(cartState);
  };

  const updateFormFields = (cartState) => {
    if (summaryField) {
      if (cartState.items.length) {
        const lines = cartState.items.map(
          (item) => `${item.title} — ${describeCartItem(item)} x${item.quantity} : ${formatCurrency(item.price * item.quantity)}`
        );
        summaryField.value = lines.join('\n');
      } else {
        summaryField.value = '';
      }
    }
    if (payloadField) {
      payloadField.value = JSON.stringify(cartState);
    }
    if (form) {
      const submit = form.querySelector('button[type="submit"]');
      if (submit) {
        const disabled = cartState.items.length === 0;
        submit.disabled = disabled;
        submit.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      }
    }
  };

  const renderCart = (cartState, detail) => {
    announcement.textContent = '';
    cartItems.innerHTML = '';
    if (!cartState.items.length) {
      cartEmptyNotice.hidden = false;
      totalNode.textContent = formatCurrency(0);
    } else {
      cartEmptyNotice.hidden = true;
      cartState.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'cart__item';
        li.dataset.itemUid = item.uid;
        li.innerHTML = `
          <div class="cart__item-info">
            <p class="cart__item-title">${item.title}</p>
            <p class="cart__item-meta">${describeCartItem(item)}</p>
            <div class="cart__item-actions">
              <button type="button" class="cart__qty-btn" data-action="decrement" aria-label="Retirer une place pour ${describeCartItem(item)}">−</button>
              <input type="number" class="cart__qty-input" min="1" value="${item.quantity}" aria-label="Quantité pour ${describeCartItem(item)}" />
              <button type="button" class="cart__qty-btn" data-action="increment" aria-label="Ajouter une place pour ${describeCartItem(item)}">+</button>
            </div>
          </div>
          <div class="cart__item-price">
            <span>${formatCurrency(item.price * item.quantity)}</span>
            <button type="button" class="cart__remove" data-action="remove" aria-label="Retirer ${item.title} du panier"></button>
          </div>
        `;
        cartItems.appendChild(li);
      });
      const total = cartState.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      totalNode.textContent = formatCurrency(total);
    }

    const isEmpty = cartState.items.length === 0;
    clearButtons.forEach((button) => {
      button.disabled = isEmpty;
      button.setAttribute('aria-disabled', isEmpty ? 'true' : 'false');
    });
    if (paymentButton) {
      paymentButton.classList.toggle('is-disabled', isEmpty);
      paymentButton.setAttribute('aria-disabled', isEmpty ? 'true' : 'false');
      paymentButton.tabIndex = isEmpty ? -1 : 0;
    }

    if (drawerToggle) {
      const totalQty = cartState.items.reduce((acc, item) => acc + item.quantity, 0);
      const label = totalQty > 0 ? `Voir mon panier (${totalQty})` : 'Voir mon panier';
      drawerToggle.textContent = label;
      drawerToggle.setAttribute('aria-label', label);
      drawerToggle.disabled = cartState.items.length === 0;
    }

    renderStageButtons(cartState);
    updateFormFields(cartState);

    let message = '';
    if (detail?.type === 'add' && detail.uid) {
      const item = cartState.items.find((entry) => entry.uid === detail.uid);
      if (item) message = `${item.title} (${describeCartItem(item)}) ajouté au panier.`;
    } else if (detail?.type === 'remove' && detail.uid) {
      const previous = lastItems.get(detail.uid);
      if (previous) message = `${previous.title} (${describeCartItem(previous)}) retiré du panier.`;
    } else if (detail?.type === 'clear') {
      message = 'Panier vidé.';
    }
    if (message) {
      announcement.textContent = message;
    }

    lastItems = new Map(cartState.items.map((item) => [item.uid, item]));
  };

  cartItems.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const actionButton = target?.closest('[data-action]');
    if (!actionButton) return;
    const item = actionButton.closest('.cart__item');
    if (!item) return;
    const { itemUid } = item.dataset;
    const action = actionButton.dataset.action;
    if (action === 'increment') {
      const current = cart.getState().items.find((entry) => entry.uid === itemUid);
      if (current) cart.updateQuantity(itemUid, current.quantity + 1);
    } else if (action === 'decrement') {
      cart.decrement(itemUid);
    } else if (action === 'remove') {
      cart.removeItem(itemUid);
    }
  });

  cartItems.addEventListener('change', (event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target || !target.classList.contains('cart__qty-input')) return;
    const item = target.closest('.cart__item');
    if (!item) return;
    cart.updateQuantity(item.dataset.itemUid, target.value);
  });

  typeControls?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('[data-type-option]');
    if (!button) return;
    const option = button.dataset.typeOption;
    if (!option || option === uiState.type) return;
    uiState.type = option;
    uiState.cardSelections.clear();
    uiState.selectedWeek = null;
    renderAll(cart.getState());
  });

  locationControls?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('[data-location-option]');
    if (!button) return;
    const option = button.dataset.locationOption;
    if (!option || option === uiState.location || !hasFormulasFor(uiState.type, option)) return;
    uiState.location = option;
    uiState.cardSelections.clear();
    uiState.selectedWeek = null;
    renderAll(cart.getState());
  });

  extrasContainer?.addEventListener('change', (event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target || target.type !== 'checkbox') return;
    const option = target.dataset.extraOption;
    if (!option) return;
    if (target.checked) {
      uiState.extras.add(option);
    } else {
      uiState.extras.delete(option);
    }
    renderAll(cart.getState());
  });

  calendarGrid?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('[data-week-id]');
    if (!button || button.disabled) return;
    const weekId = button.dataset.weekId;
    if (!weekId) return;
    uiState.selectedWeek = weekId;
    renderAll(cart.getState());
  });

  list.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const weekButton = target.closest('[data-week-option]');
    if (weekButton) {
      const card = weekButton.closest('.formula-card');
      if (!card) return;
      const { formulaId } = card.dataset;
      const weekId = weekButton.dataset.weekOption;
      if (!formulaId || !weekId) return;
      uiState.cardSelections.set(formulaId, weekId);
      uiState.selectedWeek = weekId;
      renderAll(cart.getState());
      return;
    }
    const addButton = target.closest('.formula-card__cta');
    if (!addButton || addButton.disabled) return;
    const card = addButton.closest('.formula-card');
    if (!card) return;
    const { formulaId } = card.dataset;
    const formula = FORMULAS.find((entry) => entry.id === formulaId);
    if (!formula) return;
    const weekId = uiState.cardSelections.get(formulaId) || null;
    const extrasList = getActiveExtras();
    const extrasIds = extrasList.map((extra) => extra.id).sort();
    const extrasTotal = extrasList.reduce((acc, extra) => acc + extra.price, 0);
    const totalPrice = formula.price + extrasTotal;
    const week = weekId ? findWeek(uiState.type, uiState.location, weekId) : null;
    const locationLabel = getLocationLabel(uiState.location);
    const metaKey = composeMetaKey(formula.id, uiState.type, uiState.location, weekId, extrasIds);
    const meta = {
      key: metaKey,
      type: uiState.type,
      typeLabel: getTypeLabel(uiState.type),
      location: uiState.location,
      locationLabel,
      weekId: weekId || '',
      weekLabel: week?.label || 'Semaine à préciser',
      extras: extrasList.map((extra) => ({ id: extra.id, label: extra.label, price: extra.price })),
      extrasTotal,
      basePrice: formula.price,
    };
    const dateLabel = buildDateLabel({ weekLabel: meta.weekLabel, locationLabel, extras: meta.extras });
    card.dataset.metaKey = metaKey;
    card.dataset.totalPrice = String(totalPrice);
    cart.addItem({ id: formula.id, title: formula.title, price: totalPrice, date: dateLabel, meta });
    const feedback = card.querySelector('.formula-card__feedback');
    if (feedback) {
      feedback.textContent = 'Ajouté au panier';
      window.setTimeout(() => {
        feedback.textContent = '';
      }, 2000);
    }
    if (window.innerWidth < 1200) {
      openDrawer();
    }
  });

  clearButtons.forEach((button) =>
    button.addEventListener('click', () => {
      cart.clear();
      if (cartPanel.classList.contains('is-open')) {
        closeDrawer();
      }
    })
  );

  renderAll(cart.getState());
  cart.subscribe(renderCart);

  if (form) {
    const serviceId = form.dataset.emailjsService;
    const templateId = form.dataset.emailjsTemplate;
    const publicKey = form.dataset.emailjsPublicKey;
    const statusNode = form.querySelector('.stages-form__status');

    if (window.emailjs && publicKey) {
      window.emailjs.init(publicKey);
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const fallbackMessage = 'Votre demande a été enregistrée (mode test).';

      const handleSuccess = () => {
        if (statusNode) {
          statusNode.textContent = 'Merci ! Nous vous recontactons très vite.';
        }
        cart.clear();
        form.reset();
      };

      const handleError = () => {
        if (statusNode) {
          statusNode.textContent = "Une erreur est survenue. Merci de réessayer ou de nous contacter directement.";
        }
      };

      if (submit) submit.disabled = true;
      if (statusNode) statusNode.textContent = 'Envoi en cours…';

      if (window.emailjs && serviceId && templateId) {
        window.emailjs
          .send(serviceId, templateId, payload)
          .then(handleSuccess)
          .catch(handleError)
          .finally(() => {
            if (submit) submit.disabled = false;
          });
      } else {
        console.warn('EmailJS non configuré. Payload :', payload);
        if (statusNode) statusNode.textContent = fallbackMessage;
        if (submit) submit.disabled = false;
      }
    });
  }
};

const bootstrap = () => {
  initHero();
  initNavigation();
  initSmoothScroll();
  initStickyHeader();
  initScrollSpy();
  initFAQ();
  initContactPopup();
  initReservationModal();
  initSlider();
  initStages();
  initAOS();
};

document.addEventListener('DOMContentLoaded', bootstrap);
