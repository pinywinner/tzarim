import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { en, he, t } from "./i18n.ts";

describe("i18n", () => {
  it("keeps the same keys in Hebrew and English", () => {
    assert.deepEqual(Object.keys(en).sort(), Object.keys(he).sort());
  });

  it("interpolates placeholders", () => {
    assert.equal(t("en", "durationSeconds", { n: 58 }), "58 seconds");
    assert.equal(t("he", "durationSeconds", { n: 58 }), "58 שניות");
  });

  it("uses English copy for the home start action", () => {
    assert.equal(t("en", "start"), "Start");
    assert.equal(t("en", "stop"), "Done");
    assert.equal(t("en", "appName"), "Tzarim");
  });
});
