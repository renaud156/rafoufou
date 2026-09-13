// Pause Pilates — interactions du site
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initStickyHeader();
  initFAQ();
  initContactForm();
});

function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('site-nav');
  if (!toggle || !links) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    links.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setOpen(false);
  });
}

function initStickyHeader() {
  const header = document.querySelector('.primary-nav');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initFAQ() {
  const items = Array.from(document.querySelectorAll('.faq-item'));
  if (!items.length) return;

  items.forEach((item, index) => {
    const button = item.querySelector('.faq-question');
    const panel = item.querySelector('.faq-answer');
    if (!button || !panel) return;

    panel.id = panel.id || `faq-panel-${index + 1}`;
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        const otherPanel = other.querySelector('.faq-answer');
        if (otherPanel) otherPanel.style.maxHeight = '0px';
      });

      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
}

function initContactForm() {
  const form = document.querySelector('form[data-contact-form]');
  if (!form) return;

  const contactEmail = form.dataset.contactEmail || 'contact@pausepilates.fr';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nom = data.get('nom') || '';
    const cours = form.querySelector('select[name="cours"]')?.selectedOptions[0]?.text || '';
    const telephone = data.get('telephone') || '';
    const email = data.get('email') || '';
    const message = data.get('message') || '';

    const subject = `Demande de réservation — ${cours}`;
    const body = [
      `Nom : ${nom}`,
      `Email : ${email}`,
      `Téléphone : ${telephone}`,
      `Cours souhaité : ${cours}`,
      '',
      message,
    ].join('\n');

    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    const success = form.querySelector('.success-message');
    if (success) success.hidden = false;
  });
}
