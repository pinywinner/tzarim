import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
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
    <Sheet labelledBy="stale-title" onDismiss={() => resolveStale("cancel")}>
      <p id="stale-title" className="font-display text-headline font-bold text-fg">
        {t("staleTitle")}
      </p>
      <p className="mt-2 text-body leading-relaxed text-muted">
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
    </Sheet>
  );
}
