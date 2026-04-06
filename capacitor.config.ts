import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yangshulin.bakingscaler',
  appName: '烘焙换算助手',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
