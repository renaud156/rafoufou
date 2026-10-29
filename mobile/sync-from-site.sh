#!/usr/bin/env bash
# Pause Pilates — resynchronise mobile/www avec le contenu du site racine.
# À relancer à chaque fois que le site (../*.html, ../style.css, ../assets/...)
# est modifié, avant de refaire `npx cap sync ios` et une nouvelle build Xcode.
set -euo pipefail
cd "$(dirname "$0")"

WWW="www"
PAGES="index.html about.html lepilates.html services.html tarifs.html planning.html faq.html emploi.html contact.html style.css manifest.json"

for f in $PAGES; do
  cp "../$f" "$WWW/"
done

mkdir -p "$WWW/assets/js" "$WWW/assets/img"
cp "../assets/js/main.js" "$WWW/assets/js/main.js"
cp ../assets/img/*.png ../assets/img/*.jpg "$WWW/assets/img/" 2>/dev/null || true

# Le site public renvoie vers Deciplus en externe ; dans l'app, ces mêmes
# boutons doivent plutôt ouvrir la page de réservation intégrée (iframe).
# N'affecte PAS reservation.html (son propre iframe/lien de secours pointe
# volontairement vers la vraie URL Deciplus).
python3 - "$WWW" <<'PY'
import re
import sys
from pathlib import Path

www = Path(sys.argv[1])
deciplus_url = "https://member-app.deciplus.pro/pausepilates/home"
pages = ["index.html", "about.html", "lepilates.html", "services.html", "tarifs.html",
         "planning.html", "faq.html", "emploi.html", "contact.html"]
pattern = re.compile(r'<a\s+([^>]*?)href="' + re.escape(deciplus_url) + r'"([^>]*)>([^<]+)</a>')

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

echo "✔ mobile/www resynchronisé avec le site."
echo "→ Lancez maintenant : npx cap sync ios"
