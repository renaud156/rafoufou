// Pause Pilates — accueil : prochain cours + planning de la semaine, inline.
document.addEventListener('DOMContentLoaded', function () {
  if (!window.PauseSchedule) return;

  // --- Prochain cours ---
  var nextCard = document.getElementById('next-class-card');
  if (nextCard) {
    var next = window.PauseSchedule.nextClass();
    if (!next) {
      nextCard.hidden = true;
    } else {
      nextCard.querySelector('.next-class__name').textContent = next.typeLabel || next.name;
      nextCard.querySelector('.next-class__meta').textContent = next.dateLabel + ' · ' + next.time;
      nextCard.addEventListener('click', function () {
        sessionStorage.setItem('pp_selected_class', JSON.stringify(next));
      });
    }
  }

  // --- Planning de la semaine ---
  var dayStrip = document.getElementById('day-strip');
  var list = document.getElementById('slot-list');
  if (!dayStrip || !list) return;

  var weekOffset = 0;
  var activeFilter = 'all';
  var activeDayIndex = new Date().getDay();
  activeDayIndex = activeDayIndex === 0 ? 6 : activeDayIndex - 1; // index lundi=0..dimanche=6

  var rangeLabel = document.getElementById('week-range-label');
  var dateLabel = document.getElementById('selected-date-label');
  var prevBtn = document.getElementById('week-prev');
  var nextBtn = document.getElementById('week-next');

  var PHOTOS = {
    pilates: 'assets/img/studio-reformer.jpg',
    'pilates-inter': 'assets/img/studio-reformer.jpg',
    abdos: 'assets/img/studio-balls.jpg',
    yoga: 'assets/img/maria-portrait.jpg',
    cardio: 'assets/img/studio-balls.jpg',
  };

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

  var days;

  function renderWeekHead() {
    days = window.PauseSchedule.weekDays(weekOffset);
    if (rangeLabel) rangeLabel.textContent = window.PauseSchedule.weekRangeLabel(days);
    if (activeDayIndex > 6) activeDayIndex = 6;
  }

  function renderDayStrip() {
    dayStrip.innerHTML = days
      .map(function (d, i) {
        var active = i === activeDayIndex ? ' is-active' : '';
        var today = d.isToday ? ' is-today' : '';
        return (
          '<button class="day-chip' + active + today + '" data-index="' + i + '">' +
          '<span class="day-chip__label">' + d.dayShort.replace('.', '') + '</span>' +
          '<span class="day-chip__num">' + d.dayNum + '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  function renderList() {
    var day = days[activeDayIndex];
    if (dateLabel) dateLabel.textContent = day.isToday ? "Aujourd'hui" : day.dateLabel;

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
          '<div class="slot-card-v2" data-type="' + c.type + '">' +
          '<a class="slot-card-v2__link" data-index="' + i + '">' +
          '<img class="slot-card-v2__photo" src="' + (PHOTOS[c.type] || PHOTOS.pilates) + '" alt="" />' +
          '<span class="slot-card-v2__body">' +
          '<strong>' + c.typeLabel + (c.level ? ' – ' + c.level : '') + '</strong>' +
          '<span class="slot-card-v2__meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>' + c.time + ' (' + c.duration + ')</span>' +
          '</span>' +
          '</a>' +
          '<span class="slot-card-v2__side">' +
          '<span class="slot-card-v2__price">20 €</span>' +
          '<a class="slot-card-v2__reserve" href="https://member-app.deciplus.pro/pausepilates/home">Réserver</a>' +
          '</span>' +
          '</div>'
        );
      })
      .join('');

    Array.from(list.querySelectorAll('.slot-card-v2__link')).forEach(function (link, i) {
      link.addEventListener('click', function () {
        sessionStorage.setItem('pp_selected_class', JSON.stringify(classes[i]));
        window.location.href = 'detail.html';
      });
    });
  }

  function renderAll() {
    renderWeekHead();
    renderDayStrip();
    renderList();
  }

  dayStrip.addEventListener('click', function (e) {
    var btn = e.target.closest('.day-chip');
    if (!btn) return;
    activeDayIndex = Number(btn.dataset.index);
    renderDayStrip();
    renderList();
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { weekOffset -= 1; renderAll(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { weekOffset += 1; renderAll(); });

  var chips = Array.from(document.querySelectorAll('.filter-chip'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter || 'all';
      renderList();
    });
  });

  renderAll();
});
