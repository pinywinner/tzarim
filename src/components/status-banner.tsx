import { format } from "date-fns";
import { useT } from "@/hooks/use-t";
import type { LaborPhase } from "@/lib/contractions";
import { dateLocaleOf } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TONE: Record<LaborPhase, string> = {
  idle: "bg-elevated text-fg",
  early: "bg-calm/15 text-calm",
  establishing: "bg-warn/15 text-warn",
  active: "bg-active/15 text-active",
  go: "bg-warn/20 text-warn",
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
  const { t, locale } = useT();

  if (waterBroke) {
    return (
      <div className="rise-in rounded-xl bg-danger px-4 py-3 text-danger-fg shadow-border">
        <p className="text-base font-bold">{t("waterBannerTitle")}</p>
        <p className="mt-0.5 text-sm opacity-90">
          {t("waterBannerBody")}
          {waterBrokeAt ? ` · ${format(waterBrokeAt, "HH:mm", { locale: dateLocaleOf(locale) })}` : ""}.
        </p>
      </div>
    );
  }

  if (contractionRunning) {
    return (
      <div className="rise-in rounded-xl bg-active/15 px-4 py-3 text-active shadow-border">
        <p className="text-base font-bold">{t("contractionNowTitle")}</p>
        <p className="mt-0.5 text-sm opacity-90">{t("contractionNowHint")}</p>
      </div>
    );
  }

  const copy = {
    idle: { title: t("phaseIdleTitle"), hint: t("phaseIdleHint") },
    early: { title: t("phaseEarlyTitle"), hint: t("phaseEarlyHint") },
    establishing: { title: t("phaseEstablishingTitle"), hint: t("phaseEstablishingHint") },
    active: { title: t("phaseActiveTitle"), hint: t("phaseActiveHint") },
    go: { title: t("phaseGoTitle"), hint: t("phaseGoHint") },
  }[phase];

  return (
    <div className={cn("rise-in rounded-xl px-4 py-3 shadow-border", TONE[phase])}>
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
