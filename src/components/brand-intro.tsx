import { useEffect, useRef } from "react";
import { hapticTap } from "@/lib/haptics";
import { isNativeApp } from "@/lib/native";

const DURATION_MS = 1380;

export function BrandIntro({
  ready,
  onDone,
}: {
  ready: boolean;
  onDone: () => void;
}) {
  const waveRef = useRef<SVGSVGElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    document.documentElement.classList.remove("brand-intro-active");
    doneRef.current();
  };

  useEffect(() => {
    if (!ready) return;

    document.documentElement.classList.add("brand-intro-active");

    if (isNativeApp()) {
      void import("@capacitor/splash-screen").then(({ SplashScreen }) =>
        SplashScreen.hide({ fadeOutDuration: 0 }),
      );
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const wave = waveRef.current;
    if (!wave) {
      finish();
      return;
    }

    wave.style.transform = "none";
    const from = wave.getBoundingClientRect();
    const target = document.querySelector<HTMLElement>("[data-onboarding-wave], [data-home-wave]");
    const fromCx = from.left + from.width / 2;
    const fromCy = from.top + from.height / 2;
    let dx = 0;
    let dy = 0;
    let endScale = 0.38;
    if (target) {
      const to = target.getBoundingClientRect();
      dx = to.left + to.width / 2 - fromCx;
      dy = to.top + to.height / 2 - fromCy;
      if (from.width > 0) endScale = to.width / from.width;
    }
    wave.style.setProperty("--intro-dx", `${dx}px`);
    wave.style.setProperty("--intro-dy", `${dy}px`);
    wave.style.setProperty("--intro-end", String(endScale));
    wave.classList.add("brand-intro-wave-run");

    const haptic = window.setTimeout(() => hapticTap(), 1040);
    const fallback = window.setTimeout(finish, DURATION_MS + 80);

    return () => {
      window.clearTimeout(haptic);
      window.clearTimeout(fallback);
      document.documentElement.classList.remove("brand-intro-active");
    };
  }, [ready]);

  return (
    <div
      className="brand-intro"
      role="presentation"
      onAnimationEnd={(event) => {
        if (event.animationName === "brand-intro-veil") finish();
      }}
    >
      <p className="sr-only">מעקב צירים</p>
      <svg
        ref={waveRef}
        viewBox="0 0 168 72"
        className="brand-intro-wave"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 52c26 0 34 0 48-24C68 12 74 8 84 8s16 4 26 20c14 24 22 24 48 24"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
