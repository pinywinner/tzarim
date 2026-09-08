import { Button } from "@/components/ui/button";
import { formatClock, durationOf, activeContraction } from "@/lib/contractions";
import { useCurrentSession, useAppStore } from "@/lib/store";
import { useNow } from "@/hooks/use-now";

export function StaleDialog() {
  const session = useCurrentSession();
  const stalePromptId = useAppStore((state) => state.stalePromptId);
  const resolveStale = useAppStore((state) => state.resolveStale);
  const active = activeContraction(session);
  const now = useNow(Boolean(active && stalePromptId));

  if (!stalePromptId || !active || active.id !== stalePromptId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fg/45 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stale-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-border">
        <p id="stale-title" className="font-display text-2xl font-semibold text-fg">
          הציר נשאר פתוח
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          כבר {formatClock(durationOf(active, now))}. לסגור, או שלחצת בטעות?
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={() => resolveStale("end")}>
            סיימי את הציר
          </Button>
          <Button size="lg" variant="secondary" onClick={() => resolveStale("cancel")}>
            לחצתי בטעות
          </Button>
        </div>
      </div>
    </div>
  );
}
