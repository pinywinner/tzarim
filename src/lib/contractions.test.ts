import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  evaluatePhase,
  phaseMeterVisible,
  type Contraction,
  type Session,
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
});
