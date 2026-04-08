import {
  getCurrentBranch,
  fingerprintFiles,
  listDocStructureFiles,
  listRepoChanges,
  printJson,
  readHookInput,
  readHookState,
  resolveRepoRoot,
} from "./lib.mjs";

const input = await readHookInput();
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const currentBranch = getCurrentBranch(repoRoot);
const state = await readHookState(repoRoot, input.session_id ?? "default");

if (currentBranch === "main" && (state.bootstrapWorktreePath !== null || listRepoChanges(repoRoot).length > 0)) {
  const reason = state.bootstrapWorktreePath
    ? `main 브랜치에서는 직접 작업하지 않습니다. ${state.bootstrapWorktreePath} 에서 새 Codex 세션을 다시 시작하세요.`
    : "main 브랜치에서는 직접 작업하지 않습니다. 새 작업 프롬프트로 task 브랜치와 git worktree 를 먼저 만드세요.";

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
