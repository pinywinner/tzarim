import { useEffect } from "react";
import { isNativeApp } from "@/lib/native";
import { useAppStore } from "@/lib/store";

export function NativeBootstrap() {
  const theme = useAppStore((state) => state.settings.theme);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    if (!isNativeApp()) return;
    document.documentElement.classList.add("native");
    void import("@capacitor/splash-screen").then(({ SplashScreen }) =>
      SplashScreen.hide({ fadeOutDuration: 0 }),
    );
  }, []);

  useEffect(() => {
    if (!hydrated || !isNativeApp()) return;
    const dark = theme === "dark";
    void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
      try {
        await StatusBar.setStyle({ style: dark ? Style.Light : Style.Dark });
        await StatusBar.setBackgroundColor({ color: dark ? "#211F1D" : "#F5F1EA" });
      } catch {
        // Older WebViews / iOS ignore background color.
      }
    });
  }, [theme, hydrated]);

  return null;
}
