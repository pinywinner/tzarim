import { completedContractions, startToStartIntervals, type Session } from "@/lib/contractions";

export function IntervalSparkline({ session }: { session: Session }) {
  const intervals = startToStartIntervals(completedContractions(session));
  if (intervals.length < 2) return null;

  const width = 320;
  const height = 72;
  const pad = 6;
  const max = Math.max(...intervals);
  const min = Math.min(...intervals);
  const span = Math.max(max - min, 1);
  const points = intervals.map((value, index) => {
    const x = pad + (index / Math.max(intervals.length - 1, 1)) * (width - pad * 2);
    const y = pad + (1 - (value - min) / span) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl bg-elevated px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium text-fg">המרווחים</p>
      <p className="mb-2 text-xs text-muted">יורד — הצירים מתקרבים</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full overflow-visible" role="img" aria-label="המרווחים לאורך הזמן">
        <polyline
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points.join(" ")}
        />
      </svg>
    </div>
  );
}
