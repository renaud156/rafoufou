// Pause Pilates — planning hebdomadaire interactif de l'app (grille + filtres).
document.addEventListener('DOMContentLoaded', () => {
  const slots = Array.from(document.querySelectorAll('.week-slot'));
  const chips = Array.from(document.querySelectorAll('.filter-chip'));
  const detail = document.getElementById('week-detail');
  if (!slots.length || !detail) return;

  function applyFilter(filter) {
    const allowed = filter === 'all' ? null : filter.split(',');
    slots.forEach((slot) => {
      const match = !allowed || allowed.includes(slot.dataset.type);
      slot.classList.toggle('is-dim', !match);
      slot.classList.remove('is-lit');
      if (match && filter !== 'all') {
        // force un redémarrage de l'animation même si déjà jouée
        void slot.offsetWidth;
        slot.classList.add('is-lit');
      }
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilter(chip.dataset.filter || 'all');
    });
  });

  function showDetail(slot) {
    slots.forEach((s) => s.classList.remove('is-selected'));
    slot.classList.add('is-selected');
    const { day, time, name, level, desc } = slot.dataset;
    detail.innerHTML =
      '<div class="week-detail__content">' +
      '<span class="week-detail__day">' + day + '</span>' +
      '<div class="week-detail__time">' + time + '</div>' +
      '<div class="week-detail__level">' + name + (level ? ' · ' + level : '') + '</div>' +
      (desc ? '<p class="week-detail__desc">' + desc + '</p>' : '') +
      '<a class="button button--primary" href="reservation.html">Réserver ce cours</a>' +
      '</div>';
  }

  slots.forEach((slot) => {
    slot.addEventListener('click', () => showDetail(slot));
  });
});
