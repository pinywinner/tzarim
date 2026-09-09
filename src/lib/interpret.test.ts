import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  PRESETS,
  type Contraction,
  type Session,
  type Settings,
} from "./contractions.ts";
import { interpretLabor, patternLabel } from "./interpret.ts";

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

describe("patternLabel", () => {
  it("names the first-birth rule 5-1-1", () => {
    assert.equal(patternLabel(DEFAULT_SETTINGS), "5-1-1");
  });

  it("names the subsequent rule 7-0.75-0.5", () => {
    assert.equal(patternLabel(subsequent), "7-0.75-0.5");
  });
});

describe("interpretLabor", () => {
  it("is silent with no contractions", () => {
    const { session, now } = sessionWith([]);
    assert.equal(interpretLabor(session, DEFAULT_SETTINGS, now), null);
  });

  it("is silent after a single contraction", () => {
    const { session, now } = sessionWith([contraction(0, 58_000, "a")]);
    assert.equal(interpretLabor(session, DEFAULT_SETTINGS, now), null);
  });

  it("reports the average interval once there are two waves", () => {
    const rows = [
      contraction(0, 60_000, "a"),
      contraction(4 * 60_000 + 48_000, 60_000, "b"),
    ];
    const { session, now } = sessionWith(rows, 1_000);
    assert.equal(interpretLabor(session, DEFAULT_SETTINGS, now), "כרגע המרווח הממוצע הוא 4:48.");
  });

  it("says the first-birth pattern is met at go", () => {
    const rows = Array.from({ length: 12 }, (_, i) =>
      contraction(i * 5 * 60_000, 60_000, `c${i}`),
    );
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(
      interpretLabor(session, DEFAULT_SETTINGS, now),
      "לפי ההגדרה שבחרת, הגעת לדפוס 5-1-1.",
    );
  });

  it("says the subsequent pattern is met at go", () => {
    const rows = [0, 1, 2, 3, 4].map((i) => contraction(i * 7 * 60_000, 45_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(
      interpretLabor(session, subsequent, now),
      "לפי ההגדרה שבחרת, הגעת לדפוס 7-0.75-0.5.",
    );
  });

  it("names a shortening trend over the recent window", () => {
    const starts = [0, 5, 10, 14, 17].map((min) => min * 60_000);
    const rows = starts.map((start, i) => contraction(start, 60_000, `c${i}`));
    const { session, now } = sessionWith(rows, 60_000);
    assert.equal(
      interpretLabor(session, DEFAULT_SETTINGS, now),
      "הצירים נעשו סדירים יותר ב-10 הדקות האחרונות.",
    );
  });
});
