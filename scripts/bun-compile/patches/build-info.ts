import type { PatchContext } from "../types.js";

export function patchVersionTs(
  source: string,
  ctx: Pick<PatchContext, "pkgJson">,
): string {
  // Replace readVersionFromJsonCandidates function body to return hardcoded version
  return source.replace(
    /(function\s+readVersionFromJsonCandidates\s*\(\)[^{]*\{)\s*\n[\s\S]*?(\n\})/,
    `$1\n  return ${JSON.stringify(ctx.pkgJson.version)};$2`
  );
}

export function patchGitCommit(
  source: string,
  ctx: Pick<PatchContext, "gitHead">,
): string {
  // Replace readCommitFromPackageJson const arrow function
  return source.replace(
    /(const\s+readCommitFromPackageJson\s*=\s*\()?\s*(?:async\s*)?\(\s*\)\s*(?::\s*\w+)?\s*=>\s*\{[\s\S]*?\}/,
    `() => ${JSON.stringify(ctx.gitHead)}`
  );
}

export function patchOpenClawRoot(source: string): string {
  // Replace resolveOpenClawPackageRoot to use execPath
  source = source.replace(
    /(async\s+function\s+resolveOpenClawPackageRoot\s*\(\)[^{]*\{)\s*\n[\s\S]*?(\n\})/,
    `$1\n  return require("node:path").dirname(process.execPath);$2`
  );
  // Replace resolveOpenClawPackageRootSync
  source = source.replace(
    /(function\s+resolveOpenClawPackageRootSync\s*\(\)[^{]*\{)\s*\n[\s\S]*?(\n\})/,
    `$1\n  return require("node:path").dirname(process.execPath);$2`
  );
  return source;
}

export function patchPluginRuntimeVersion(
  source: string,
  ctx: Pick<PatchContext, "pkgJson">,
): string {
  return source.replace(
    /(function\s+resolveVersion\s*\(\)[^{]*\{)\s*\n[\s\S]*?(\n\})/,
    `$1\n  return ${JSON.stringify(ctx.pkgJson.version)};$2`
  );
}
