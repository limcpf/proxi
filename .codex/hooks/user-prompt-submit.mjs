import path from "node:path";

import {
  getCurrentBranch,
  getDefaultWorktreeRoot,
  readHookInput,
  readHookState,
  resolveRepoRoot,
  shellQuote,
  writeHookState,
} from "./lib.mjs";

const input = await readHookInput();
const prompt = String(input.prompt ?? "");
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const sessionId = input.session_id ?? "default";
const currentBranch = getCurrentBranch(repoRoot);
const state = await readHookState(repoRoot, sessionId);

if (currentBranch === "main") {
  const worktreeRoot = getDefaultWorktreeRoot(repoRoot);

  state.bootstrapBranch = null;
  state.bootstrapWorktreePath = null;
  state.bootstrapPromptSlug = null;
  state.bootstrapRequestedAt = new Date().toISOString();
  state.bootstrapCompleted = false;
  await writeHookState(repoRoot, sessionId, state);

  const message = [
    "main 브랜치에서는 직접 작업하지 않습니다.",
    "Hook 은 branch 와 worktree 를 자동 생성하지 않습니다.",
    "원하는 이름을 직접 정한 뒤, 터미널에서 아래 형식으로 작업 환경을 준비하세요.",
    `- 권장 worktree 부모 경로: ${worktreeRoot}`,
    "- 생성 명령:",
    `  git worktree add -b <branch-name> ${shellQuote(`${worktreeRoot}/<worktree-name>`)} main`,
    `  cd ${shellQuote(`${worktreeRoot}/<worktree-name>`)} && codex`,
    "현재 세션은 여기서 중단하고, 직접 만든 worktree 경로에서 다시 시작해야 합니다.",
  ];

  process.stderr.write(`${message.join("\n")}\n`);
  process.exit(2);
}

state.bootstrapCompleted = true;
await writeHookState(repoRoot, sessionId, state);

const shouldRemind = [
  /docs?/i,
  /agents\.md/i,
  /architecture/i,
  /context-map/i,
  /manifest/i,
  /verify/i,
  /hook/i,
  /문서/,
  /구조/,
  /설계/,
  /계획/,
  /인덱스/,
].some((pattern) => pattern.test(prompt));

if (!shouldRemind) {
  process.exit(0);
}

const docsReadmePath = path.join(repoRoot, "docs", "README.md").replaceAll("\\", "/");
const contextMapPath = path.join(repoRoot, "docs", "generated", "context-map.json").replaceAll("\\", "/");

const reminder = [
  "문서/구조 작업 리마인드:",
  `- 먼저 ${docsReadmePath} 와 ${contextMapPath} 를 확인해 읽어야 할 문서를 좁힌다.`,
  "- 라우팅 대상 문서를 추가하거나 이동하면 관련 index/README 와 context-map.json 을 함께 갱신한다.",
  "- 문서/구조 변경 후에는 corepack pnpm run verify 를 실행한다.",
];

process.stdout.write(`${reminder.join("\n")}\n`);
