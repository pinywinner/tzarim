import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  STALE_ACTIVE_MS,
  createSession,
  durationOf,
  evaluatePhase,
  formatDurationSpoken,
  intervalSoFar,
  lastInterval,
  neededCount,
  patternWindowCopy,
  phaseMeterVisible,
  PRESETS,
  startToStartIntervals,
  type Contraction,
  type Session,
  type Settings,
} from "./contractions.ts";

function contraction(startedAt: number, durationMs: number, id: string): Contraction {
  return { id, startedAt, endedAt: startedAt + durationMs, intensity: 3 };
}

function sessionWith(rows: Contraction[], nowOffset = 0): { session: Session; now: number } {
  const now = rows.length ? (rows[rows.length - 1]!.endedAt ?? 0) + nowOffset : Date.now();
  return {
    now,
    session: {
      id: "s1",
      startedAt: rows[0]?.startedAt ?? now,
      endedAt: null,
      contractions: rows,
      waterBrokeAt: null,
    },
  };
}

const subsequent: Settings = {
  ...DEFAULT_SETTINGS,
  birthType: "subsequent",
  ...PRESETS.subsequent,
};

describe("durationOf", () => {
  it("uses endedAt when the contraction is closed", () => {
    const closed = contraction(1_000, 5_000, "a");
    assert.equal(durationOf(closed, 99_000), 5_000);
  });

  it("uses now when the contraction is still open", () => {
    const open: Contraction = { id: "b", startedAt: 1_000, endedAt: null, intensity: null };
    assert.equal(durationOf(open, 4_000), 3_000);
  });
});

describe("intervals", () => {
  it("measures start-to-start, not rest gaps", () => {
    const rows = [contraction(0, 60_000, "a"), contraction(5 * 60_000, 60_000, "b")];
    assert.deepEqual(startToStartIntervals(rows), [5 * 60_000]);
    const { session } = sessionWith(rows);
    assert.equal(lastInterval(session), 5 * 60_000);
  });

  it("ticks the current interval from the last start after a contraction ends", () => {
    const rows = [contraction(0, 58_000, "a")];
    const { session } = sessionWith(rows);
    assert.equal(intervalSoFar(session, 3 * 60_000), 3 * 60_000);
  });
});

describe("neededCount", () => {
  it("asks for twelve waves in the first-birth hour", () => {
    assert.equal(neededCount(DEFAULT_SETTINGS), 12);
  });

  it("asks for five waves in the subsequent half-hour", () => {
    assert.equal(neededCount(subsequent), 5);
  });
});

describe("evaluatePhase", () => {
  it("is idle with no contractions", () => {
    const { session, now } = sessionWith([]);
    assert.equal(evaluatePhase(session, DEFAULT_SETTINGS, now), "idle");
  });

  it("stays early after one short contraction even if duration looks long", () => {
    const { session, now } = sessionWith([contraction(0, 70_000, "a")]);
    assert.equal(evaluatePhase(session, DEFAULT_SETTINGS, now), "early");
    assert.equal(phaseMeterVisible(session), false);
  });

  it("does not call three 5-minute waves an active pattern", () => {
    const rows = [0, 1, 2].map((i) => contraction(i * 5 * 60_000, 60_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(evaluatePhase(session, DEFAULT_SETTINGS, now), "establishing");
    assert.equal(phaseMeterVisible(session), true);
  });

  it("goes active once five regular waves span a meaningful window", () => {
    const rows = [0, 1, 2, 3, 4].map((i) => contraction(i * 5 * 60_000, 60_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(evaluatePhase(session, DEFAULT_SETTINGS, now), "active");
  });

  it("reaches go only when 5-1-1 is actually met", () => {
    const rows = Array.from({ length: 12 }, (_, i) =>
      contraction(i * 5 * 60_000, 60_000, `c${i}`),
    );
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(evaluatePhase(session, DEFAULT_SETTINGS, now), "go");
  });

  it("reaches go for subsequent 7-0.75-0.5", () => {
    const rows = [0, 1, 2, 3, 4].map((i) => contraction(i * 7 * 60_000, 45_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(evaluatePhase(session, subsequent, now), "go");
  });

  it("does not call two subsequent waves a go pattern", () => {
    const rows = [0, 1].map((i) => contraction(i * 7 * 60_000, 45_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(evaluatePhase(session, subsequent, now), "early");
  });

  it("does not change phase when water broke", () => {
    const rows = [0, 1, 2].map((i) => contraction(i * 5 * 60_000, 60_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    const wet = { ...session, waterBrokeAt: now };
    assert.equal(
      evaluatePhase(session, DEFAULT_SETTINGS, now),
      evaluatePhase(wet, DEFAULT_SETTINGS, now),
    );
  });
});

describe("stale open contraction", () => {
  it("treats three minutes as the stale threshold", () => {
    assert.equal(STALE_ACTIVE_MS, 3 * 60 * 1000);
    const open: Contraction = { id: "a", startedAt: 0, endedAt: null, intensity: null };
    assert.ok(durationOf(open, STALE_ACTIVE_MS) >= STALE_ACTIVE_MS);
    assert.ok(durationOf(open, STALE_ACTIVE_MS - 1) < STALE_ACTIVE_MS);
  });
});

describe("session reset", () => {
  it("starts empty, without water or contractions", () => {
    const session = createSession(1_000);
    assert.equal(session.contractions.length, 0);
    assert.equal(session.waterBrokeAt, null);
    assert.equal(session.endedAt, null);
    assert.equal(evaluatePhase(session, DEFAULT_SETTINGS, 1_000), "idle");
  });
});

describe("formatDurationSpoken", () => {
  it("speaks short durations in seconds", () => {
    assert.equal(formatDurationSpoken(58_000), "58 שניות");
    assert.equal(formatDurationSpoken(1_000), "שנייה אחת");
  });
});

describe("patternWindowCopy", () => {
  it("names the first-birth hour window in home language", () => {
    const rows = [0, 1, 2].map((i) => contraction(i * 5 * 60_000, 60_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(patternWindowCopy(session, DEFAULT_SETTINGS, now), "12 דק׳ מהשעה בדפוס");
  });

  it("names the subsequent half-hour window", () => {
    const rows = [0, 1].map((i) => contraction(i * 7 * 60_000, 45_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(
      patternWindowCopy(session, subsequent, now),
      "9 דק׳ מחצי השעה בדפוס",
    );
  });
});
