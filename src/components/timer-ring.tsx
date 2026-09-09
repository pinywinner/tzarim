import { formatClock } from "@/lib/contractions";
import { cn } from "@/lib/utils";

type TimerRingProps = {
  progress: number;
  label: string;
  ms: number;
  active: boolean;
  tone: "idle" | "accent" | "calm" | "warn" | "danger";
};

const SIZE = 220;
const CENTER = 110;
const RADIUS = 96;
const CIRC = 2 * Math.PI * RADIUS;
const STROKE = 10;

const TONE_CLASS: Record<TimerRingProps["tone"], string> = {
  idle: "text-muted",
  accent: "text-accent",
  calm: "text-calm",
  warn: "text-warn",
  danger: "text-danger",
};

export function TimerRing({ progress, label, ms, active, tone }: TimerRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = CIRC * (1 - clamped);

  return (
    <div className="timer-ring relative mx-auto aspect-square">
      {active ? (
        <span
          className="wave-expand pointer-events-none absolute inset-[6%] rounded-full border border-accent/35"
          aria-hidden="true"
        />
      ) : null}
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90" aria-hidden="true">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" className="stroke-track" strokeWidth={STROKE} />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          className={cn(
            "transition-[stroke-dashoffset] duration-200 ease-out",
            TONE_CLASS[tone],
            active && "ring-breathe",
          )}
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p
          className="font-display text-timer font-black leading-none tracking-tight text-fg tabular-nums"
          aria-live="polite"
        >
          {formatClock(ms)}
        </p>
        <p className="mt-3 max-w-44 text-xs leading-snug text-muted">{label}</p>
      </div>
    </div>
  );
}
