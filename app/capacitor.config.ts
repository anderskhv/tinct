import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.tinct.reader',
  appName: 'Tinct',
  webDir: 'dist',
  server: {
    // In production, load from bundled assets (file://)
    // For dev, uncomment the url line and point to your dev server:
    // url: 'http://192.168.1.X:3001',
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content for audio from R2 CDN
    allowMixedContent: true,
  },
  plugins: {
    App: {
      // Handle back button on Android
    },
    Browser: {
      // Used for OAuth redirects
    },
  },
};

export default config;
