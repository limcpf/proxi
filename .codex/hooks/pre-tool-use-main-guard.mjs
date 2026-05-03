import {
  getCurrentBranch,
  getDefaultWorktreeRoot,
  readHookInput,
  resolveRepoRoot,
  shellQuote,
} from "./lib.mjs";

const input = await readHookInput();
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const currentBranch = getCurrentBranch(repoRoot);

if (currentBranch !== "main") {
  process.exit(0);
}

const worktreeRoot = getDefaultWorktreeRoot(repoRoot);
const message = [
  "main 브랜치에서는 Bash 작업을 실행하지 않습니다.",
  "원하는 이름으로 branch 와 git worktree 를 직접 만든 뒤, 해당 경로에서 새 Codex 세션을 시작하세요.",
  `예: git worktree add -b <branch-name> ${shellQuote(`${worktreeRoot}/<worktree-name>`)} main`,
];

process.stderr.write(`${message.join("\n")}\n`);
process.exit(2);
