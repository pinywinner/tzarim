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
  vibrate(36);
}

export function hapticEnd(): void {
  vibrate([24, 40, 36]);
}

export function hapticTap(): void {
  vibrate(18);
}
