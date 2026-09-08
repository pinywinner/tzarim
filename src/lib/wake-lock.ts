type Sentinel = { release: () => Promise<void>; addEventListener: (type: string, fn: () => void) => void };

let sentinel: Sentinel | null = null;
let desired = false;

async function requestLock(): Promise<void> {
  if (!desired || typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<Sentinel> } };
  if (!nav.wakeLock) return;
  try {
    sentinel = await nav.wakeLock.request("screen");
    sentinel.addEventListener("release", () => {
      sentinel = null;
    });
  } catch {
    sentinel = null;
  }
}

export function setWakeLock(enabled: boolean): void {
  desired = enabled;
  if (!enabled) {
    void sentinel?.release();
    sentinel = null;
    return;
  }
  void requestLock();
}

export function bindWakeLockVisibility(): () => void {
  if (typeof document === "undefined") return () => {};
  const onChange = () => {
    if (document.visibilityState === "visible" && desired) {
      void requestLock();
    }
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
