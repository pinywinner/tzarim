import { useT } from "@/hooks/use-t";
import { completedContractions, startToStartIntervals, type Session } from "@/lib/contractions";

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index]!;
    const to = points[index + 1]!;
    const mid = (from.x + to.x) / 2;
    d += ` C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}`;
  }
  return d;
}

export function IntervalSparkline({ session }: { session: Session }) {
  const { t } = useT();
  const intervals = startToStartIntervals(completedContractions(session));
  if (intervals.length < 2) return null;

  const width = 320;
  const height = 72;
  const pad = 8;
  const max = Math.max(...intervals);
  const min = Math.min(...intervals);
  const span = Math.max(max - min, 1);
  const points = intervals.map((value, index) => ({
    x: pad + (index / Math.max(intervals.length - 1, 1)) * (width - pad * 2),
    y: pad + (1 - (value - min) / span) * (height - pad * 2),
  }));
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1]!.x} ${height} L ${points[0]!.x} ${height} Z`;

  return (
    <div className="rise-in rounded-xl bg-elevated px-4 py-3 shadow-border">
      <p className="text-sm font-medium text-fg">{t("intervalsTitle")}</p>
      <p className="mb-2 text-xs text-muted">{t("intervalsHint")}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full overflow-visible" role="img" aria-label={t("intervalsAria")}>
        <path d={area} className="fill-active/10" />
        <path
          d={line}
          fill="none"
          className="stroke-active"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
