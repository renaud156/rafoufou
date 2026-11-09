// Pause Pilates — données et logique du planning (app), partagées entre
// l'accueil (prochain cours), l'écran Réserver (liste par jour) et la
// fiche d'un cours (sessionStorage).
(function () {
  var TYPE_LABELS = {
    pilates: 'Pilates',
    'pilates-inter': 'Pilates intermédiaire',
    abdos: 'Abdos de Gasquet',
    yoga: 'Yoga',
    cardio: 'Cardio renfo',
  };

  // day: 0 = dimanche … 6 = samedi (comme Date#getDay()).
  var SCHEDULE = [
    { day: 1, start: '10:30', end: '11:30', type: 'pilates', name: 'Pilates', level: 'Tous niveaux', desc: 'Renforcement doux et postural, accessible à tous.' },
    { day: 1, start: '12:30', end: '13:30', type: 'pilates', name: 'Pilates', level: 'Tous niveaux', desc: 'Renforcement doux et postural, accessible à tous.' },
    { day: 1, start: '19:00', end: '20:30', type: 'yoga', name: 'Yin Yoga', level: '', desc: 'Postures tenues longuement, pour un relâchement profond.' },
    { day: 2, start: '19:00', end: '20:00', type: 'pilates-inter', name: 'Pilates', level: '', desc: 'Plus intense, pour approfondir une fois les bases acquises.' },
    { day: 3, start: '09:00', end: '10:00', type: 'abdos', name: 'Abdos de Gasquet', level: '', desc: 'Méthode respiratoire douce pour renforcer la sangle abdominale.' },
    { day: 3, start: '10:15', end: '11:15', type: 'pilates', name: 'Pilates', level: 'Tous niveaux', desc: 'Renforcement doux et postural, accessible à tous.' },
    { day: 4, start: '09:30', end: '10:30', type: 'yoga', name: 'Yoga', level: '', desc: 'Souplesse, équilibre et respiration, pour tout public.' },
    { day: 4, start: '18:00', end: '19:00', type: 'pilates', name: 'Pilates', level: '', desc: 'Renforcement doux et postural, accessible à tous.' },
    { day: 5, start: '10:15', end: '11:15', type: 'pilates', name: 'Pilates', level: 'Tous niveaux', desc: 'Renforcement doux et postural, accessible à tous.' },
    { day: 6, start: '10:00', end: '11:00', type: 'cardio', name: 'Cardio renfo', level: 'Tous niveaux', desc: 'Renforcement musculaire plus dynamique, tous niveaux.' },
  ];

  var DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var DAY_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  var MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function timeRangeLabel(start, end) {
    return start.replace(':', 'h').replace(/h00$/, 'h') + ' – ' + end.replace(':', 'h').replace(/h00$/, 'h');
  }

  function durationLabel(start, end) {
    var s = start.split(':').map(Number);
    var e = end.split(':').map(Number);
    var mins = (e[0] * 60 + e[1]) - (s[0] * 60 + s[1]);
    return mins + ' min';
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function rawDayLabel(d) {
    return capitalize(DAY_NAMES[d.getDay()]) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function fullDateLabel(d, isToday) {
    var base = rawDayLabel(d);
    return isToday ? "Aujourd'hui · " + base : base;
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function startMinutes(start) {
    var s = start.split(':').map(Number);
    return s[0] * 60 + s[1];
  }

  function buildEntry(classInfo, date, isToday) {
    return {
      type: classInfo.type,
      typeLabel: TYPE_LABELS[classInfo.type],
      name: classInfo.name,
      level: classInfo.level,
      desc: classInfo.desc,
      time: timeRangeLabel(classInfo.start, classInfo.end),
      duration: durationLabel(classInfo.start, classInfo.end),
      // Minutes depuis minuit : évite de devoir retrouver l'horaire exact
      // par une recherche inverse dans SCHEDULE (fragile si deux créneaux
      // finissaient par partager le même type + le même libellé affiché).
      startMinutes: startMinutes(classInfo.start),
      dateLabel: fullDateLabel(date, isToday),
      dayShort: DAY_SHORT[date.getDay()],
      dayNum: date.getDate(),
    };
  }

  function mondayOf(date) {
    var d = new Date(date);
    var day = d.getDay();
    var diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Un jour calendaire avec tous ses cours, triés par horaire.
  function buildDay(date, isToday) {
    var classes = SCHEDULE
      .filter(function (c) { return c.day === date.getDay(); })
      .slice()
      .sort(function (a, b) { return a.start.localeCompare(b.start); })
      .map(function (c) { return buildEntry(c, date, isToday); });
    return {
      date: date,
      dayShort: DAY_SHORT[date.getDay()],
      dayNum: date.getDate(),
      dateLabel: fullDateLabel(date, isToday),
      // dateLabel sans le préfixe "Aujourd'hui · ", pour les appelants qui
      // veulent composer leur propre libellé sans dépendre du séparateur
      // exact utilisé ici.
      dayLabel: rawDayLabel(date),
      isToday: isToday,
      classes: classes,
    };
  }

  window.PauseSchedule = {
    TYPE_LABELS: TYPE_LABELS,
    timeRangeLabel: timeRangeLabel,
    durationLabel: durationLabel,

    // La semaine calendaire (lundi → dimanche) décalée de weekOffset
    // semaines par rapport à celle d'aujourd'hui.
    weekDays: function (weekOffset) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var monday = mondayOf(today);
      monday.setDate(monday.getDate() + (weekOffset || 0) * 7);
      var days = [];
      for (var i = 0; i < 7; i++) {
        var d = addDays(monday, i);
        days.push(buildDay(d, d.getTime() === today.getTime()));
      }
      return days;
    },

    weekRangeLabel: function (days) {
      var start = days[0].date;
      var end = days[6].date;
      var sameMonth = start.getMonth() === end.getMonth();
      var startLabel = start.getDate() + (sameMonth ? '' : ' ' + MONTHS[start.getMonth()]);
      return 'Semaine du ' + startLabel + ' au ' + end.getDate() + ' ' + MONTHS[end.getMonth()] + ' ' + end.getFullYear();
    },

    // Les prochains jours (par défaut 7), chacun avec ses cours du jour.
    nextDays: function (count) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var days = [];
      for (var i = 0; i < (count || 7); i++) {
        days.push(buildDay(addDays(today, i), i === 0));
      }
      return days;
    },

    // Le tout prochain cours à partir de maintenant (regarde jusqu'à 8 jours).
    nextClass: function () {
      var now = new Date();
      var days = this.nextDays(8);
      for (var i = 0; i < days.length; i++) {
        for (var j = 0; j < days[i].classes.length; j++) {
          var entry = days[i].classes[j];
          var classDateTime = new Date(days[i].date);
          classDateTime.setHours(0, entry.startMinutes, 0, 0);
          if (classDateTime > now) return entry;
        }
      }
      return null;
    },
  };
})();
