import type { Intensity } from "@/lib/contractions";
import { cn } from "@/lib/utils";

const LEVELS: Intensity[] = [1, 2, 3, 4, 5];

export function IntensityPicker({
  onPick,
  onSkip,
}: {
  onPick: (value: Intensity) => void;
  onSkip: () => void;
}) {
  return (
    <div className="rise-in rounded-2xl bg-elevated p-4 shadow-border">
      <p className="text-sm font-medium text-fg">כמה חזק היה?</p>
      <div className="mt-3 flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onPick(level)}
            className={cn(
              "flex h-14 flex-1 items-center justify-center rounded-lg bg-surface font-display text-xl font-semibold text-fg shadow-border transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]",
            )}
            aria-label={`עוצמה ${level}`}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">1 קל · 5 חזק מאוד</p>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-md text-sm font-medium text-muted"
      >
        דלגי — בלי עוצמה
      </button>
    </div>
  );
}
