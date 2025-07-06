import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mulvi.app',
  appName: 'Mulvi',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.165:3000',
    cleartext: true
  }
};

export default config;
