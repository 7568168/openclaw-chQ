#!/usr/bin/env bun
/**
 * Simple bun compile wrapper for OpenClaw.
 * Compiles the already-built dist/entry.js into a standalone binary.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  options: {
    target: { type: "string", short: "t" },
    outdir: { type: "string", short: "o", default: "dist-bun" },
    "skip-native": { type: "boolean", default: false },
  },
  allowPositional: true,
  strict: false,
});

const target = values.target;
const outdir = values.outdir || "dist-bun";

console.log("[simple-compile] Building openclaw binary...");
console.log("[simple-compile] target:", target || "current platform");
console.log("[simple-compile] outdir:", outdir);

// Use the already-built dist/entry.js from pnpm build
const entrypoint = resolve("dist/entry.js");
if (!existsSync(entrypoint)) {
  // Fallback to openclaw.mjs launcher
  const fallback = resolve("openclaw.mjs");
  if (!existsSync(fallback)) {
    console.error("[simple-compile] Neither dist/entry.js nor openclaw.mjs found. Run 'pnpm build' first.");
    process.exit(1);
  }
  console.log("[simple-compile] Using fallback entry:", fallback);
}

const entry = existsSync(entrypoint) ? entrypoint : resolve("openclaw.mjs");
const binaryName = process.platform === "win32" ? "openclaw.exe" : "openclaw";
const outfile = resolve(outdir, binaryName);

const compileOptions = { outfile };
if (target) {
  compileOptions.target = target;
}

console.log("[simple-compile] Compiling with Bun.build()...");
console.log("[simple-compile] Entry:", entry);

const result = await Bun.build({
  entrypoints: [entry],
  compile: compileOptions,
  // Disable splitting to avoid chunk collision bug in Bun compile mode
  splitting: false,
});

if (!result.success) {
  console.error("[simple-compile] Build failed:");
  for (const log of result.logs) {
    console.error("  ", log.message || log);
  }
  process.exit(1);
}

console.log("[simple-compile] Build succeeded.");
console.log(
  "[simple-compile] Binary:",
  outfile,
  "(" + ((result.outputs[0]?.size ?? 0) / 1024 / 1024).toFixed(1) + "MB)",
);
