import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { he } from "date-fns/locale";
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
import { completedContractions, formatClock, sessionStats } from "@/lib/contractions";
import { shareSession } from "@/lib/share-session";
import { useAppStore, useCurrentSession } from "@/lib/store";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
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

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title="היסטוריה" subtitle={empty ? "כל ציר יישמר כאן" : "המעקב הפתוח, והקודמים"} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
        {empty ? (
          <EmptyWave
            className="flex-1"
            title="עוד אין צירים"
            body="לחצי התחיל במסך עכשיו. הרשימה תיבנה לבד."
          />
        ) : (
          <>
            <StatsRow session={session} stats={stats} />
            <IntervalSparkline session={session} />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const result = await shareSession(session, settings);
                  if (result === "copied") toast("הסיכום הועתק");
                  if (result === "failed") toast("אי אפשר לשתף עכשיו");
                }}
                disabled={done.length === 0}
              >
                <Share2 className="size-4" />
                שתפי למיילדת
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmEnd(true)}
                disabled={session.contractions.length === 0 && !session.waterBrokeAt}
              >
                סיימי מעקב
              </Button>
            </div>

            {stats.longest != null && stats.shortest != null ? (
              <p className="text-center text-xs text-muted">
                הכי ארוך {formatClock(stats.longest)} · הכי קצר {formatClock(stats.shortest)}
              </p>
            ) : null}

            <section>
              <h2 className="mb-2 text-sm font-bold text-fg">כל הצירים</h2>
              <ContractionList
                session={session}
                onDelete={(id) => {
                  const item = session.contractions.find((contraction) => contraction.id === id);
                  deleteContraction(id);
                  if (!item) return;
                  toast("הציר נמחק", {
                    action: {
                      label: "בטלי",
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
            <h2 className="mb-2 text-sm font-bold text-fg">מעקבים קודמים</h2>
            <ul className="overflow-hidden rounded-xl bg-elevated shadow-border">
              {past.map((item) => {
                const itemStats = sessionStats(item);
                return (
                  <li key={item.id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => openSession(item.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition-[background-color] duration-150 active:bg-labor-bg"
                    >
                      <div>
                        <p className="text-sm font-medium text-fg">
                          {format(item.startedAt, "d בMMMM", { locale: he })}
                          {item.endedAt ? ` · ${format(item.endedAt, "HH:mm", { locale: he })}` : ""}
                        </p>
                        <p className="text-xs text-muted">
                          {itemStats.count} צירים
                          {itemStats.avgInterval ? ` · מרווח ${formatClock(itemStats.avgInterval)}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-accent">פתחי</span>
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
          title="לסגור את המעקב?"
          body="המעקב הזה יישמר, וייפתח מעקב חדש."
          confirmLabel="סיימי מעקב"
          onConfirm={() => {
            endSession();
            setConfirmEnd(false);
            toast("נפתח מעקב חדש");
          }}
          onCancel={() => setConfirmEnd(false)}
        />
      ) : null}
    </main>
  );
}
