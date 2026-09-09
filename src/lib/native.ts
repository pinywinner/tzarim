import { Capacitor } from "@capacitor/core";

export function isNativeApp(): boolean {
  try {
    return typeof window !== "undefined" && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isAndroidApp(): boolean {
  try {
    return isNativeApp() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}
