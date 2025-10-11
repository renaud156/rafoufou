import cart from './cart.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const initNavigation = () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('site-nav');
  const body = document.body;
  if (!navToggle || !navLinks) return;

  const toggleMenu = (open) => {
    const shouldOpen = open ?? !navToggle.classList.contains('is-open');
    navToggle.classList.toggle('is-open', shouldOpen);
    navToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    navLinks.classList.toggle('open', shouldOpen);
    body.classList.toggle('menu-open', shouldOpen);
  };

  navToggle.addEventListener('click', () => toggleMenu());
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => toggleMenu(false))
  );
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) toggleMenu(false);
  });
};

const initFAQ = () => {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = item.classList.toggle('active');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });
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

  const list = stageSection.querySelector('.stages__list');
  const cartPanel = document.getElementById('stage-cart');
  const cartItems = cartPanel?.querySelector('.cart__items');
  const emptyNotice = cartPanel?.querySelector('[data-cart-empty]');
  const totalNode = cartPanel?.querySelector('[data-cart-total]');
  const announcement = cartPanel?.querySelector('.cart__announcement');
  const drawerToggle = stageSection.querySelector('.stages__drawer-toggle');
  const backdrop = stageSection.querySelector('[data-drawer-backdrop]');
  const clearButtons = stageSection.querySelectorAll('[data-cart-clear]');
  const form = document.getElementById('stage-registration');
  const summaryField = document.getElementById('cart-summary');
  const payloadField = document.getElementById('cart-payload');
  if (!list || !cartPanel || !cartItems || !emptyNotice || !totalNode || !announcement) return;

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

  const renderStageButtons = (state) => {
    const addedStages = new Set(state.items.map((item) => item.id));
    list.querySelectorAll('.stage-card').forEach((card) => {
      const button = card.querySelector('.stage-card__cta');
      const isAdded = addedStages.has(card.dataset.stageId);
      if (button) {
        button.classList.toggle('is-added', isAdded);
        button.textContent = isAdded ? 'Ajouté au panier' : 'Ajouter';
        button.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
      }
    });
  };

  const updateFormFields = (state) => {
    if (summaryField) {
      if (state.items.length) {
        const lines = state.items.map(
          (item) => `${item.title} — ${item.date} x${item.quantity} : ${formatCurrency(item.price * item.quantity)}`
        );
        summaryField.value = lines.join('\n');
      } else {
        summaryField.value = '';
      }
    }
    if (payloadField) {
      payloadField.value = JSON.stringify(state);
    }
    if (form) {
      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = state.items.length === 0;
    }
  };

  const renderCart = (state, detail) => {
    announcement.textContent = '';
    cartItems.innerHTML = '';
    if (!state.items.length) {
      emptyNotice.hidden = false;
      totalNode.textContent = formatCurrency(0);
    } else {
      emptyNotice.hidden = true;
      state.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'cart__item';
        li.dataset.itemUid = item.uid;
        li.innerHTML = `
          <div class="cart__item-info">
            <p class="cart__item-title">${item.title}</p>
            <p class="cart__item-meta">${item.date}</p>
            <div class="cart__item-actions">
              <button type="button" class="cart__qty-btn" data-action="decrement" aria-label="Retirer une place pour ${item.title} - ${item.date}">−</button>
              <input type="number" class="cart__qty-input" min="1" value="${item.quantity}" aria-label="Quantité pour ${item.title} - ${item.date}" />
              <button type="button" class="cart__qty-btn" data-action="increment" aria-label="Ajouter une place pour ${item.title} - ${item.date}">+</button>
            </div>
          </div>
          <div class="cart__item-price">
            <span>${formatCurrency(item.price * item.quantity)}</span>
            <button type="button" class="cart__remove" data-action="remove" aria-label="Retirer ${item.title} - ${item.date} du panier"></button>
          </div>
        `;
        cartItems.appendChild(li);
      });
      const total = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      totalNode.textContent = formatCurrency(total);
    }

    clearButtons.forEach((button) => (button.disabled = state.items.length === 0));

    if (drawerToggle) {
      const totalQty = state.items.reduce((acc, item) => acc + item.quantity, 0);
      const label = totalQty > 0 ? `Voir mon panier (${totalQty})` : 'Voir mon panier';
      drawerToggle.textContent = label;
      drawerToggle.setAttribute('aria-label', label);
      drawerToggle.disabled = state.items.length === 0;
    }

    renderStageButtons(state);
    updateFormFields(state);

    let message = '';
    if (detail?.type === 'add' && detail.uid) {
      const item = state.items.find((entry) => entry.uid === detail.uid);
      if (item) message = `${item.title} (${item.date}) ajouté au panier.`;
    } else if (detail?.type === 'remove' && detail.uid) {
      const previous = lastItems.get(detail.uid);
      if (previous) message = `${previous.title} (${previous.date}) retiré du panier.`;
    } else if (detail?.type === 'clear') {
      message = 'Panier vidé.';
    }
    if (message) {
      announcement.textContent = message;
    }

    lastItems = new Map(state.items.map((item) => [item.uid, item]));
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

  list.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('.stage-card__cta');
    if (!button) return;
    const card = button.closest('.stage-card');
    if (!card) return;
    const select = card.querySelector('.stage-card__date');
    const feedback = card.querySelector('.stage-card__feedback');
    const id = card.dataset.stageId;
    const title = card.dataset.stageTitle;
    const price = Number(card.dataset.stagePrice);
    const date = select?.value;
    if (!id || !title || !date || Number.isNaN(price)) return;

    cart.addItem({ id, title, price, date });
    if (feedback) {
      feedback.textContent = 'Ajouté au panier';
      setTimeout(() => {
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
  initNavigation();
  initFAQ();
  initContactPopup();
  initSlider();
  initStages();
  initAOS();
};

document.addEventListener('DOMContentLoaded', bootstrap);
