(() => {
  const navToggle = document.querySelector(".premium-nav__toggle");
  const navLinks = document.querySelector(".premium-nav__links");
  const nav = document.querySelector(".premium-nav");

  if (navToggle && navLinks && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen.toString());
      nav.classList.toggle("is-open", isOpen);
    });

    navLinks.querySelectorAll("a, button").forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link instanceof HTMLAnchorElement ? link.getAttribute("href") : null;
        if (targetId && targetId.startsWith("#")) {
          const target = document.querySelector(targetId);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
        navLinks.classList.remove("is-open");
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const modalTriggers = document.querySelectorAll("[data-modal-open]");
  const modals = document.querySelectorAll("[data-modal]");

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-modal-open");
  };

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal-open");
    const firstField = modal.querySelector(
      'input, select, textarea, button:not([data-modal-close]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (firstField instanceof HTMLElement) {
      firstField.focus({ preventScroll: true });
    }
  };

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const target = trigger.getAttribute("data-modal-open");
      const modal = document.querySelector(`[data-modal="${target}"]`);
      openModal(modal);
    });
  });

  modals.forEach((modal) => {
    modal.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => closeModal(modal));
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modals.forEach((modal) => closeModal(modal));
    }
  });

  // EmailJS integration
  const emailForm = document.querySelector("[data-emailjs-form]");
  const statusElement = document.querySelector("[data-form-status]");

  const initEmailJS = () => {
    if (!window.emailjs || !emailForm) return;
    const publicKey = emailForm.getAttribute("data-emailjs-public");
    if (publicKey) {
      try {
        emailjs.init({ publicKey });
      } catch (error) {
        console.warn("EmailJS init error", error);
      }
    }
  };

  const sendEmail = (event) => {
    event.preventDefault();
    if (!window.emailjs) {
      statusElement.textContent = "Service EmailJS indisponible pour le moment.";
      return;
    }

    const serviceId = emailForm.getAttribute("data-emailjs-service");
    const templateId = emailForm.getAttribute("data-emailjs-template");

    statusElement.textContent = "Envoi en cours...";

    emailjs
      .sendForm(serviceId, templateId, emailForm)
      .then(() => {
        statusElement.textContent = "Message envoyé ! Nous revenons vers toi très vite.";
        emailForm.reset();
      })
      .catch((error) => {
        console.error("EmailJS error", error);
        statusElement.textContent = "Impossible d'envoyer le message. Merci de réessayer.";
      });
  };

  if (emailForm && statusElement) {
    emailForm.addEventListener("submit", sendEmail);
    window.addEventListener("load", initEmailJS);
  }

  // Stripe test selection
  const selectionContainer = document.querySelector("[data-selection]");
  if (!selectionContainer) return;

  const selectionList = selectionContainer.querySelector("[data-selection-list]");
  const emptyMessage = selectionContainer.querySelector("[data-selection-empty]");
  const totalElement = selectionContainer.querySelector("[data-selection-total]");
  const statusStripe = selectionContainer.querySelector("[data-selection-status]");
  const checkoutButton = selectionContainer.querySelector("[data-selection-checkout]");

  if (!selectionList || !totalElement || !checkoutButton) {
    return;
  }

  const programmes = new Map();

  const formatPrice = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const refreshSelection = () => {
    const entries = Array.from(programmes.values());
    if (!selectionList || !totalElement || !checkoutButton) {
      return;
    }

    selectionList.innerHTML = "";

    if (!entries.length) {
      if (emptyMessage) emptyMessage.hidden = false;
      checkoutButton.disabled = true;
      totalElement.textContent = "0€";
      selectionContainer.dataset.state = "empty";
      return;
    }

    if (emptyMessage) emptyMessage.hidden = true;
    checkoutButton.disabled = false;

    const total = entries.reduce((acc, programme) => acc + programme.price, 0);
    totalElement.textContent = formatPrice(total);
    selectionContainer.dataset.state = "filled";

    entries.forEach((programme) => {
      const item = document.createElement("li");
      item.className = "premium-selection__item";
      item.innerHTML = `
        <span>${programme.name}</span>
        <strong>${formatPrice(programme.price)}</strong>
        <button type="button" data-remove="${programme.id}">Retirer</button>
      `;
      selectionList.appendChild(item);
    });
  };

  document.querySelectorAll(".programme-card__add").forEach((button, index) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-programme-name");
      const price = Number(button.getAttribute("data-programme-price"));
      const card = button.closest("[data-programme]");
      const id = name || `programme-${index}`;

      if (programmes.has(id)) {
        programmes.delete(id);
        card?.removeAttribute("data-selected");
        card?.removeAttribute("data-selection-id");
      } else {
        programmes.set(id, { id, name, price });
        card?.setAttribute("data-selected", "true");
        card?.setAttribute("data-selection-id", id);
      }

      refreshSelection();
    });
  });

  selectionList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-remove");
    if (!id) return;
    programmes.delete(id);
    const selectedCard = document.querySelector(`[data-programme][data-selection-id="${id}"]`);
    selectedCard?.removeAttribute("data-selected");
    selectedCard?.removeAttribute("data-selection-id");
    refreshSelection();
  });

  const stripePublicKey = selectionContainer.getAttribute("data-stripe-key");
  let stripe;

  const updateStripeStatus = (message) => {
    if (statusStripe) {
      statusStripe.textContent = message;
    }
  };

  const ensureStripe = () => {
    if (!window.Stripe || !stripePublicKey) {
      updateStripeStatus("Stripe test indisponible pour le moment.");
      return null;
    }
    if (!stripe) {
      stripe = Stripe(stripePublicKey);
    }
    return stripe;
  };

  checkoutButton.addEventListener("click", async () => {
    const currentStripe = ensureStripe();
    if (!currentStripe) return;

    const total = Array.from(programmes.values()).reduce((acc, item) => acc + item.price, 0);
    if (!total) return;

    updateStripeStatus("Création de l'intention de paiement test...");

    try {
      const response = await fetch("payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const { clientSecret } = await response.json();
      if (clientSecret) {
        updateStripeStatus("Intention générée en mode test. Ajoutez un élément Stripe Elements pour finaliser.");
      } else {
        updateStripeStatus("Impossible de générer l'intention de paiement test.");
      }
    } catch (error) {
      console.error("Stripe test error", error);
      updateStripeStatus("Erreur Stripe test. Merci de vérifier la configuration.");
    }
  });

  refreshSelection();
})();
