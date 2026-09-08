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

const PHASE_LABEL = {
  idle: "עוד לא התחיל",
  early: "עוד מוקדם",
  establishing: "הצירים מתקרבים",
  active: "הצירים סדירים",
  go: "זמן לחדר לידה",
} as const;

export function sessionSummary(session: Session, settings: Settings): string {
  const done = completedContractions(session);
  const stats = sessionStats(session);
  const phase = evaluatePhase(session, settings);
  const intervals = startToStartIntervals(done);
  const lines = [
    "צירים — סיכום מעקב",
    `התחלה: ${format(session.startedAt, "d.M.yyyy HH:mm", { locale: he })}`,
    session.endedAt ? `סיום: ${format(session.endedAt, "HH:mm", { locale: he })}` : "מעקב פתוח",
    `צירים: ${stats.count}`,
    stats.count ? `משך ממוצע: ${formatClock(stats.avgDuration)}` : "",
    stats.avgInterval ? `מרווח ממוצע: ${formatClock(stats.avgInterval)}` : "",
    `מצב: ${PHASE_LABEL[phase]}`,
    session.waterBrokeAt
      ? `מים ירדו: ${format(session.waterBrokeAt, "HH:mm", { locale: he })}`
      : "",
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

  lines.push("", "זה מעקב בלבד, לא ייעוץ רפואי.");
  return lines.join("\n");
}

export async function shareSession(session: Session, settings: Settings): Promise<"shared" | "copied" | "failed"> {
  const text = sessionSummary(session, settings);
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "סיכום צירים", text });
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
