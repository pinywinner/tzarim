import { useT } from "@/hooks/use-t";
import type { Intensity } from "@/lib/contractions";
import { hapticTap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const LEVELS: Intensity[] = [1, 2, 3, 4, 5];

const LEVEL_CLASS: Record<Intensity, string> = {
  1: "h-11 bg-surface text-fg",
  2: "h-12 bg-accent/15 text-fg",
  3: "h-14 bg-accent/30 text-fg",
  4: "h-16 bg-accent/70 text-accent-fg",
  5: "h-16 bg-accent text-accent-fg",
};

export function IntensityPicker({
  onPick,
  onSkip,
  compact = false,
}: {
  onPick: (value: Intensity) => void;
  onSkip: () => void;
  compact?: boolean;
}) {
  const { t } = useT();
  if (compact) {
    return (
      <div className="rise-in">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-fg">{t("intensityAsk")}</p>
          <button type="button" onClick={onSkip} className="text-xs font-medium text-muted">
            {t("skip")}
          </button>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                hapticTap();
                onPick(level);
              }}
              className="flex h-12 items-center justify-center rounded-lg bg-elevated font-display text-lg font-bold text-fg shadow-border transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]"
              aria-label={t("intensityAria", { n: level })}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rise-in rounded-2xl bg-elevated p-4 shadow-border">
      <p className="text-sm font-medium text-fg">{t("intensityAsk")}</p>
      <div className="mt-3 flex items-end gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => {
              hapticTap();
              onPick(level);
            }}
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg font-display text-xl font-bold shadow-border transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]",
              LEVEL_CLASS[level],
            )}
            aria-label={t("intensityAria", { n: level })}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{t("intensityScale")}</p>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-md text-sm font-medium text-muted"
      >
        {t("skipNoIntensity")}
      </button>
    </div>
  );
}
