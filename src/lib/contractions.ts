import { createId } from "./utils.ts";

export type Intensity = 1 | 2 | 3 | 4 | 5;

export type Contraction = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  intensity: Intensity | null;
};

export type Session = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  contractions: Contraction[];
  waterBrokeAt: number | null;
};

export type BirthType = "first" | "subsequent" | "custom";
export type ThemeMode = "light" | "dark";

export type Settings = {
  birthType: BirthType;
  intervalMinutes: number;
  durationSeconds: number;
  patternMinutes: number;
  theme: ThemeMode;
  keepAwake: boolean;
  vibration: boolean;
  sound: boolean;
};

export type LaborPhase = "idle" | "early" | "establishing" | "active" | "go";

export const PRESETS: Record<
  Exclude<BirthType, "custom">,
  Pick<Settings, "intervalMinutes" | "durationSeconds" | "patternMinutes">
> = {
  first: { intervalMinutes: 5, durationSeconds: 60, patternMinutes: 60 },
  subsequent: { intervalMinutes: 7, durationSeconds: 45, patternMinutes: 30 },
};

export const DEFAULT_SETTINGS: Settings = {
  birthType: "first",
  ...PRESETS.first,
  theme: "light",
  keepAwake: true,
  vibration: true,
  sound: false,
};

export function createSession(now = Date.now()): Session {
  return {
    id: createId(),
    startedAt: now,
    endedAt: null,
    contractions: [],
    waterBrokeAt: null,
  };
}

export function createContraction(now = Date.now()): Contraction {
  return {
    id: createId(),
    startedAt: now,
    endedAt: null,
    intensity: null,
  };
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function durationOf(contraction: Contraction, now = Date.now()): number {
  const end = contraction.endedAt ?? now;
  return Math.max(0, end - contraction.startedAt);
}

export function completedContractions(session: Session): Contraction[] {
  return session.contractions
    .filter((contraction) => contraction.endedAt != null)
    .sort((a, b) => a.startedAt - b.startedAt);
}

export function activeContraction(session: Session): Contraction | undefined {
  return session.contractions.find((contraction) => contraction.endedAt == null);
}

export function startToStartIntervals(contractions: Contraction[]): number[] {
  const sorted = [...contractions].sort((a, b) => a.startedAt - b.startedAt);
  const result: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    if (!current || !previous) continue;
    result.push(current.startedAt - previous.startedAt);
  }
  return result;
}

export function restGaps(contractions: Contraction[]): number[] {
  const sorted = completedContractions({
    id: "",
    startedAt: 0,
    endedAt: null,
    contractions,
    waterBrokeAt: null,
  });
  const result: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    if (!current || !previous?.endedAt) continue;
    result.push(current.startedAt - previous.endedAt);
  }
  return result;
}

export function lastInterval(session: Session): number | null {
  const intervals = startToStartIntervals(session.contractions);
  return intervals.length ? (intervals[intervals.length - 1] ?? null) : null;
}

export function intervalSoFar(session: Session, now = Date.now()): number | null {
  const sorted = [...session.contractions].sort((a, b) => a.startedAt - b.startedAt);
  if (sorted.length === 0) return null;
  const last = sorted[sorted.length - 1];
  if (!last) return null;
  if (last.endedAt == null) {
    const previous = sorted[sorted.length - 2];
    return previous ? last.startedAt - previous.startedAt : null;
  }
  return now - last.startedAt;
}

export type SessionStats = {
  count: number;
  avgDuration: number;
  avgInterval: number;
  lastDuration: number | null;
  lastInterval: number | null;
  longest: number | null;
  shortest: number | null;
};

export function sessionStats(session: Session, now = Date.now()): SessionStats {
  const done = completedContractions(session);
  const durations = done.map((contraction) => durationOf(contraction, now));
  const intervals = startToStartIntervals(done);
  const lastDone = done[done.length - 1];
  return {
    count: done.length,
    avgDuration: average(durations),
    avgInterval: average(intervals),
    lastDuration: lastDone ? durationOf(lastDone, now) : null,
    lastInterval: intervals.length ? (intervals[intervals.length - 1] ?? null) : null,
    longest: durations.length ? Math.max(...durations) : null,
    shortest: durations.length ? Math.min(...durations) : null,
  };
}

export function intervalTrend(
  contractions: Contraction[],
): "shorter" | "longer" | "stable" | null {
  const ints = startToStartIntervals(contractions.filter((c) => c.endedAt != null));
  if (ints.length < 4) return null;
  const recent = average(ints.slice(-3));
  const previous = average(ints.slice(-6, -3));
  if (!previous) return null;
  const delta = recent - previous;
  if (Math.abs(delta) < 20_000) return "stable";
  return delta < 0 ? "shorter" : "longer";
}

