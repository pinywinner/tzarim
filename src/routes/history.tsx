import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyWave } from "@/components/brand-wave";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { ContractionList } from "@/components/contraction-list";
import { IntervalSparkline } from "@/components/interval-sparkline";
import { StatsRow } from "@/components/stats-row";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { WaterMark } from "@/components/water-mark";
import { useT } from "@/hooks/use-t";
import { completedContractions, formatClock, sessionStats } from "@/lib/contractions";
import { dateLocaleOf } from "@/lib/i18n";
import { shareSession } from "@/lib/share-session";
import { useAppStore, useCurrentSession } from "@/lib/store";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const { t, locale } = useT();
  const session = useCurrentSession();
  const settings = useAppStore((state) => state.settings);
  const sessions = useAppStore((state) => state.sessions);
  const currentSessionId = useAppStore((state) => state.currentSessionId);
  const endSession = useAppStore((state) => state.endSession);
  const openSession = useAppStore((state) => state.openSession);
  const deleteContraction = useAppStore((state) => state.deleteContraction);
  const restoreContraction = useAppStore((state) => state.restoreContraction);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const stats = sessionStats(session);
  const done = completedContractions(session);
  const empty = done.length === 0 && !session.waterBrokeAt;
  const past = [...sessions]
    .filter((item) => item.id !== currentSessionId && (item.contractions.length > 0 || item.waterBrokeAt))
    .sort((a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt));
  const dateFmt = locale === "he" ? "d בMMMM" : "MMMM d";

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t("historyTitle")} subtitle={empty ? t("historyEmptySub") : t("historySub")} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
        {empty ? (
          <EmptyWave className="flex-1" title={t("historyEmptyTitle")} body={t("historyEmptyBody")} />
        ) : (
          <>
            <StatsRow session={session} stats={stats} />
            <IntervalSparkline session={session} />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const result = await shareSession(session, settings);
                  if (result === "copied") toast(t("copied"));
                  if (result === "failed") toast(t("shareFailed"));
                }}
                disabled={done.length === 0}
              >
                <Share2 className="size-4" />
                {t("shareMidwife")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmEnd(true)}
                disabled={session.contractions.length === 0 && !session.waterBrokeAt}
              >
                {t("endSession")}
              </Button>
            </div>
            <WaterMark className="w-full" />

            {stats.longest != null && stats.shortest != null ? (
              <p className="text-center text-xs text-muted">
                {t("longestShortest", { longest: formatClock(stats.longest), shortest: formatClock(stats.shortest) })}
              </p>
            ) : null}

            <section>
              <h2 className="mb-2 text-sm font-bold text-fg">{t("allContractions")}</h2>
              <ContractionList
                session={session}
                onDelete={(id) => {
                  const item = session.contractions.find((contraction) => contraction.id === id);
                  deleteContraction(id);
                  if (!item) return;
                  toast(t("deleted"), {
                    action: {
                      label: t("undo"),
                      onClick: () => restoreContraction(item),
                    },
                  });
                }}
              />
            </section>
          </>
        )}

        {past.length > 0 ? (
          <section>
            <h2 className="mb-2 text-sm font-bold text-fg">{t("pastSessions")}</h2>
            <ul className="overflow-hidden rounded-xl bg-elevated shadow-border">
              {past.map((item) => {
                const itemStats = sessionStats(item);
                return (
                  <li key={item.id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => openSession(item.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-[background-color] duration-150 active:bg-labor-bg"
                    >
                      <div>
                        <p className="text-sm font-medium text-fg">
                          {format(item.startedAt, dateFmt, { locale: dateLocaleOf(locale) })}
                          {item.endedAt ? ` · ${format(item.endedAt, "HH:mm", { locale: dateLocaleOf(locale) })}` : ""}
                        </p>
                        <p className="text-xs text-muted">
                          {t("contractionsCount", { n: itemStats.count })}
                          {itemStats.avgInterval ? ` · ${t("intervalStat", { clock: formatClock(itemStats.avgInterval) })}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-accent">{t("openSession")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      {confirmEnd ? (
        <ConfirmSheet
          title={t("endSessionTitle")}
          body={t("endSessionBody")}
          confirmLabel={t("endSession")}
          onConfirm={() => {
            endSession();
            setConfirmEnd(false);
            toast(t("newSessionToast"));
          }}
          onCancel={() => setConfirmEnd(false)}
        />
      ) : null}
    </main>
  );
}
