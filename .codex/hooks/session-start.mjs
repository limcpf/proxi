import path from "node:path";

import {
  findNearestAgentsPath,
  getCurrentBranch,
  getDefaultWorktreeRoot,
  readHookInput,
  resolveRepoRoot,
} from "./lib.mjs";

const input = await readHookInput();
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const currentBranch = getCurrentBranch(repoRoot);
const rootAgentsPath = path.join(repoRoot, "AGENTS.md").replaceAll("\\", "/");
const nearestAgentsPath = findNearestAgentsPath(sessionCwd, repoRoot);
const contextMapPath = path.join(repoRoot, "docs", "generated", "context-map.json").replaceAll("\\", "/");
const worktreeRoot = getDefaultWorktreeRoot(repoRoot);

const checklist =
  currentBranch === "main"
    ? [
        "세션 시작 체크리스트:",
        "1. 현재 브랜치가 main 이므로 여기서 직접 작업하지 않는다.",
        `2. 첫 작업 프롬프트가 들어오면 ${worktreeRoot} 아래에 branch 와 git worktree 를 직접 만들라는 안내만 출력한다.`,
        "3. 직접 만든 worktree 경로에서 새 Codex 세션을 다시 시작한다.",
        `4. 루트 라우터 확인: ${rootAgentsPath}`,
        `5. 문서 구조 작업이면 기계용 목차 확인: ${contextMapPath}`,
      ]
    : [
        "세션 시작 체크리스트:",
        `1. 루트 라우터 확인: ${rootAgentsPath}`,
        `2. 현재 작업 경로 기준 가장 가까운 AGENTS 확인: ${nearestAgentsPath}`,
        `3. 문서 구조 작업이면 기계용 목차 확인: ${contextMapPath}`,
        "4. 작업 전에 계획을 먼저 세우고, 문서/구조 변경 후에는 corepack pnpm run verify 를 통과시킨다.",
      ];

process.stdout.write(`${checklist.join("\n")}\n`);
