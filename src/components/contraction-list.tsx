import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  completedContractions,
  durationOf,
  formatClock,
  startToStartIntervals,
  type Session,
} from "@/lib/contractions";

function Bar({
  value,
  max,
  tone,
  label,
}: {
  value: number;
  max: number;
  tone: "accent" | "calm";
  label: string;
}) {
  const width = `${Math.max(8, Math.min(100, (value / Math.max(max, 1)) * 100))}%`;
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-xs text-muted">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-track">
        <div
          className={tone === "accent" ? "h-full rounded-full bg-accent" : "h-full rounded-full bg-calm"}
          style={{ width }}
        />
      </div>
      <span className="w-10 shrink-0 text-start text-xs tabular-nums text-muted">
        {formatClock(value)}
      </span>
    </div>
  );
}

export function ContractionList({
  session,
  limit,
  onDelete,
  durationCapMs = 90_000,
  intervalCapMs = 10 * 60_000,
}: {
  session: Session;
  limit?: number;
  onDelete?: (id: string) => void;
  durationCapMs?: number;
  intervalCapMs?: number;
}) {
  const done = completedContractions(session);
  const visible = limit ? [...done].reverse().slice(0, limit) : [...done].reverse();
  const intervals = startToStartIntervals(done);
  const intervalByIndex = new Map<number, number>();
  done.forEach((_, index) => {
    if (index > 0) intervalByIndex.set(index, intervals[index - 1] ?? 0);
  });

  if (visible.length === 0) {
    return (
      <div className="rounded-xl bg-elevated px-4 py-8 text-center shadow-border">
        <p className="text-sm font-medium text-fg">עוד אין צירים</p>
        <p className="mt-1 text-sm text-muted">כל ציר יישמר ברשימה.</p>
      </div>
    );
  }

  const maxDuration = Math.max(durationCapMs, ...done.map((item) => durationOf(item)));
  const maxInterval = Math.max(intervalCapMs, ...intervals, 1);

  return (
    <ol className="overflow-hidden rounded-xl bg-elevated shadow-border">
      {visible.map((contraction) => {
        const originalIndex = done.findIndex((item) => item.id === contraction.id);
        const interval = intervalByIndex.get(originalIndex);
        return (
          <li
            key={contraction.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="min-w-12 text-sm font-medium tabular-nums text-muted">
              {format(contraction.startedAt, "HH:mm", { locale: he })}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Bar
                value={durationOf(contraction)}
                max={maxDuration}
                tone="accent"
                label="משך"
              />
              {interval != null ? (
                <Bar value={interval} max={maxInterval} tone="calm" label="מרווח" />
              ) : (
                <p className="text-xs text-muted">הציר הראשון</p>
              )}
              {contraction.intensity ? (
                <p className="text-xs text-muted">עוצמה {contraction.intensity}</p>
              ) : null}
            </div>
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(contraction.id)}
                className="h-11 px-2 text-xs font-medium text-muted"
              >
                מחקי
              </button>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
