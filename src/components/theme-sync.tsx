import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function ThemeSync() {
  const theme = useAppStore((state) => state.settings.theme);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    void useAppStore.persist.rehydrate();
    const fallback = window.setTimeout(() => {
      if (!useAppStore.getState().hydrated) {
        useAppStore.getState().setHydrated(true);
      }
    }, 600);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        useAppStore.getState().checkStaleOnResume();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#14110F" : "#F3EEE6");
    }
  }, [theme, hydrated]);

  return null;
}
