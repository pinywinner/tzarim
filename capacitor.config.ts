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
      backgroundColor: "#F5F1EA",
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F5F1EA",
    },
  },
};

export default config;
