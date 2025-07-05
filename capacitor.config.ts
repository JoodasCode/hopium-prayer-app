import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mulvi.app',
  appName: 'Mulvi',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
