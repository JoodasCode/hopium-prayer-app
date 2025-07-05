import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.lopi',
  appName: 'lopi',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
