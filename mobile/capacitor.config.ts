import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT — avant de publier :
// `appId` doit correspondre exactement au Bundle Identifier enregistré
// dans votre compte Apple Developer (developer.apple.com → Certificates,
// Identifiers & Profiles) ET à l'App ID dans App Store Connect, ET à
// l'applicationId Android (mobile/android/app/build.gradle) enregistré
// dans la Google Play Console. "com.pausepilates.app" ci-dessous est un
// identifiant provisoire — si vous le changez, mettez-le à jour ici, dans
// Xcode (App target → Signing & Capabilities → Bundle Identifier) ET dans
// android/app/build.gradle (applicationId), puis relancez `npx cap sync`.
const config: CapacitorConfig = {
  appId: 'com.pausepilates.app',
  appName: 'Pause Pilates',
  webDir: 'www',
  backgroundColor: '#00495e',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#00495e',
  },
};

export default config;
