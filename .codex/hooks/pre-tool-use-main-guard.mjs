import { getCurrentBranch, readHookInput, readHookState, resolveRepoRoot } from "./lib.mjs";

const input = await readHookInput();
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const currentBranch = getCurrentBranch(repoRoot);

if (currentBranch !== "main") {
  process.exit(0);
}

const state = await readHookState(repoRoot, input.session_id ?? "default");
const message = state.bootstrapWorktreePath
  ? [
      "main 브랜치에서는 Bash 작업을 실행하지 않습니다.",
      `생성된 작업 브랜치: ${state.bootstrapBranch ?? "unknown"}`,
      `생성된 worktree 경로: ${state.bootstrapWorktreePath}`,
      "해당 경로에서 새 Codex 세션을 다시 시작한 뒤 작업하세요.",
    ]
  : [
      "main 브랜치에서는 Bash 작업을 실행하지 않습니다.",
      "먼저 작업 프롬프트를 보내 task 브랜치와 git worktree 를 생성하세요.",
    ];

process.stderr.write(`${message.join("\n")}\n`);
process.exit(2);
