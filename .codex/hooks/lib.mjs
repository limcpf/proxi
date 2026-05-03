import { createHash } from "node:crypto";
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
  return normalizeRepoPath(runGitOrThrow(cwd, ["rev-parse", "--show-toplevel"]).trim());
}

export function normalizeRepoPath(filePath) {
  return filePath.replaceAll("\\", "/");
}

export function getRepoName(repoRoot) {
  return path.basename(repoRoot);
}

export function getDefaultWorktreeRoot(repoRoot) {
  return normalizeRepoPath(path.join("/tmp", `${getRepoName(repoRoot)}-wt`));
}

export function getCurrentBranch(repoRoot) {
  return runGitOrThrow(repoRoot, ["branch", "--show-current"]).trim();
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

export function listRepoChanges(repoRoot) {
  return listChangedFiles(repoRoot);
}

export function listDocStructureFiles(repoRoot) {
  const changedFiles = new Set();
  for (const filePath of listRepoChanges(repoRoot)) {
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
      bootstrapBranch: null,
      bootstrapWorktreePath: null,
      bootstrapPromptSlug: null,
      bootstrapRequestedAt: null,
      bootstrapCompleted: false,
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

export function extractToolCommand(input) {
  const candidates = [
    input?.tool_input,
    input?.toolInput,
    input?.tool?.input,
    input?.input,
    input,
  ];

  for (const candidate of candidates) {
    const command = findToolCommand(unwrapJsonLikeValue(candidate));
    if (command !== null) {
      return command;
    }
  }

  return "";
}

export function slugifyPrompt(prompt, maxLength = 40) {
  const originalPrompt = String(prompt).trim();
  const normalized = prompt
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const truncated = normalized.slice(0, maxLength).replace(/-+$/g, "");
  if (truncated !== "") {
    return truncated;
  }

  if (originalPrompt === "") {
    return "task";
  }

  return `task-${createHash("sha1").update(originalPrompt).digest("hex").slice(0, 8)}`;
}

export function formatDateStamp(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function ensureTaskWorktree(repoRoot, prompt, options = {}) {
  const baseBranch = options.baseBranch ?? "main";
  const worktreeRoot = normalizeRepoPath(options.worktreeRoot ?? getDefaultWorktreeRoot(repoRoot));
  const slug = slugifyPrompt(prompt);
  const dateStamp = formatDateStamp();
  const branchBase = `task/${slug}-${dateStamp}`;
  const pathBase = normalizeRepoPath(path.join(worktreeRoot, `${slug}-${dateStamp}`));
  const worktrees = listWorktrees(repoRoot);

  if (!gitRefExists(repoRoot, `refs/heads/${baseBranch}`)) {
    throw new Error(`기준 브랜치가 없습니다: ${baseBranch}`);
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const branchName = `${branchBase}${suffix}`;
    const worktreePath = `${pathBase}${suffix}`;
    const existingWorktree = worktrees.find((entry) => entry.branch === branchName);

    if (existingWorktree) {
      return {
        branchName,
        worktreePath: existingWorktree.path,
        created: false,
        createdBranch: false,
        reused: true,
        slug,
      };
    }

    if (existsSync(worktreePath)) {
      continue;
    }

    await mkdir(path.dirname(worktreePath), { recursive: true });

    const branchExists = gitRefExists(repoRoot, `refs/heads/${branchName}`);
    if (branchExists) {
      runGitOrThrow(repoRoot, ["worktree", "add", worktreePath, branchName]);
    } else {
      runGitOrThrow(repoRoot, ["worktree", "add", "-b", branchName, worktreePath, baseBranch]);
    }

    return {
      branchName,
      worktreePath: normalizeRepoPath(worktreePath),
      created: true,
      createdBranch: !branchExists,
      reused: false,
      slug,
    };
  }

  throw new Error("사용 가능한 worktree 경로를 찾지 못했습니다.");
}

export function shellQuote(value) {
  return `'${String(value).replaceAll("'", `'\"'\"'`)}'`;
}

export function extractCommandSucceeded(...toolResponses) {
  const exitCode = extractCommandExitCode(...toolResponses);
  if (exitCode === null) {
    return false;
  }

  return exitCode === 0;
}

export function extractCommandExitCode(...toolResponses) {
  const payload = toolResponses.length === 1 ? toolResponses[0] : toolResponses;
  return findExitCode(unwrapToolResponse(payload));
}

export function extractCommandStillRunning(...toolResponses) {
  const payload = toolResponses.length === 1 ? toolResponses[0] : toolResponses;
  return findRunningMarker(unwrapToolResponse(payload));
}

function unwrapToolResponse(toolResponse) {
  return unwrapJsonLikeValue(toolResponse);
}

function unwrapJsonLikeValue(value) {
  let current = value;

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

function findToolCommand(payload) {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === "string") {
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = findToolCommand(unwrapJsonLikeValue(item));
      if (nested !== null) {
        return nested;
      }
    }

    return null;
  }

  if (typeof payload !== "object") {
    return null;
  }

  for (const key of ["command", "cmd"]) {
    const value = payload[key];
    if (typeof value === "string") {
      return value;
    }
  }

  for (const value of Object.values(payload)) {
    const nested = findToolCommand(unwrapJsonLikeValue(value));
    if (nested !== null) {
      return nested;
    }
  }

  return null;
}

function findRunningMarker(payload) {
  if (payload === null || payload === undefined) {
    return false;
  }

  if (typeof payload === "string") {
    return /\bProcess running with session ID\b/.test(payload);
  }

  if (Array.isArray(payload)) {
    return payload.some((item) => findRunningMarker(item));
  }

  if (typeof payload !== "object") {
    return false;
  }

  return Object.values(payload).some((value) => findRunningMarker(value));
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

  if (typeof payload === "string") {
    const match = payload.match(/\bProcess exited with code\s+(-?\d+)\b/);
    return match ? Number(match[1]) : null;
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

function listWorktrees(repoRoot) {
  const raw = runGit(repoRoot, ["worktree", "list", "--porcelain"]);
  if (raw === "") {
    return [];
  }

  const entries = [];
  let current = null;
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current !== null) {
        entries.push(current);
      }
      current = null;
      continue;
    }

    if (line.startsWith("worktree ")) {
      current = current ?? {};
      current.path = normalizeRepoPath(line.slice("worktree ".length).trim());
      continue;
    }

    if (line.startsWith("branch ")) {
      current = current ?? {};
      current.branch = line
        .slice("branch ".length)
        .trim()
        .replace(/^refs\/heads\//, "");
    }
  }

  if (current !== null) {
    entries.push(current);
  }

  return entries;
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

function runGitOrThrow(repoRoot, args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  }

  return result.stdout;
}

function gitRefExists(repoRoot, refName) {
  const result = spawnSync("git", ["show-ref", "--verify", "--quiet", refName], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return result.status === 0;
}

function getHookStatePath(repoRoot, sessionId) {
  const safeSessionId = sessionId.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(repoRoot, ".codex", "tmp", "hook-state", `${safeSessionId}.json`);
}
