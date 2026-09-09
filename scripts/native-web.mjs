#!/usr/bin/env node
/**
 * Static SPA build for Capacitor. Leaves the default Nitro/PWA web build alone.
 * Output: dist/client (capacitor.config.ts webDir).
 */
import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...extraEnv },
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

function ensureIndexHtml() {
  const clientDir = join(root, "dist/client");
  const index = join(clientDir, "index.html");
  const shell = join(clientDir, "_shell.html");
  if (!existsSync(index) && existsSync(shell)) {
    copyFileSync(shell, index);
    console.log("[native] copied dist/client/_shell.html \u2192 index.html");
  }
  if (!existsSync(index)) {
    throw new Error("Native web build produced no index.html or _shell.html in dist/client");
  }
}

const step = process.argv[2] ?? "build";

if (step === "build") {
  await run("node", ["scripts/with-app-env.mjs", "vite", "build"], { TZARIM_NATIVE: "1" });
  ensureIndexHtml();
} else if (step === "sync") {
  await run("node", ["scripts/with-app-env.mjs", "vite", "build"], { TZARIM_NATIVE: "1" });
  ensureIndexHtml();
  await run("npx", ["cap", "sync"]);
} else if (step === "init") {
  await run("node", ["scripts/with-app-env.mjs", "vite", "build"], { TZARIM_NATIVE: "1" });
  ensureIndexHtml();
  if (!existsSync(join(root, "android"))) {
    await run("npx", ["cap", "add", "android"]);
  }
  if (!existsSync(join(root, "ios"))) {
    await run("npx", ["cap", "add", "ios"]);
  }
  await run("npx", ["cap", "sync"]);
} else {
  throw new Error(`Unknown native-web step: ${step}`);
}