export function neededCount(settings: Settings): number {
  const perWindow = Math.round(settings.patternMinutes / settings.intervalMinutes);
  // 5-1-1: ~12 in an hour. 7-0.75-0.5: 6 starts cannot fit in 30 min at 7-min
  // spacing, so the floor drops to 5 — otherwise subsequent never reaches "go".
  const floor = settings.patternMinutes <= 30 ? 5 : 6;
  return Math.max(floor, perWindow);
}

export function evaluatePhase(
  session: Session,
  settings: Settings,
  now = Date.now(),
): LaborPhase {
  const done = completedContractions(session);
  if (done.length === 0) return "idle";

  const windowMs = settings.patternMinutes * 60_000;
  const inWindow = done.filter((contraction) => now - contraction.startedAt <= windowMs);
  const sample = inWindow.length >= 3 ? inWindow : done.slice(-Math.min(done.length, 8));
  if (sample.length < 2) return "early";

  const durations = sample.map((contraction) => durationOf(contraction, now));
  const ints = startToStartIntervals(sample);
  const avgDur = average(durations);
  const avgInt = ints.length ? average(ints) : Number.POSITIVE_INFINITY;
  const span = now - (sample[0]?.startedAt ?? now);

  const targetInt = settings.intervalMinutes * 60_000;
  const targetDur = settings.durationSeconds * 1000;
  const freqOk = avgInt <= targetInt * 1.12;
  const durOk = avgDur >= targetDur * 0.85;
  const countOk = sample.length >= neededCount(settings);
  const spanOk = span >= windowMs * 0.85;

  if (freqOk && durOk && countOk && spanOk) return "go";
  if (freqOk && durOk && sample.length >= 5 && span >= settings.intervalMinutes * 4 * 60_000) {
    return "active";
  }
  if (avgInt <= targetInt * 1.65 && sample.length >= 3) return "establishing";
  return "early";
}

export function phaseMeterVisible(session: Session): boolean {
  return completedContractions(session).length >= 3;
}

export function phaseProgress(
  session: Session,
  settings: Settings,
  now = Date.now(),
): number {
  const done = completedContractions(session);
  if (done.length === 0) return 0;

  const targetInt = settings.intervalMinutes * 60_000;
  const targetDur = settings.durationSeconds * 1000;
  const need = neededCount(settings);
  const windowMs = settings.patternMinutes * 60_000;
  const inWindow = done.filter((contraction) => now - contraction.startedAt <= windowMs);
  const sample = inWindow.length >= 2 ? inWindow : done;
  const ints = startToStartIntervals(sample);
  const avgInt = ints.length ? average(ints) : targetInt * 3;
  const avgDur = average(sample.map((c) => durationOf(c, now)));
  const span = now - (sample[0]?.startedAt ?? now);

  const freqScore = clamp(targetInt / Math.max(avgInt, 1), 0, 1);
  const durScore = clamp(avgDur / targetDur, 0, 1);
  const countScore = clamp(sample.length / need, 0, 1);
  const spanScore = clamp(span / windowMs, 0, 1);

  return clamp(freqScore * 0.35 + durScore * 0.25 + countScore * 0.2 + spanScore * 0.2, 0, 1);
}

export function patternWindowCopy(
  session: Session,
  settings: Settings,
  now = Date.now(),
): string {
  const windowMs = settings.patternMinutes * 60_000;
  const windowMin = settings.patternMinutes;
  const done = completedContractions(session);
  if (done.length === 0) return "";
  const inWindow = done.filter((contraction) => now - contraction.startedAt <= windowMs);
  const sample = inWindow.length >= 2 ? inWindow : done;
  const span = now - (sample[0]?.startedAt ?? now);
  const spanMin = Math.min(windowMin, Math.max(0, Math.round(span / 60_000)));
  if (windowMin === 60) return `${spanMin} דק׳ מהשעה בדפוס`;
  if (windowMin === 30) return `${spanMin} דק׳ מחצי השעה בדפוס`;
  return `${spanMin} מתוך ${windowMin} דק׳ בדפוס`;
}

export function formatClock(ms: number): string {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  if (totalSec >= 3600) {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${pad(seconds)}`;
}

export function formatSecondsHe(ms: number): string {
  const totalSec = Math.round(Math.max(0, ms) / 1000);
  if (totalSec < 60) return `${totalSec} שנ׳`;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (seconds === 0) return `${minutes} דק׳`;
  return `${minutes}:${pad(seconds)} דק׳`;
}

export function formatDurationSpoken(ms: number): string {
  const totalSec = Math.round(Math.max(0, ms) / 1000);
  if (totalSec === 1) return "שנייה אחת";
  if (totalSec < 60) return `${totalSec} שניות`;
  if (totalSec === 60) return "דקה";
  return formatClock(ms);
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const STALE_ACTIVE_MS = 3 * 60 * 1000;
