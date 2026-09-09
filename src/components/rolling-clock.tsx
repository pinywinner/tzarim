import { useLayoutEffect, useRef, useState } from "react";
import { formatClock } from "@/lib/contractions";
import { cn } from "@/lib/utils";

function formatLaborClock(ms: number): string {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  if (totalSec >= 3600) return formatClock(ms);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function RollingDigit({ value }: { value: string }) {
  const prevRef = useRef(value);
  const [pair, setPair] = useState<[string, string] | null>(null);

  useLayoutEffect(() => {
    if (value === prevRef.current) return;
    const from = prevRef.current;
    prevRef.current = value;
    setPair([from, value]);
    const id = window.setTimeout(() => setPair(null), 160);
    return () => window.clearTimeout(id);
  }, [value]);

  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-baseline">
      {pair ? (
        <span className="digit-roll flex flex-col">
          <span className="grid h-[1em] place-items-center">{pair[0]}</span>
          <span className="grid h-[1em] place-items-center">{pair[1]}</span>
        </span>
      ) : (
        <span className="grid h-[1em] place-items-center">{value}</span>
      )}
    </span>
  );
}

export function RollingClock({
  ms,
  className,
}: {
  ms: number;
  className?: string;
}) {
  const text = formatLaborClock(ms);

  return (
    <span dir="ltr" className={cn("inline-flex items-baseline tabular-nums", className)}>
      <span className="sr-only" aria-live="polite">
        {text}
      </span>
      <span aria-hidden="true" className="inline-flex flex-row items-baseline">
        {Array.from(text).map((ch, index) =>
          ch === ":" ? (
            <span key="colon" className="mx-[0.04em]">
              :
            </span>
          ) : (
            <RollingDigit key={index} value={ch} />
          ),
        )}
      </span>
    </span>
  );
}
