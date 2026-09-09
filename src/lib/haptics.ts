import { isNativeApp } from "@/lib/native";

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers expose vibrate but reject it outside a user gesture.
  }
}

export function hapticStart(): void {
  if (isNativeApp()) {
    void import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) =>
      Haptics.impact({ style: ImpactStyle.Light }),
    );
    return;
  }
  vibrate(22);
}

export function hapticEnd(): void {
  if (isNativeApp()) {
    void import("@capacitor/haptics").then(async ({ Haptics, ImpactStyle }) => {
      await Haptics.impact({ style: ImpactStyle.Light });
      await Haptics.impact({ style: ImpactStyle.Medium });
    });
    return;
  }
  vibrate([24, 40, 36]);
}

export function hapticTap(): void {
  if (isNativeApp()) {
    void import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) =>
      Haptics.impact({ style: ImpactStyle.Light }),
    );
    return;
  }
  vibrate(18);
}
