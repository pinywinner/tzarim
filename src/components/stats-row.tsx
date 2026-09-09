import { useT } from "@/hooks/use-t";
import { formatClock, intervalTrend, type Session, type SessionStats } from "@/lib/contractions";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  hint,
  last,
}: {
  label: string;
  value: string;
  hint?: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 px-2 py-0.5",
        !last && "border-e border-border",
      )}
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="font-display text-xl font-bold tabular-nums leading-none text-fg">{value}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function StatsRow({ session, stats }: { session: Session; stats: SessionStats }) {
  const { t } = useT();
  const trend = intervalTrend(session.contractions);
  const trendLabel =
    trend === "shorter" ? t("trendShorter") : trend === "longer" ? t("trendLonger") : trend === "stable" ? t("trendStable") : undefined;

  return (
    <div className="grid grid-cols-3 rounded-xl bg-elevated px-1 py-3 shadow-border">
      <Stat label={t("avgDuration")} value={stats.count ? formatClock(stats.avgDuration) : "—"} />
      <Stat
        label={t("avgInterval")}
        value={stats.avgInterval ? formatClock(stats.avgInterval) : "—"}
        hint={trendLabel}
      />
      <Stat label={t("contractions")} value={String(stats.count)} last />
    </div>
  );
}

export function TrendNote({ session }: { session: Session }) {
  const { t } = useT();
  const trend = intervalTrend(session.contractions);
  if (!trend) return null;
  return (
    <p
      className={cn(
        "text-center text-xs font-medium",
        trend === "shorter" ? "text-accent" : "text-muted",
      )}
    >
      {trend === "shorter" ? t("trendShorterNote") : trend === "longer" ? t("trendLongerNote") : t("trendStableNote")}
    </p>
  );
}
