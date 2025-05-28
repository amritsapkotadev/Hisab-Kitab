import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SplitWise',
  slug: 'splitwise',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.hisabkitab.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.hisabkitab.app'
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  extra: {
    FIREBASE_API_KEY: "AIzaSyAVYuEswLiTZD_tpV_7vQgED9RnK3Cy-QE",
    FIREBASE_AUTH_DOMAIN: "hisab-kitab-ad197.firebaseapp.com",
    FIREBASE_PROJECT_ID: "hisab-kitab-ad197",
    FIREBASE_STORAGE_BUCKET: "hisab-kitab-ad197.firebasestorage.app",
    FIREBASE_MESSAGING_SENDER_ID: "838491649019",
    FIREBASE_APP_ID: "1:838491649019:web:16db04c04280fd5c2a915e",
    FIREBASE_MEASUREMENT_ID: "G-PKPBDH24BR",
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-web-browser',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static'
        }
      }
    ]
  ]
});