import { format } from "date-fns";
import { he } from "date-fns/locale";
import type { LaborPhase } from "@/lib/contractions";
import { cn } from "@/lib/utils";

const COPY: Record<LaborPhase, { title: string; hint: string; tone: string }> = {
  idle: {
    title: "עוד אין צירים",
    hint: "לחצי ״התחיל״ כשהציר עולה.",
    tone: "bg-elevated text-fg",
  },
  early: {
    title: "נשארות בבית",
    hint: "עוד לא סדירים. אין צורך לזוז.",
    tone: "bg-calm/15 text-calm",
  },
  establishing: {
    title: "הצירים מתקרבים",
    hint: "המרווחים מתקצרים. הישארי קרובה לחדר לידה.",
    tone: "bg-warn/15 text-warn",
  },
  active: {
    title: "הדפוס מתמלא",
    hint: "חזקים, ובקצב שקבעת. עוד קצת בבית.",
    tone: "bg-accent/15 text-accent",
  },
  go: {
    title: "זמן לצאת",
    hint: "התקשרי למיילדת, או צאי לדרך.",
    tone: "bg-danger text-danger-fg",
  },
};

type StatusBannerProps = {
  phase: LaborPhase;
  waterBroke: boolean;
  waterBrokeAt?: number | null;
  progress: number;
  showMeter: boolean;
  meterLabel?: string;
  contractionRunning: boolean;
};

export function StatusBanner({
  phase,
  waterBroke,
  waterBrokeAt,
  progress,
  showMeter,
  meterLabel,
  contractionRunning,
}: StatusBannerProps) {
  if (waterBroke) {
    return (
      <div className="rise-in rounded-xl bg-danger px-4 py-3 text-danger-fg shadow-border">
        <p className="text-base font-bold">המים ירדו</p>
        <p className="mt-0.5 text-sm opacity-90">
          פני לחדר לידה, גם אם הצירים עוד רחוקים
          {waterBrokeAt ? ` · ${format(waterBrokeAt, "HH:mm", { locale: he })}` : ""}.
        </p>
      </div>
    );
  }

  if (contractionRunning) {
    return (
      <div className="rise-in rounded-xl bg-accent/15 px-4 py-3 text-accent shadow-border">
        <p className="text-base font-bold">הציר עכשיו</p>
        <p className="mt-0.5 text-sm opacity-90">לחצי ״סיימתי״ כשהציר יורד לגמרי.</p>
      </div>
    );
  }

  const copy = COPY[phase];
  return (
    <div className={cn("rise-in rounded-xl px-4 py-3 shadow-border", copy.tone)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-bold">{copy.title}</p>
        {showMeter && meterLabel ? (
          <p className="text-xs font-medium tabular-nums opacity-80">{meterLabel}</p>
        ) : null}
      </div>
      <p className="mt-0.5 text-sm opacity-90">{copy.hint}</p>
      {showMeter && phase !== "go" ? (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-fg/10">
          <div
            className="h-full rounded-full bg-current transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
