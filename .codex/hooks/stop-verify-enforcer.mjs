import {
  getCurrentBranch,
  getDefaultWorktreeRoot,
  fingerprintFiles,
  listDocStructureFiles,
  listRepoChanges,
  printJson,
  readHookInput,
  readHookState,
  resolveRepoRoot,
  shellQuote,
} from "./lib.mjs";

const input = await readHookInput();
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const currentBranch = getCurrentBranch(repoRoot);
const state = await readHookState(repoRoot, input.session_id ?? "default");
const repoChanges = listRepoChanges(repoRoot);

if (currentBranch === "main" && repoChanges.length > 0) {
  const worktreeRoot = getDefaultWorktreeRoot(repoRoot);
  const reason = [
    "main 브랜치에서는 직접 작업하지 않습니다.",
    "변경을 이어가려면 원하는 이름으로 branch 와 git worktree 를 직접 만든 뒤 새 Codex 세션을 시작하세요.",
    `예: git worktree add -b <branch-name> ${shellQuote(`${worktreeRoot}/<worktree-name>`)} main`,
  ].join("\n");

  if (input.stop_hook_active) {
    printJson({
      continue: true,
      systemMessage: reason,
    });
    process.exit(0);
  }

  printJson({
    decision: "block",
    reason,
  });
  process.exit(0);
}

const docFiles = listDocStructureFiles(repoRoot);
const currentFingerprint = fingerprintFiles(docFiles);
const verifySatisfied = docFiles.length === 0 || state.verifiedFingerprint === currentFingerprint;

if (verifySatisfied) {
  process.exit(0);
}

if (input.stop_hook_active) {
  printJson({
    continue: true,
    systemMessage:
      "문서/구조 검증이 아직 확인되지 않았습니다. 가능하면 corepack pnpm run verify 를 먼저 실행하세요.",
  });
  process.exit(0);
}

printJson({
  decision: "block",
  reason:
    "문서/구조 변경이 감지되었습니다. corepack pnpm run verify 를 실행하고 결과를 반영한 뒤 마무리하세요.",
});
