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
      launchAutoHide: false,
      backgroundColor: "#F3EEE6",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F3EEE6",
    },
  },
};

export default config;
