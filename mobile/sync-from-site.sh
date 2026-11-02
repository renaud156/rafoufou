#!/usr/bin/env bash
# Pause Pilates — resynchronise les ressources partagées de mobile/www avec
# le site racine (style, polices, scripts, images). À relancer à chaque
# modification de ../style.css ou ../assets/..., avant `npx cap sync ios`.
#
# L'app a ses propres écrans (index.html, planning.html, cours.html,
# infos.html, detail.html) : ce sont des fichiers propres à l'app, jamais
# écrasés par ce script. L'app ne reprend plus aucune page de contenu du
# site public (about, services, tarifs, FAQ...) — elle n'est plus un site
# habillé, juste un outil de réservation.
set -euo pipefail
cd "$(dirname "$0")"

WWW="www"

cp "../style.css" "$WWW/style.css"
cp "../manifest.json" "$WWW/manifest.json"

mkdir -p "$WWW/assets/js" "$WWW/assets/img"
for f in main.js schedule.js home-next-class.js booking-list.js course-detail.js; do
  cp "../assets/js/$f" "$WWW/assets/js/$f"
done
cp ../assets/img/*.png ../assets/img/*.jpg "$WWW/assets/img/" 2>/dev/null || true

# Dans l'app native, les fichiers sont déjà tous en local : pas besoin
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

echo "✔ mobile/www resynchronisé (style, scripts, images)."
echo "→ Lancez maintenant : npx cap sync ios"
