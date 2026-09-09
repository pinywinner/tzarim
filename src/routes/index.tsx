import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { ContractionList } from "@/components/contraction-list";
import { IntensityPicker } from "@/components/intensity-picker";
import { StatsRow } from "@/components/stats-row";
import { StatusBanner } from "@/components/status-banner";
import { TimerRing } from "@/components/timer-ring";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { playEndSound, playStartSound } from "@/lib/audio";
import {
  activeContraction,
  completedContractions,
  durationOf,
  evaluatePhase,
  formatClock,
  intervalSoFar,
  patternWindowCopy,
  phaseMeterVisible,
  phaseProgress,
  sessionStats,
} from "@/lib/contractions";
import { hapticEnd, hapticStart } from "@/lib/haptics";
import { useAppStore, useCurrentSession } from "@/lib/store";
import { bindWakeLockVisibility, setWakeLock } from "@/lib/wake-lock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: TimerPage });

function TimerPage() {
  const session = useCurrentSession();
  const settings = useAppStore((state) => state.settings);
  const startContraction = useAppStore((state) => state.startContraction);
  const endContraction = useAppStore((state) => state.endContraction);
  const cancelContraction = useAppStore((state) => state.cancelContraction);
  const undoLast = useAppStore((state) => state.undoLast);
  const setWaterBroke = useAppStore((state) => state.setWaterBroke);
  const pendingIntensityId = useAppStore((state) => state.pendingIntensityId);
  const setIntensity = useAppStore((state) => state.setIntensity);
  const dismissIntensity = useAppStore((state) => state.dismissIntensity);
  const [confirmWater, setConfirmWater] = useState(false);

  const active = activeContraction(session);
  const done = completedContractions(session);
  const ticking = Boolean(active) || session.contractions.length > 0;
  const now = useNow(ticking);
  const phase = evaluatePhase(session, settings, now);
  const progress = phaseProgress(session, settings, now);
  const stats = sessionStats(session, now);
  const laborFocus = Boolean(active);

  const elapsed = active ? durationOf(active, now) : (intervalSoFar(session, now) ?? 0);
  const targetMs = active
    ? Math.max(settings.durationSeconds, 90) * 1000
    : settings.intervalMinutes * 60_000;
  const ringProgress = active
    ? Math.min(elapsed / 90_000, 1)
    : session.contractions.length
      ? Math.min(elapsed / targetMs, 1)
      : 0;

  const tone = session.waterBrokeAt
    ? "danger"
    : phase === "go"
      ? "danger"
      : active
        ? "accent"
        : phase === "active"
          ? "warn"
          : phase === "establishing"
            ? "warn"
            : phase === "early"
              ? "calm"
              : "idle";

  const label = active
    ? "משך הציר"
    : session.contractions.length
      ? "מרווח מהאחרון"
      : "כשהציר מתחיל — לחצי";

  useEffect(() => {
    const shouldLock = settings.keepAwake && (Boolean(active) || session.contractions.length > 0);
    setWakeLock(shouldLock);
    const unbind = bindWakeLockVisibility();
    return () => {
      unbind();
      setWakeLock(false);
    };
  }, [settings.keepAwake, active, session.contractions.length]);

  const onStart = () => {
    startContraction();
    if (settings.vibration) hapticStart();
    if (settings.sound) playStartSound();
  };

  const onEnd = () => {
    endContraction();
    if (settings.vibration) hapticEnd();
    if (settings.sound) playEndSound();
  };

  const askingIntensity = Boolean(pendingIntensityId) && !active;

  const waterButton = (
    <Button
      variant={session.waterBrokeAt ? "danger" : "secondary"}
      onClick={() => {
        if (session.waterBrokeAt) {
          setWaterBroke(false);
          toast("הסימון בוטל");
        } else {
          setConfirmWater(true);
        }
      }}
    >
      <Droplets className="size-4" />
      {session.waterBrokeAt ? "המים לא ירדו" : "המים ירדו"}
    </Button>
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      {laborFocus ? null : <TopBar title="מעקב צירים" subtitle="מעקב בבית, עד שיוצאים" />}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5",
          laborFocus ? "justify-center pb-2 pt-[max(1rem,env(safe-area-inset-top))]" : "pb-4",
        )}
      >
        <StatusBanner
          phase={phase}
          waterBroke={Boolean(session.waterBrokeAt)}
          waterBrokeAt={session.waterBrokeAt}
          progress={progress}
          showMeter={phaseMeterVisible(session) && !laborFocus}
          meterLabel={patternWindowCopy(session, settings, now)}
          contractionRunning={Boolean(active)}
        />

        {laborFocus || done.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center",
              (laborFocus || done.length === 0) && "min-h-0 flex-1 justify-center",
            )}
          >
            <TimerRing
              progress={ringProgress}
              label={label}
              ms={elapsed}
              active={Boolean(active)}
              tone={tone}
            />
          </div>
        ) : null}

        {laborFocus ? null : (
          <>
            <StatsRow session={session} stats={stats} />

            {stats.lastInterval != null ? (
              <p className="text-center text-xs text-muted">
                מרווח אחרון {formatClock(stats.lastInterval)}
                {stats.lastDuration != null ? ` · משך אחרון ${formatClock(stats.lastDuration)}` : ""}
              </p>
            ) : null}

            {done.length > 0 ? (
              <ContractionList
                session={session}
                limit={4}
                intervalCapMs={settings.intervalMinutes * 2 * 60_000}
              />
            ) : null}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-bg px-5 pb-3 pt-3">
        {askingIntensity ? (
          <IntensityPicker
            onPick={(value) => {
              if (pendingIntensityId) setIntensity(pendingIntensityId, value);
            }}
            onSkip={dismissIntensity}
          />
        ) : active ? (
          <div className="flex flex-col gap-2">
            <Button variant="hugeStop" size="huge" onClick={onEnd}>
              נגמר
            </Button>
            <Button variant="ghost" onClick={cancelContraction}>
              לחצתי בטעות
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="huge" size="huge" onClick={onStart}>
              התחיל
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {waterButton}
              <Button
                variant="secondary"
                disabled={session.contractions.length === 0}
                onClick={() => {
                  undoLast();
                  toast("הציר האחרון בוטל");
                }}
              >
                <Undo2 className="size-4" />
                בטלי אחרון
              </Button>
            </div>
          </div>
        )}
      </div>

      {confirmWater ? (
        <ConfirmSheet
          title="המים ירדו?"
          body="פני לחדר לידה, גם אם הצירים עוד רחוקים. אפשר לבטל אם לחצת בטעות."
          confirmLabel="כן, המים ירדו"
          danger
          onConfirm={() => {
            setWaterBroke(true);
            setConfirmWater(false);
          }}
          onCancel={() => setConfirmWater(false)}
        />
      ) : null}
    </main>
  );
}
