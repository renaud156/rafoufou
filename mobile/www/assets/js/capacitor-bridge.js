// Pause Pilates — pont Capacitor (app native uniquement)
// Ouvre les liens externes (ex. réservation Deciplus, réseaux sociaux)
// dans le navigateur in-app plutôt que de quitter brutalement l'app.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.Browser) return;

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    try {
      const url = new URL(href, window.location.href);
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
      if (isHttp && url.hostname !== window.location.hostname) {
        event.preventDefault();
        window.Capacitor.Plugins.Browser.open({ url: url.href });
      }
    } catch (e) {
      // invalid URL, let the browser handle it as-is
    }
  });
});
