// Pause Pilates — fiche d'un cours (lu depuis sessionStorage, posé par
// l'accueil ou l'écran Réserver juste avant la navigation vers cette page).
document.addEventListener('DOMContentLoaded', function () {
  var root = document.getElementById('course-detail');
  if (!root) return;

  var raw = sessionStorage.getItem('pp_selected_class');
  if (!raw) {
    window.location.href = 'index.html#schedule';
    return;
  }
  var c = JSON.parse(raw);

  var PHOTOS = {
    pilates: 'assets/img/studio-reformer.jpg',
    'pilates-inter': 'assets/img/studio-reformer.jpg',
    abdos: 'assets/img/studio-balls.jpg',
    yoga: 'assets/img/maria-portrait.jpg',
    cardio: 'assets/img/studio-balls.jpg',
  };
  document.getElementById('detail-photo').src = PHOTOS[c.type] || 'assets/img/studio-reformer.jpg';
  document.getElementById('detail-name').textContent = c.typeLabel;
  document.getElementById('detail-desc').textContent = c.desc || '';
  document.getElementById('detail-date').textContent = c.dateLabel;
  document.getElementById('detail-time').textContent = c.time + ' (' + c.duration + ')';
  if (c.level) {
    document.getElementById('detail-level-row').hidden = false;
    document.getElementById('detail-level').textContent = c.level;
  }

  var back = document.getElementById('detail-back');
  if (back && window.history.length > 1) {
    back.addEventListener('click', function (e) {
      e.preventDefault();
      window.history.back();
    });
  }
});
