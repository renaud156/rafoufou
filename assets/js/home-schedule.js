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
  var relativeLabel = document.getElementById('week-relative-label');
  var prevBtn = document.getElementById('week-prev');
  var nextBtn = document.getElementById('week-next');

  var days;

  function renderWeekHead() {
    days = window.PauseSchedule.weekDays(weekOffset);
    if (rangeLabel) rangeLabel.textContent = window.PauseSchedule.weekRangeLabel(days);
    if (relativeLabel) {
      relativeLabel.textContent =
        weekOffset === 0 ? 'Cette semaine' : weekOffset === 1 ? 'Semaine prochaine' : weekOffset === -1 ? 'Semaine dernière' : weekOffset > 0 ? 'Dans ' + weekOffset + ' semaines' : 'Il y a ' + -weekOffset + ' semaines';
    }
    if (activeDayIndex > 6) activeDayIndex = 6;
  }

  function renderDayStrip() {
    dayStrip.innerHTML = days
      .map(function (d, i) {
        var active = i === activeDayIndex ? ' is-active' : '';
        var today = d.isToday ? ' is-today' : '';
        return (
          '<button class="day-chip' + active + today + '" data-index="' + i + '" aria-pressed="' + (i === activeDayIndex) + '">' +
          '<span class="day-chip__label">' + d.dayShort.replace('.', '') + '</span>' +
          '<span class="day-chip__num">' + d.dayNum + '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  // --- La semaine complète, jour par jour, comme le planning papier ---
  var allEntries = []; // { day index, class entry } à plat, pour le clic.

  function renderList() {
    allEntries = [];
    var html = days
      .map(function (day, dayIndex) {
        var classes = day.classes.filter(function (c) {
          return activeFilter === 'all' || activeFilter.split(',').includes(c.type);
        });

        var rowsHtml = classes.length
          ? classes
              .map(function (c) {
                var entryIndex = allEntries.length;
                allEntries.push(c);
                return (
                  '<div class="day-row" data-type="' + c.type + '">' +
                  '<a class="day-row__link" href="detail.html" data-entry="' + entryIndex + '">' +
                  '<span class="day-row__time"><strong>' + c.time.split(' – ')[0] + '</strong><span>' + c.duration + '</span></span>' +
                  '<span class="day-row__divider" aria-hidden="true"></span>' +
                  '<span class="day-row__body">' +
                  '<strong>' + c.typeLabel + '</strong>' +
                  (c.level ? '<span class="day-row__level">' + c.level + '</span>' : '') +
                  '</span>' +
                  '</a>' +
                  '<span class="day-row__side">' +
                  '<span class="day-row__price">20 €</span>' +
                  '<a class="day-row__reserve" href="https://member-app.deciplus.pro/pausepilates/home">Réserver</a>' +
                  '</span>' +
                  '</div>'
                );
              })
              .join('')
          : '<p class="day-section__empty">Aucun cours ce jour-là.</p>';

        return (
          '<section class="day-section" id="day-' + dayIndex + '" data-today="' + (day.isToday ? '1' : '0') + '">' +
          '<h3 class="day-section__title">' + capitalizeDay(day) + '</h3>' +
          rowsHtml +
          '</section>'
        );
      })
      .join('');

    list.innerHTML = html;

    Array.from(list.querySelectorAll('.day-row__link')).forEach(function (link) {
      link.addEventListener('click', function () {
        var c = allEntries[Number(link.dataset.entry)];
        sessionStorage.setItem('pp_selected_class', JSON.stringify(c));
        window.location.href = 'detail.html';
      });
    });

    initScrollSpy();
  }

  // Met en valeur, dans le bandeau de jours, celui qu'on est en train de
  // regarder pendant qu'on fait défiler la semaine — sans ça, le bandeau
  // ne reflète plus que le dernier jour touché, pas ce qui est à l'écran.
  var scrollSpy = null;
  function initScrollSpy() {
    if (scrollSpy) scrollSpy.disconnect();
    scrollSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = Number(entry.target.id.replace('day-', ''));
          if (index === activeDayIndex) return;
          activeDayIndex = index;
          renderDayStrip();
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    Array.from(list.querySelectorAll('.day-section')).forEach(function (section) {
      scrollSpy.observe(section);
    });
  }

  function capitalizeDay(day) {
    return (day.isToday ? "Aujourd'hui — " : '') + day.dayLabel;
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
    var target = document.getElementById('day-' + activeDayIndex);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { weekOffset -= 1; renderAll(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { weekOffset += 1; renderAll(); });

  var chips = Array.from(document.querySelectorAll('.filter-chip'));
  chips.forEach(function (chip) {
    chip.setAttribute('aria-pressed', chip.classList.contains('is-active'));
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      activeFilter = chip.dataset.filter || 'all';
      renderList();
    });
  });

  renderAll();
});
