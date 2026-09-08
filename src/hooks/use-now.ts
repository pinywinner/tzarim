import { useEffect, useState } from "react";

export function useNow(enabled: boolean, interval = 200): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [enabled, interval]);

  return now;
}
