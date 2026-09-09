import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  completedContractions,
  durationOf,
  evaluatePhase,
  formatClock,
  sessionStats,
  startToStartIntervals,
  type Session,
  type Settings,
} from "@/lib/contractions";
import { isNativeApp } from "@/lib/native";

const PHASE_LABEL = {
  idle: "עוד לא התחיל",
  early: "נשארות בבית",
  establishing: "הצירים מתקרבים",
  active: "הדפוס מתמלא",
  go: "זמן לצאת לחדר לידה",
} as const;

export function sessionSummary(session: Session, settings: Settings): string {
  const done = completedContractions(session);
  const stats = sessionStats(session);
  const phase = evaluatePhase(session, settings);
  const intervals = startToStartIntervals(done);
  const elapsed = (session.endedAt ?? Date.now()) - session.startedAt;
  const lines = [
    "סיכום למיילדת — מעקב צירים בבית",
    `התחלה: ${format(session.startedAt, "d.M.yyyy HH:mm", { locale: he })}`,
    session.endedAt ? `סיום: ${format(session.endedAt, "HH:mm", { locale: he })}` : "מעקב פתוח",
    `משך המעקב: ${formatClock(elapsed)}`,
    `צירים: ${stats.count}`,
    stats.count ? `משך ממוצע: ${formatClock(stats.avgDuration)}` : "",
    stats.avgInterval ? `מרווח ממוצע: ${formatClock(stats.avgInterval)}` : "",
    `מצב: ${PHASE_LABEL[phase]}`,
    session.waterBrokeAt
      ? `מים ירדו: כן, ${format(session.waterBrokeAt, "HH:mm", { locale: he })}`
      : "מים ירדו: לא",
    "",
    "פירוט:",
  ].filter((line) => line !== "");

  done.forEach((contraction, index) => {
    const time = format(contraction.startedAt, "HH:mm", { locale: he });
    const dur = formatClock(durationOf(contraction));
    const interval = index > 0 ? formatClock(intervals[index - 1] ?? 0) : "—";
    const intensity = contraction.intensity ? ` עוצמה ${contraction.intensity}` : "";
    lines.push(`${time}  משך ${dur}  מרווח ${interval}${intensity}`);
  });

  lines.push("", "זה מעקב בבית בלבד, לא ייעוץ רפואי.");
  return lines.join("\n");
}

export async function shareSession(session: Session, settings: Settings): Promise<"shared" | "copied" | "failed"> {
  const text = sessionSummary(session, settings);
  const title = "סיכום מעקב צירים למיילדת";

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
