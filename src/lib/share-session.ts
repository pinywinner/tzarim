import { format } from "date-fns";
import {
  completedContractions,
  durationOf,
  evaluatePhase,
  formatClock,
  sessionStats,
  startToStartIntervals,
  type LaborPhase,
  type Session,
  type Settings,
} from "@/lib/contractions";
import { dateLocaleOf, t, type Locale, type MessageKey } from "@/lib/i18n";
import { isNativeApp } from "@/lib/native";

const PHASE_KEY: Record<LaborPhase, MessageKey> = {
  idle: "phaseShareIdle",
  early: "phaseShareEarly",
  establishing: "phaseShareEstablishing",
  active: "phaseShareActive",
  go: "phaseShareGo",
};

export function sessionSummary(session: Session, settings: Settings): string {
  const locale: Locale = settings.locale ?? "he";
  const dates = dateLocaleOf(locale);
  const done = completedContractions(session);
  const stats = sessionStats(session);
  const phase = evaluatePhase(session, settings);
  const intervals = startToStartIntervals(done);
  const elapsed = (session.endedAt ?? Date.now()) - session.startedAt;
  const lines = [
    t(locale, "shareHeadline"),
    t(locale, "shareStart", { when: format(session.startedAt, "d.M.yyyy HH:mm", { locale: dates }) }),
    session.endedAt
      ? t(locale, "shareEnd", { when: format(session.endedAt, "HH:mm", { locale: dates }) })
      : t(locale, "shareOpen"),
    t(locale, "shareElapsed", { clock: formatClock(elapsed) }),
    t(locale, "shareCount", { n: stats.count }),
    stats.count ? t(locale, "shareAvgDuration", { clock: formatClock(stats.avgDuration) }) : "",
    stats.avgInterval ? t(locale, "shareAvgInterval", { clock: formatClock(stats.avgInterval) }) : "",
    t(locale, "sharePhase", { phase: t(locale, PHASE_KEY[phase]) }),
    session.waterBrokeAt
      ? t(locale, "shareWaterYes", { when: format(session.waterBrokeAt, "HH:mm", { locale: dates }) })
      : t(locale, "shareWaterNo"),
    "",
    t(locale, "shareDetail"),
  ].filter((line) => line !== "");

  done.forEach((contraction, index) => {
    const time = format(contraction.startedAt, "HH:mm", { locale: dates });
    const dur = formatClock(durationOf(contraction));
    const interval = index > 0 ? formatClock(intervals[index - 1] ?? 0) : "—";
    const intensity = contraction.intensity ? t(locale, "shareIntensity", { n: contraction.intensity }) : "";
    lines.push(t(locale, "shareRow", { time, dur, interval, intensity }));
  });

  lines.push("", t(locale, "shareFooter"));
  return lines.join("\n");
}

export async function shareSession(session: Session, settings: Settings): Promise<"shared" | "copied" | "failed"> {
  const locale: Locale = settings.locale ?? "he";
  const text = sessionSummary(session, settings);
  const title = t(locale, "shareTitle");

  if (isNativeApp()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, dialogTitle: title });
      return "shared";
    } catch (error) {
      if (error instanceof Error && /cancel|abort/i.test(error.message)) return "failed";
    }
  }

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text });
      return "shared";
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "failed";
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
