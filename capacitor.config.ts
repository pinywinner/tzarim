import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "il.tzarim.app",
  appName: "מעקב צירים",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: "#F5F1EA",
      showSpinner: false,
      androidScaleType: "FIT_CENTER",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F5F1EA",
    },
  },
};

export default config;
