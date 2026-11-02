// Pause Pilates — carte "Prochain cours" de l'accueil.
document.addEventListener('DOMContentLoaded', function () {
  var card = document.getElementById('next-class-card');
  if (!card || !window.PauseSchedule) return;

  var next = window.PauseSchedule.nextClass();
  if (!next) {
    card.hidden = true;
    return;
  }

  card.querySelector('.next-class__name').textContent = next.typeLabel || next.name;
  card.querySelector('.next-class__meta').textContent = next.dateLabel + ' · ' + next.time;

  card.addEventListener('click', function () {
    sessionStorage.setItem('pp_selected_class', JSON.stringify(next));
  });
});
