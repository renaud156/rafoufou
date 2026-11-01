#!/usr/bin/env bash
# Pause Pilates — resynchronise mobile/www avec le contenu du site racine.
# À relancer à chaque fois que le site (../*.html, ../style.css, ../assets/...)
# est modifié, avant de refaire `npx cap sync ios` et une nouvelle build Xcode.
set -euo pipefail
cd "$(dirname "$0")"

WWW="www"
# index.html N'EST PAS synchronisé : l'app a sa propre page d'accueil,
# volontairement différente du site public (voir mobile/www/index.html).
PAGES="about.html lepilates.html services.html tarifs.html planning.html faq.html emploi.html contact.html style.css manifest.json app-overrides.css"

for f in $PAGES; do
  cp "../$f" "$WWW/"
done

mkdir -p "$WWW/assets/js" "$WWW/assets/img"
cp "../assets/js/main.js" "$WWW/assets/js/main.js"
cp "../assets/js/today-schedule.js" "$WWW/assets/js/today-schedule.js"
cp ../assets/img/*.png ../assets/img/*.jpg "$WWW/assets/img/" 2>/dev/null || true

# Le site public renvoie vers Deciplus en externe ; dans l'app, ces mêmes
# boutons doivent plutôt ouvrir la page de réservation intégrée (iframe).
# N'affecte PAS reservation.html (son propre iframe/lien de secours pointe
# volontairement vers la vraie URL Deciplus) ni index.html (page d'accueil
# propre à l'app, non synchronisée).
python3 - "$WWW" <<'PY'
import re
import sys
from pathlib import Path

www = Path(sys.argv[1])
deciplus_url = "https://member-app.deciplus.pro/pausepilates/home"
pages = ["about.html", "lepilates.html", "services.html", "tarifs.html",
         "planning.html", "faq.html", "emploi.html", "contact.html"]
pattern = re.compile(r'<a\s+([^>]*?)href="' + re.escape(deciplus_url) + r'"([^>]*)>(.*?)</a>', re.DOTALL)

def repl(m):
    pre_attrs, post_attrs, label = m.group(1), m.group(2), m.group(3)
    attrs = (pre_attrs + post_attrs)
    attrs = re.sub(r'\s*target="_blank"', '', attrs)
    attrs = re.sub(r'\s*rel="noopener"', '', attrs)
    attrs = attrs.strip()
    if attrs:
        attrs = ' ' + attrs
    return f'<a href="reservation.html"{attrs}>{label}</a>'

for name in pages:
    p = www / name
    content = p.read_text(encoding="utf-8")
    new_content, n = pattern.subn(repl, content)
    if n:
        p.write_text(new_content, encoding="utf-8")
PY

# Le site public a une navigation complète (menu hamburger, gros pied de
# page) adaptée à un site à plusieurs pages. Dans l'app, la navigation se
# fait par la barre du bas : on remplace donc l'en-tête et le pied de page
# de ces pages par la version "app" (en-tête minimal + barre d'onglets).
python3 - "$WWW" <<'PY'
import re
import sys
from pathlib import Path

www = Path(sys.argv[1])
titles = {
    "about.html": "Le studio",
    "lepilates.html": "Le Pilates",
    "services.html": "Nos cours",
    "tarifs.html": "Tarifs",
    "planning.html": "Planning",
    "faq.html": "FAQ",
    "emploi.html": "Emploi",
    "contact.html": "Contact",
}

header_pattern = re.compile(r'<header class="primary-nav">.*?</header>', re.DOTALL)
footer_pattern = re.compile(r'<footer class="primary-footer">.*?</footer>', re.DOTALL)
body_pattern = re.compile(r'<body(?:\s+class="[^"]*")?>')

TAB_BAR = '''<nav class="tab-bar" aria-label="Navigation">
      <a href="index.html" class="tab-bar__item" data-match="index.html,">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>
        <span>Accueil</span>
      </a>
      <a href="planning.html" class="tab-bar__item" data-match="planning.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Planning</span>
      </a>
      <a href="reservation.html" class="tab-bar__item tab-bar__item--cta" data-match="reservation.html">
        <span class="tab-bar__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
        </span>
        <span>Réserver</span>
      </a>
      <a href="infos.html" class="tab-bar__item" data-match="infos.html,about.html,lepilates.html,services.html,tarifs.html,faq.html,emploi.html,contact.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>
        <span>Infos</span>
      </a>
    </nav>'''

for name, title in titles.items():
    p = www / name
    if not p.exists():
        continue
    content = p.read_text(encoding="utf-8")
    slim_header = f'<header class="app-header-slim">\n      <img src="assets/img/logo.png" alt="" />\n      <span>{title}</span>\n    </header>'
    content = header_pattern.sub(slim_header, content, count=1)
    content = footer_pattern.sub(TAB_BAR, content, count=1)
    content = body_pattern.sub('<body class="has-tab-bar">', content, count=1)
    p.write_text(content, encoding="utf-8")
PY

# Dans l'app native, le site a déjà tous ses fichiers en local : pas besoin
# (et pas souhaitable) d'enregistrer le service worker du site web.
python3 - "$WWW/assets/js/main.js" <<'PY'
import sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
old = "function registerServiceWorker() {\n  if (!('serviceWorker' in navigator)) return;"
new = "function registerServiceWorker() {\n  if (window.Capacitor) return; // native app shell: assets are already bundled locally\n  if (!('serviceWorker' in navigator)) return;"
if old in content:
    content = content.replace(old, new, 1)
with open(path, 'w') as f:
    f.write(content)
PY

# Ajoute le script du pont Capacitor sur chaque page (idempotent).
for f in "$WWW"/*.html; do
  grep -q 'capacitor-bridge.js' "$f" || \
    sed -i 's#<script src="assets/js/main.js"></script>#<script src="assets/js/main.js"></script>\n    <script src="assets/js/capacitor-bridge.js"></script>#' "$f"
done

# Ajoute la feuille de style "app" (resserre les pages héritées du site)
# juste après style.css sur chaque page synchronisée (idempotent).
for f in about.html lepilates.html services.html tarifs.html planning.html faq.html emploi.html contact.html; do
  p="$WWW/$f"
  [ -f "$p" ] || continue
  grep -q 'app-overrides.css' "$p" || \
    sed -i 's#<link rel="stylesheet" href="style.css" />#<link rel="stylesheet" href="style.css" />\n    <link rel="stylesheet" href="app-overrides.css" />#' "$p"
done

echo "✔ mobile/www resynchronisé avec le site."
echo "→ Lancez maintenant : npx cap sync ios"
