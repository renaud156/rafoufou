import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT — before building for the App Store:
// `appId` must exactly match the Bundle Identifier registered in your
// Apple Developer account (developer.apple.com → Certificates, Identifiers
// & Profiles) and in App Store Connect. "com.pausepilates.app" below is a
// placeholder — change it here AND in Xcode (App target → Signing &
// Capabilities → Bundle Identifier) if you register a different one.
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
