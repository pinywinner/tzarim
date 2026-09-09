import {
  completedContractions,
  evaluatePhase,
  formatClock,
  intervalTrend,
  sessionStats,
  startToStartIntervals,
  type Session,
  type Settings,
} from "./contractions.ts";

export function patternLabel(settings: Settings): string {
  if (
    settings.intervalMinutes === 5 &&
    settings.durationSeconds === 60 &&
    settings.patternMinutes === 60
  ) {
    return "5-1-1";
  }
  if (
    settings.intervalMinutes === 7 &&
    settings.durationSeconds === 45 &&
    settings.patternMinutes === 30
  ) {
    return "7-0.75-0.5";
  }
  return `כל ${settings.intervalMinutes} דק׳`;
}

function recentTrendWindowMinutes(session: Session): number | null {
  const done = completedContractions(session);
  const ints = startToStartIntervals(done);
  if (ints.length < 3) return null;
  const span = ints.slice(-3).reduce((sum, value) => sum + value, 0);
  const minutes = Math.round(span / 60_000);
  if (minutes < 8) return null;
  if (minutes <= 12) return 10;
  if (minutes <= 17) return 15;
  if (minutes <= 25) return 20;
  if (minutes <= 40) return 30;
  return Math.round(minutes / 10) * 10;
}

export function interpretLabor(
  session: Session,
  settings: Settings,
  now = Date.now(),
): string | null {
  const done = completedContractions(session);
  if (done.length === 0) return null;

  const phase = evaluatePhase(session, settings, now);
  if (phase === "go") {
    return `לפי ההגדרה שבחרת, הגעת לדפוס ${patternLabel(settings)}.`;
  }

  const trend = intervalTrend(session.contractions);
  const windowMin = recentTrendWindowMinutes(session);
  if (trend === "shorter" && windowMin) {
    return `הצירים נעשו סדירים יותר ב-${windowMin} הדקות האחרונות.`;
  }
  if (trend === "longer") {
    return "המרווחים מתארכים. המשיכי למדוד.";
  }

  const stats = sessionStats(session, now);
  if (stats.avgInterval) {
    return `כרגע המרווח הממוצע הוא ${formatClock(stats.avgInterval)}.`;
  }

  return null;
}
