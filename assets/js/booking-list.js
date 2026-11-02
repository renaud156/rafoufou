// Pause Pilates — écran Réserver : sélecteur de jour + liste des cours.
document.addEventListener('DOMContentLoaded', function () {
  var dayStrip = document.getElementById('day-strip');
  var dateLabel = document.getElementById('selected-date-label');
  var list = document.getElementById('slot-list');
  if (!dayStrip || !list || !window.PauseSchedule) return;

  var days = window.PauseSchedule.nextDays(7);
  var activeFilter = 'all';
  var activeDayIndex = 0;

  function iconFor(type) {
    var icons = {
      pilates: '<circle cx="12" cy="12" r="8"/>',
      'pilates-inter': '<circle cx="12" cy="12" r="8"/>',
      abdos: '<path d="M2 8c2.5-2 5 2 7.5 0S14 6 16.5 8s5-2 5.5 0"/><path d="M2 14c2.5-2 5 2 7.5 0s4.5-2 7 0 5-2 5.5 0"/>',
      yoga: '<circle cx="12" cy="18" r="1.6"/><path d="M12 16c0-4.5-3.5-6-3.5-9.5a3.5 3.5 0 0 1 7 0c0 3.5-3.5 5-3.5 9.5z"/><path d="M8.3 13c-3-1.3-4.8-4.2-4-7.3"/><path d="M15.7 13c3-1.3 4.8-4.2 4-7.3"/>',
      cardio: '<path d="M2.5 12h4l2-7 4 14 2-7h7"/>',
    };
    return icons[type] || icons.pilates;
  }

  function renderDayStrip() {
    dayStrip.innerHTML = days
      .map(function (d, i) {
        var active = i === activeDayIndex ? ' is-active' : '';
        var count = d.classes.length;
        return (
          '<button class="day-chip' + active + '" data-index="' + i + '"' + (count ? '' : ' data-empty="1"') + '>' +
          '<span class="day-chip__label">' + d.dayShort + '</span>' +
          '<span class="day-chip__num">' + d.dayNum + '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  function renderList() {
    var day = days[activeDayIndex];
    dateLabel.textContent = day.isToday ? "Aujourd'hui" : day.dateLabel;

    var classes = day.classes.filter(function (c) {
      return activeFilter === 'all' || activeFilter.split(',').includes(c.type);
    });

    if (!classes.length) {
      list.innerHTML = '<p class="slot-list__empty">Aucun cours ce jour-là.</p>';
      return;
    }

    list.innerHTML = classes
      .map(function (c, i) {
        return (
          '<button class="slot-card" data-index="' + i + '">' +
          '<span class="slot-card__time">' +
          '<strong>' + c.time.split(' – ')[0] + '</strong>' +
          '<span>' + c.duration + '</span>' +
          '</span>' +
          '<span class="slot-card__icon" data-type="' + c.type + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + iconFor(c.type) + '</svg></span>' +
          '<span class="slot-card__info">' +
          '<strong>' + c.typeLabel + '</strong>' +
          (c.level ? '<span>' + c.level + '</span>' : '') +
          '</span>' +
          '<span class="slot-card__chev">›</span>' +
          '</button>'
        );
      })
      .join('');

    Array.from(list.querySelectorAll('.slot-card')).forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        sessionStorage.setItem('pp_selected_class', JSON.stringify(classes[i]));
        window.location.href = 'detail.html';
      });
    });
  }

  dayStrip.addEventListener('click', function (e) {
    var btn = e.target.closest('.day-chip');
    if (!btn) return;
    activeDayIndex = Number(btn.dataset.index);
    renderDayStrip();
    renderList();
  });

  var chips = Array.from(document.querySelectorAll('.filter-chip'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter || 'all';
      renderList();
    });
  });

  renderDayStrip();
  renderList();
});
