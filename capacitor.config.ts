import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.gnote.www',
  appName: 'gNote',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
