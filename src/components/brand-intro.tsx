import { useLayoutEffect, useRef } from "react";
import { hapticTap } from "@/lib/haptics";
import { isAndroidApp, isNativeApp } from "@/lib/native";
import { SplashHandoff } from "@/lib/splash-handoff";

const DURATION_MS = 1400;

function measureWave(): DOMRect | null {
  const wave = document.querySelector<HTMLElement>("[data-onboarding-wave], [data-home-wave]");
  if (!wave) return null;
  const rect = wave.getBoundingClientRect();
  return rect.width < 8 ? null : rect;
}

export function BrandIntro({
  ready,
  onDone,
}: {
  ready: boolean;
  onDone: () => void;
}) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const wave = document.querySelector<HTMLElement>("[data-onboarding-wave], [data-home-wave]");
    wave?.classList.remove("brand-intro-hero");
    document.documentElement.classList.remove(
      "brand-intro-active",
      "brand-intro-playing",
      "native-splash-playing",
    );
    doneRef.current();
  };

  useLayoutEffect(() => {
    if (!ready) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (isNativeApp()) {
        void import("@capacitor/splash-screen").then(({ SplashScreen }) =>
          SplashScreen.hide({ fadeOutDuration: 0 }),
        );
        if (isAndroidApp()) void SplashHandoff.skip().catch(() => undefined);
      }
      finish();
      return;
    }

    if (isAndroidApp()) {
      document.documentElement.classList.add("native-splash-playing");
      let cancelled = false;
      const fallback = window.setTimeout(finish, 3200);
      const start = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const rect = measureWave();
          if (!rect || cancelled) {
            window.clearTimeout(fallback);
            finish();
            return;
          }
          void SplashHandoff.land({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          })
            .catch(() => undefined)
            .then(() => {
              if (!cancelled) {
                window.clearTimeout(fallback);
                finish();
              }
            });
        });
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(start);
        window.clearTimeout(fallback);
        document.documentElement.classList.remove("native-splash-playing");
      };
    }

    if (isNativeApp()) {
      void import("@capacitor/splash-screen").then(({ SplashScreen }) =>
        SplashScreen.hide({ fadeOutDuration: 0 }),
      );
    }

    const wave = document.querySelector<HTMLElement>("[data-onboarding-wave], [data-home-wave]");
    const rect = measureWave();
    if (!wave || !rect) {
      finish();
      return;
    }

    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const from = Math.max((window.innerWidth * 4.15) / rect.width, 12);

    wave.style.setProperty("--intro-dx", `${dx}px`);
    wave.style.setProperty("--intro-dy", `${dy}px`);
    wave.style.setProperty("--intro-from", String(from));
    wave.classList.add("brand-intro-hero");
    document.documentElement.classList.add("brand-intro-active", "brand-intro-playing");

    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === "brand-intro-hero") finish();
    };
    wave.addEventListener("animationend", onEnd);
    const haptic = window.setTimeout(() => hapticTap(), 420);
    const timeout = window.setTimeout(finish, DURATION_MS + 80);

    return () => {
      wave.removeEventListener("animationend", onEnd);
      window.clearTimeout(haptic);
      window.clearTimeout(timeout);
      wave.classList.remove("brand-intro-hero");
      document.documentElement.classList.remove("brand-intro-active", "brand-intro-playing");
    };
  }, [ready]);

  return null;
}
