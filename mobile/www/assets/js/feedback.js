// Pause Pilates — retours tactiles et sonores. Vibration légère (via
// Capacitor sur l'app, silencieuse sur le web) sur les éléments
// interactifs courants, et un petit carillon doux (Web Audio, pas de
// fichier audio) sur les actions de réservation. Tout est best-effort :
// aucune de ces API n'est garantie disponible, donc chaque appel est
// protégé et ignoré en silence si indisponible.
(function () {
  var TAP_SELECTOR =
    '.home-tile, .filter-chip, .day-chip, .tab-bar__item, .next-class-card, .week-nav button, .faq-question';
  var CONFIRM_SELECTOR = '.reserve-cta, .day-row__reserve, .home-hero__call, a[href^="tel:"]';

  function hapticImpact(style) {
    try {
      var haptics = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
      if (haptics) haptics.impact({ style: style || 'LIGHT' });
    } catch (e) {
      // pas de plugin natif (web, ou app pas encore synchronisée) : on ignore
    }
  }

  var audioCtx = null;
  function getAudioContext() {
    if (audioCtx) return audioCtx;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  }

  // Deux notes courtes qui montent, volume très bas — un "ding" discret
  // de confirmation, pas un bruitage de jeu.
  function playConfirmChime() {
    var ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(function () {});

    var notes = [523.25, 783.99]; // Do5, Sol5
    var startTime = ctx.currentTime;

    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var t = startTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  function initTapFeedback() {
    document.addEventListener(
      'click',
      function (event) {
        var confirmTarget = event.target.closest(CONFIRM_SELECTOR);
        if (confirmTarget) {
          hapticImpact('MEDIUM');
          playConfirmChime();
          return;
        }
        var tapTarget = event.target.closest(TAP_SELECTOR);
        if (tapTarget) hapticImpact('LIGHT');
      },
      true
    );
  }

  document.addEventListener('DOMContentLoaded', initTapFeedback);
})();
