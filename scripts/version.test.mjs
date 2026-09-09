import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";
import {
  applyVersion,
  bumpSemver,
  nextVersion,
  parseSemver,
  parseVersionArgs,
  stampChangelog,
} from "./version.mjs";

const execFileAsync = promisify(execFile);
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "version.mjs");

test("parseSemver accepts X.Y.Z only", () => {
  assert.deepEqual(parseSemver("1.2.3"), { major: 1, minor: 2, patch: 3 });
  assert.match(parseSemver("1.0").error, /not a semver/);
  assert.match(parseSemver("v1.0.0").error, /not a semver/);
});

test("bumpSemver rolls major/minor/patch", () => {
  assert.equal(bumpSemver("1.2.3", "patch"), "1.2.4");
  assert.equal(bumpSemver("1.2.3", "minor"), "1.3.0");
  assert.equal(bumpSemver("1.2.3", "major"), "2.0.0");
  assert.match(bumpSemver("1.2.3", "hotfix").error, /unknown bump/);
});

test("nextVersion always increments versionCode", () => {
  const doc = { name: "מעקב צירים", version: "1.0.0", versionCode: 4 };
  assert.deepEqual(nextVersion(doc, "bump", "patch"), {
    name: "מעקב צירים",
    version: "1.0.1",
    versionCode: 5,
  });
  assert.deepEqual(nextVersion(doc, "set", "2.0.0"), {
    name: "מעקב צירים",
    version: "2.0.0",
    versionCode: 5,
  });
});

test("parseVersionArgs", () => {
  assert.deepEqual(parseVersionArgs(["show"]), { action: "show" });
  assert.deepEqual(parseVersionArgs(["bump", "minor"]), { action: "bump", value: "minor" });
  assert.deepEqual(parseVersionArgs(["set", "1.4.0"]), { action: "set", value: "1.4.0" });
  assert.match(parseVersionArgs(["bump"]).error, /usage:/);
  assert.match(parseVersionArgs(["nope"]).error, /usage:/);
});

test("stampChangelog inserts a dated heading under Unreleased", () => {
  const dir = mkdtempSync(join(tmpdir(), "changelog-"));
  const path = join(dir, "CHANGELOG.md");
  writeFileSync(path, "# Changelog\n\n## Unreleased\n\n- pending\n");
  stampChangelog(path, "1.0.1", "2026-09-09");
  const text = readFileSync(path, "utf8");
  assert.match(text, /## Unreleased\n\n## 1.0.1 — 2026-09-09\n\n- pending/);
  stampChangelog(path, "1.0.1", "2026-09-10");
  assert.equal(readFileSync(path, "utf8"), text);
});

test("applyVersion writes json, package, generated ts and iOS versions", () => {
  const root = mkdtempSync(join(tmpdir(), "version-root-"));
  mkdirSync(join(root, "src/lib"), { recursive: true });
  mkdirSync(join(root, "ios/App/App.xcodeproj"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "app", version: "0.0.1" }, null, 2));
  writeFileSync(
    join(root, "ios/App/App.xcodeproj/project.pbxproj"),
    "CURRENT_PROJECT_VERSION = 1;\nMARKETING_VERSION = 1.0;\nCURRENT_PROJECT_VERSION = 1;\nMARKETING_VERSION = 1.0;\n",
  );
  writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n## Unreleased\n\n");
  applyVersion(root, { name: "מעקב צירים", version: "1.2.0", versionCode: 7 });
  assert.deepEqual(JSON.parse(readFileSync(join(root, "version.json"), "utf8")), {
    name: "מעקב צירים",
    version: "1.2.0",
    versionCode: 7,
  });
  assert.equal(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version, "1.2.0");
  const generated = readFileSync(join(root, "src/lib/app-version.ts"), "utf8");
  assert.match(generated, /APP_VERSION = "1.2.0"/);
  assert.match(generated, /APP_VERSION_CODE = 7/);
  const pbx = readFileSync(join(root, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
  assert.equal(pbx.includes("CURRENT_PROJECT_VERSION = 1;"), false);
  assert.match(pbx, /CURRENT_PROJECT_VERSION = 7;/);
  assert.match(pbx, /MARKETING_VERSION = 1.2.0;/);
});

test("cli: show prints version and code from this workspace", async () => {
  const { stdout } = await execFileAsync(process.execPath, [SCRIPT, "show"], {
    cwd: join(dirname(fileURLToPath(import.meta.url)), ".."),
  });
  assert.equal(stdout.trim(), "1.0.0 (1)");
});
