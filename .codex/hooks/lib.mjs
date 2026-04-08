import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const trackedConfigFiles = new Set([
  ".codex/config.toml",
  ".codex/hooks.json",
  ".github/workflows/verify.yml",
  "docs/generated/context-map.json",
  "scripts/verify-doc-structure.mjs",
]);

export async function readHookInput() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const raw = chunks.join("").trim();
  if (raw === "") {
    return {};
  }

  return JSON.parse(raw);
}

export function printJson(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

export function buildAdditionalContext(eventName, additionalContext, extra = {}) {
  return {
    ...extra,
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext,
    },
  };
}

export function resolveRepoRoot(cwd) {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "git rev-parse failed");
  }

  return normalizeRepoPath(result.stdout.trim());
}

export function normalizeRepoPath(filePath) {
  return filePath.replaceAll("\\", "/");
}

export function findNearestAgentsPath(cwd, repoRoot) {
  let currentDir = normalizeRepoPath(path.resolve(cwd));
  const normalizedRoot = normalizeRepoPath(path.resolve(repoRoot));

  while (currentDir.startsWith(normalizedRoot)) {
    const candidate = path.join(currentDir, "AGENTS.md");
    if (existsSync(candidate)) {
      return normalizeRepoPath(candidate);
    }

    if (currentDir === normalizedRoot) {
      break;
    }

    currentDir = normalizeRepoPath(path.dirname(currentDir));
  }

  return normalizeRepoPath(path.join(normalizedRoot, "AGENTS.md"));
}

export function listDocStructureFiles(repoRoot) {
  const changedFiles = new Set();
  for (const filePath of listChangedFiles(repoRoot)) {
    if (isDocStructurePath(filePath)) {
      changedFiles.add(filePath);
    }
  }

  return [...changedFiles].sort((left, right) => left.localeCompare(right));
}

export function fingerprintFiles(files) {
  return JSON.stringify([...files].sort((left, right) => left.localeCompare(right)));
}

export async function readHookState(repoRoot, sessionId) {
  const statePath = getHookStatePath(repoRoot, sessionId);

  try {
    const raw = await readFile(statePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      sessionId,
      verifiedFingerprint: null,
      lastReminderFingerprint: null,
      lastReminderTurnId: null,
      lastVerifyCommand: null,
      lastVerifySucceededAt: null,
    };
  }
}

export async function writeHookState(repoRoot, sessionId, state) {
  const statePath = getHookStatePath(repoRoot, sessionId);
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function isFullVerifyCommand(command) {
  return /(^|\s)corepack\s+pnpm\s+run\s+verify(\s|$)/.test(command);
}

export function extractCommandSucceeded(toolResponse) {
  const payload = unwrapToolResponse(toolResponse);
  const exitCode = findExitCode(payload);
  if (exitCode === null) {
    return false;
  }

  return exitCode === 0;
}

function unwrapToolResponse(toolResponse) {
  let current = toolResponse;

  while (typeof current === "string") {
    const trimmed = current.trim();
    if (
      trimmed === "" ||
      (!trimmed.startsWith("{") && !trimmed.startsWith("[") && !trimmed.startsWith("\""))
    ) {
      break;
    }

    try {
      current = JSON.parse(trimmed);
    } catch {
      break;
    }
  }

  return current;
}

function findExitCode(payload) {
  if (typeof payload === "number") {
    return payload;
  }

  if (payload === null || payload === undefined) {
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = findExitCode(item);
      if (nested !== null) {
        return nested;
      }
    }

    return null;
  }

  if (typeof payload !== "object") {
    return null;
  }

  for (const key of ["exit_code", "exitCode", "code", "status"]) {
    if (typeof payload[key] === "number") {
      return payload[key];
    }
  }

  for (const value of Object.values(payload)) {
    const nested = findExitCode(value);
    if (nested !== null) {
      return nested;
    }
  }

  return null;
}

function listChangedFiles(repoRoot) {
  const outputs = [
    runGit(repoRoot, ["diff", "--name-only", "--cached", "--"]),
    runGit(repoRoot, ["diff", "--name-only", "--"]),
    runGit(repoRoot, ["ls-files", "--others", "--exclude-standard", "--"]),
  ];

  const changedFiles = new Set();
  for (const output of outputs) {
    for (const line of output.split("\n")) {
      const trimmed = line.trim();
      if (trimmed !== "") {
        changedFiles.add(normalizeRepoPath(trimmed));
      }
    }
  }

  return [...changedFiles];
}

function isDocStructurePath(filePath) {
  if (filePath.endsWith(".md")) {
    return true;
  }

  if (trackedConfigFiles.has(filePath)) {
    return true;
  }

  return filePath.startsWith(".codex/hooks/");
}

function runGit(repoRoot, args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return "";
  }

  return result.stdout;
}

function getHookStatePath(repoRoot, sessionId) {
  const safeSessionId = sessionId.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(repoRoot, ".codex", "tmp", "hook-state", `${safeSessionId}.json`);
}
