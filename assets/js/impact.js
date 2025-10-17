(function () {
  const nav = document.querySelector(".primary-nav");
  const navLinks = document.querySelector(".primary-nav__links");
  const toggle = document.querySelector(".nav-toggle");

  function handleScroll() {
    if (!nav) return;
    if (window.scrollY > 12) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href")?.substring(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (window.AOS) {
    window.AOS.init({
      duration: 900,
      once: true,
      offset: 160
    });
  }

  // EmailJS contact form
  const form = document.querySelector("form[data-emailjs]");
  if (form && window.emailjs) {
    const publicKey = form.getAttribute("data-emailjs-public-key");
    const serviceId = form.getAttribute("data-emailjs-service");
    const templateId = form.getAttribute("data-emailjs-template");
    const successMessage = form.querySelector(".success-message");

    window.emailjs.init(publicKey);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());
      form.classList.add("is-loading");

      window.emailjs
        .send(serviceId, templateId, values)
        .then(() => {
          form.reset();
          if (successMessage) {
            successMessage.textContent = "Merci — votre message a bien été envoyé !";
            successMessage.hidden = false;
          }
        })
        .catch(() => {
          if (successMessage) {
            successMessage.textContent = "Une erreur est survenue. Merci de réessayer.";
            successMessage.hidden = false;
          }
        })
        .finally(() => {
          form.classList.remove("is-loading");
        });
    });
  }
})();
