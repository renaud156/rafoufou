# Pause Pilates — app iOS (Capacitor)

Ce dossier contient le **wrapper natif iOS** du site Pause Pilates, construit avec
[Capacitor](https://capacitorjs.com/). Le site web (`../index.html`, `../style.css`, etc.)
n'est pas modifié — ce projet en embarque une copie locale (dans `www/`) pour
l'afficher dans une vraie app iOS.

## Ce qui est déjà prêt

- Projet Xcode généré dans `ios/App/` (utilise Swift Package Manager — **pas besoin
  de CocoaPods/`pod install`**).
- Icône d'app et écran de lancement générés à partir du vrai logo Pause Pilates.
- Nom de l'app : **Pause Pilates**.
- Les liens externes (ex. futur lien de réservation Deciplus, réseaux sociaux)
  s'ouvrent dans un navigateur in-app plutôt que de faire sortir l'utilisateur
  brutalement de l'app (plugin `@capacitor/browser`).
- Le service worker du site web est désactivé dans l'app (inutile : tout est
  déjà embarqué localement).

## Ce qu'il reste à faire (sur un Mac)

### 1. Prérequis
- Xcode (dernière version, via le Mac App Store).
- Node.js installé (pour relancer les commandes `npm`/`npx` si besoin).
- Votre compte Apple Developer Program (déjà actif — 99 $/an).

### 2. Récupérer le projet
```bash
git clone <url-du-repo>
cd rafoufou/mobile
npm install
npx cap sync ios
```
(`App/App/public` n'est pas versionné — c'est une copie de `www/` régénérée
par `cap sync`, c'est normal qu'il manque juste après le clone.)

### 3. Vérifier/changer l'identifiant de l'app
Le `appId` utilisé est `com.pausepilates.app` (placeholder) dans
`capacitor.config.ts`. **Il doit correspondre exactement** à l'identifiant que
vous enregistrez dans votre compte Apple Developer (Certificates, Identifiers
& Profiles → Identifiers) et dans App Store Connect.

Si vous changez l'`appId` :
1. Modifiez-le dans `capacitor.config.ts`.
2. Relancez `npx cap sync ios`.
3. Mettez aussi à jour le "Bundle Identifier" dans Xcode (cible App → Signing
   & Capabilities).

### 4. Ouvrir et configurer dans Xcode
```bash
npx cap open ios
```
Dans Xcode :
- Sélectionnez la cible **App** → onglet **Signing & Capabilities**.
- Choisissez votre **Team** (votre compte développeur).
- Laissez "Automatically manage signing" coché — Xcode crée le profil de
  provisioning tout seul.

### 5. Tester
- Lancez sur un simulateur ou un iPhone branché (bouton ▶️ dans Xcode).
- Vérifiez la navigation entre les pages, le formulaire de contact (ouvre
  l'app Mail), et un lien externe (doit s'ouvrir dans le navigateur in-app).

### 6. Avant de soumettre à l'App Store
- **Politique de confidentialité obligatoire** : Apple exige une URL de
  politique de confidentialité dans App Store Connect. Le site n'en a pas
  encore — il faudra en ajouter une (même simple) sur le site et y faire
  pointer la fiche App Store.
- Préparez des captures d'écran de l'app (plusieurs tailles d'iPhone/iPad
  exigées par App Store Connect).
- Remplissez la fiche App Store Connect : description, mots-clés,
  catégorie (ex. Santé et forme), classification d'âge, coordonnées de
  support.
- **Risque de rejet (règle 4.2 "Minimum Functionality")** : Apple peut
  rejeter une app qui n'est qu'un site web encapsulé sans plus-value native.
  Le plugin Browser et le mode hors-ligne aident, mais ce n'est pas une
  garantie. Si rejetée, Apple indique généralement la raison précise dans
  leur réponse — on pourra ajuster en conséquence (notifications push pour
  les rappels de cours, par exemple, serait un bon ajout).

### 7. Publier
Product → Archive dans Xcode, puis **Distribute App** → App Store Connect
(ou utilisez l'app Transporter). Une fois uploadée, la build apparaît dans
App Store Connect pour soumission à la review.

## Mettre à jour le contenu de l'app plus tard

Quand le site web change (nouvelles pages, nouveaux tarifs, etc.), ce projet
ne se met pas à jour tout seul — il embarque une **copie locale**. Pour
resynchroniser :

```bash
cd mobile
./sync-from-site.sh
npx cap sync ios
```

Puis rebuild/archive/soumettez une nouvelle version depuis Xcode. (Une mise à
jour de contenu nécessite donc une nouvelle soumission App Store — c'est une
limite du mode "site embarqué" ; on peut passer à un chargement du site en
direct depuis le serveur si vous préférez des mises à jour de contenu sans
repasser par la review Apple, une fois l'hébergement définitif choisi.)
