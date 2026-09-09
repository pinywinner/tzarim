import { createFileRoute } from "@tanstack/react-router";
import { Undo2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BrandWave, EmptyWave } from "@/components/brand-wave";
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
import { useT } from "@/hooks/use-t";

export const Route = createFileRoute("/")({ component: TimerPage });

function TimerPage() {
  const { t } = useT();
  const session = useCurrentSession();
  const settings = useAppStore((state) => state.settings);
  const startContraction = useAppStore((state) => state.startContraction);
  const endContraction = useAppStore((state) => state.endContraction);
  const cancelContraction = useAppStore((state) => state.cancelContraction);
  const undoLast = useAppStore((state) => state.undoLast);
  const pendingIntensityId = useAppStore((state) => state.pendingIntensityId);
  const setIntensity = useAppStore((state) => state.setIntensity);
  const dismissIntensity = useAppStore((state) => state.dismissIntensity);

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

  if (laborFocus) {
    return (
      <main className="flex min-h-0 flex-1 flex-col">
        <ContractionStage elapsed={elapsed} onEnd={onEnd} onCancel={cancelContraction} />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <TopBar title={t("appName")} subtitle={t("appTagline")} />
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

      <div data-intro-chrome className="shrink-0 border-t border-border bg-transparent px-5 pb-3 pt-3">
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
            {t("start")}
          </Button>
          {session.contractions.length > 0 ? (
            <Button
              variant="ghost"
              className="w-full text-base font-semibold text-fg"
              onClick={() => {
                undoLast();
                toast(t("undoToast"));
              }}
            >
              <Undo2 className="size-4" />
              {t("undoLast")}
            </Button>
          ) : null}
        </div>
      </div>
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
  const { t } = useT();
  return (
    <>
      <div className="labor-enter flex min-h-0 flex-1 flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-8">
          <div className="flex flex-col items-center">
            <p data-intro-chrome className="labor-enter-label text-lg font-semibold tracking-wide text-active">{t("laborActive")}</p>
            <BrandWave mark="home" breathing className="mt-5 w-48" />
            <span data-intro-chrome>
              <RollingClock ms={elapsed} className="labor-enter-timer labor-timer mt-4 font-display text-fg" />
            </span>
            <p data-intro-chrome className="cue-breathe mt-5 font-display text-2xl font-bold text-fg">{t("breathe")}</p>
          </div>
        </div>
      </div>
      <div data-intro-chrome className="labor-enter-cta shrink-0 px-5 pb-3 pt-1">
        <div className="relative">
          <div className="cta-breathe pointer-events-none absolute inset-0 rounded-xl" aria-hidden="true" />
          <Button variant="hugeStop" size="huge" className="relative" onClick={onEnd}>
            {t("stop")}
          </Button>
        </div>
        <Button variant="ghost" className="mt-1 w-full text-base font-semibold text-fg" onClick={onCancel}>
          {t("accidental")}
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
  const { t, locale } = useT();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 py-4 text-center">
      <BrandWave mark="home" className="w-24" />
      <div data-intro-chrome>
        <p className="text-sm font-medium text-muted">{t("theInterval")}</p>
        <p dir="ltr" className="mt-2 font-display text-labor font-black tabular-nums leading-none tracking-tight text-fg">
          {intervalMs != null ? formatClock(intervalMs) : "—"}
        </p>
      </div>
      <div data-intro-chrome>
        <p className="text-sm font-medium text-muted">{t("lastContraction")}</p>
        <p className="mt-2 font-display text-4xl font-black tabular-nums leading-none text-fg">
          {lastDuration != null ? formatDurationSpoken(lastDuration, locale) : "—"}
        </p>
      </div>
      {reading ? (
        <p data-intro-chrome className="max-w-sm text-sm leading-relaxed text-muted">{reading}</p>
      ) : null}
    </div>
  );
}

function IdleStage() {
  const { t } = useT();
  return <EmptyWave className="flex-1 py-8" title={t("idleTitle")} body={t("idleBody")} />;
}

