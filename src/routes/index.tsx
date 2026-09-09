import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandWave } from "@/components/brand-wave";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { IntensityPicker } from "@/components/intensity-picker";
import { RollingClock } from "@/components/rolling-clock";
import { StatusBanner } from "@/components/status-banner";
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
  formatDurationSpoken,
  intervalSoFar,
  patternWindowCopy,
  phaseMeterVisible,
  phaseProgress,
  sessionStats,
} from "@/lib/contractions";
import { hapticEnd, hapticStart } from "@/lib/haptics";
import { interpretLabor } from "@/lib/interpret";
import { useAppStore, useCurrentSession } from "@/lib/store";
import { bindWakeLockVisibility, setWakeLock } from "@/lib/wake-lock";

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
  const elapsed = active ? durationOf(active, now) : 0;
  const intervalMs = intervalSoFar(session, now);
  const reading = laborFocus ? null : interpretLabor(session, settings, now);
  const askingIntensity = Boolean(pendingIntensityId) && !active;

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

  if (laborFocus) {
    return (
      <main className="flex min-h-0 flex-1 flex-col">
        <ContractionStage elapsed={elapsed} onEnd={onEnd} onCancel={cancelContraction} />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title="מעקב צירים" subtitle="מעקב בבית, עד שיוצאים" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <StatusBanner
          phase={phase}
          waterBroke={Boolean(session.waterBrokeAt)}
          waterBrokeAt={session.waterBrokeAt}
          progress={progress}
          showMeter={phaseMeterVisible(session)}
          meterLabel={patternWindowCopy(session, settings, now)}
          contractionRunning={false}
        />
        {done.length > 0 ? (
          <RestStage
            lastDuration={stats.lastDuration}
            intervalMs={intervalMs}
            reading={reading}
          />
        ) : (
          <IdleStage />
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-transparent px-5 pb-3 pt-3">
        <div className="flex flex-col gap-3">
          {askingIntensity ? (
            <IntensityPicker
              compact
              onPick={(value) => {
                if (pendingIntensityId) setIntensity(pendingIntensityId, value);
              }}
              onSkip={dismissIntensity}
            />
          ) : null}
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

function ContractionStage({
  elapsed,
  onEnd,
  onCancel,
}: {
  elapsed: number;
  onEnd: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="labor-enter flex min-h-0 flex-1 flex-col items-center justify-center px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="labor-enter-label text-sm font-medium tracking-wide text-active">ציר פעיל</p>
        <BrandWave breathing className="mt-8 w-36" />
        <RollingClock
          ms={elapsed}
          className="labor-enter-timer mt-5 font-display text-labor font-black leading-none tracking-tight text-fg"
        />
        <p className="cue-breathe mt-8 font-display text-2xl font-bold text-muted">נשמי.</p>
      </div>
      <div className="labor-enter-cta shrink-0 px-5 pb-3 pt-3">
        <div className="cta-breathe">
          <Button variant="hugeStop" size="huge" onClick={onEnd}>
            סיימתי
          </Button>
        </div>
        <Button variant="ghost" className="mt-2 w-full" onClick={onCancel}>
          לחצתי בטעות
        </Button>
      </div>
    </>
  );
}

function RestStage({
  lastDuration,
  intervalMs,
  reading,
}: {
  lastDuration: number | null;
  intervalMs: number | null;
  reading: string | null;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 py-4 text-center">
      <div>
        <p className="text-sm font-medium text-muted">הציר האחרון</p>
        <p className="mt-2 font-display text-4xl font-black tabular-nums leading-none text-fg">
          {lastDuration != null ? formatDurationSpoken(lastDuration) : "—"}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted">המרווח</p>
        <p className="mt-2 font-display text-labor font-black tabular-nums leading-none tracking-tight text-fg">
          {intervalMs != null ? formatClock(intervalMs) : "—"}
        </p>
      </div>
      {reading ? (
        <p className="max-w-sm text-sm leading-relaxed text-muted">{reading}</p>
      ) : null}
    </div>
  );
}

function IdleStage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-8 text-center">
      <BrandWave className="mx-auto mb-6 w-28 text-active/80" />
      <p className="font-display text-2xl font-bold text-fg">כשהציר מתחיל</p>
      <p className="mt-2 text-sm text-muted">לחצי ״התחיל״. זהו.</p>
    </div>
  );
}
