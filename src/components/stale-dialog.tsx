import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { useT } from "@/hooks/use-t";
import { formatClock, durationOf, activeContraction } from "@/lib/contractions";
import { useCurrentSession, useAppStore } from "@/lib/store";

export function StaleDialog() {
  const { t } = useT();
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
        <p id="stale-title" className="font-display text-2xl font-bold text-fg">
          {t("staleTitle")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("staleBody", { clock: formatClock(durationOf(active, now)) })}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={() => resolveStale("end")}>
            {t("staleEnd")}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => resolveStale("cancel")}>
            {t("accidental")}
          </Button>
        </div>
      </div>
    </div>
  );
}
