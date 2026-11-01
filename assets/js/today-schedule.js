// Pause Pilates — teaser "Aujourd'hui" sur l'accueil de l'app, à partir du planning réel.
document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('app-today');
  if (!mount) return;

  const SCHEDULE = {
    1: [
      { time: '10h30 – 11h30', name: 'Pilates (tous niveaux)' },
      { time: '12h30 – 13h30', name: 'Pilates (tous niveaux)' },
      { time: '19h00 – 20h30', name: 'Yin Yoga' },
    ],
    2: [{ time: '19h00 – 20h00', name: 'Pilates (Intermédiaire)' }],
    3: [
      { time: '09h00 – 10h00', name: 'Abdos de Gasquet' },
      { time: '10h15 – 11h15', name: 'Pilates (tous niveaux)' },
    ],
    4: [
      { time: '09h30 – 10h30', name: 'Yoga' },
      { time: '18h00 – 19h00', name: 'Pilates' },
    ],
    5: [{ time: '10h15 – 11h15', name: 'Pilates (tous niveaux)' }],
    6: [{ time: '10h00 – 11h00', name: 'Cardio renfo (tous niveaux)' }],
    0: [],
  };

  const today = new Date().getDay();
  const classes = SCHEDULE[today] || [];
  const heading = mount.querySelector('h2');
  const placeholder = mount.querySelector('.app-today-empty');

  if (!classes.length) {
    if (placeholder) {
      placeholder.innerHTML = '';
      const link = document.createElement('a');
      link.href = 'planning.html';
      link.textContent = "Pas de cours aujourd'hui — voir le planning complet →";
      placeholder.appendChild(link);
    }
    return;
  }

  if (placeholder) placeholder.remove();

  const list = document.createElement('div');
  list.className = 'app-today-list';
  classes.forEach((c) => {
    const row = document.createElement('a');
    row.className = 'app-today-row';
    row.href = 'planning.html';
    row.innerHTML = `<span class="app-today-time">${c.time}</span><span class="app-today-name">${c.name}</span>`;
    list.appendChild(row);
  });
  mount.appendChild(list);
});
