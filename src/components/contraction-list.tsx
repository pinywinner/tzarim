import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  completedContractions,
  durationOf,
  formatClock,
  startToStartIntervals,
  type Session,
} from "@/lib/contractions";

export function ContractionList({
  session,
  limit,
  onDelete,
}: {
  session: Session;
  limit?: number;
  onDelete?: (id: string) => void;
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
      <div className="rounded-xl bg-elevated px-4 py-8 text-center shadow-[var(--shadow-border)]">
        <p className="text-sm font-medium text-fg">עוד אין צירים</p>
        <p className="mt-1 text-sm text-muted">כל ציר יישמר ברשימה.</p>
      </div>
    );
  }

  return (
    <ol className="overflow-hidden rounded-xl bg-elevated shadow-[var(--shadow-border)]">
      {visible.map((contraction) => {
        const originalIndex = done.findIndex((item) => item.id === contraction.id);
        const interval = intervalByIndex.get(originalIndex);
        return (
          <li
            key={contraction.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="min-w-14 text-sm font-medium tabular-nums text-muted">
              {format(contraction.startedAt, "HH:mm", { locale: he })}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tabular-nums text-fg">
                {formatClock(durationOf(contraction))}
                <span className="ms-2 font-medium text-muted">משך</span>
              </p>
              <p className="text-xs text-muted">
                {interval != null ? `מרווח ${formatClock(interval)}` : "הציר הראשון"}
                {contraction.intensity ? ` · עוצמה ${contraction.intensity}` : ""}
              </p>
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
