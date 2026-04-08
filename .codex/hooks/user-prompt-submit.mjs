import path from "node:path";

import { readHookInput, resolveRepoRoot } from "./lib.mjs";

const input = await readHookInput();
const prompt = String(input.prompt ?? "");

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

const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const docsReadmePath = path.join(repoRoot, "docs", "README.md").replaceAll("\\", "/");
const contextMapPath = path.join(repoRoot, "docs", "generated", "context-map.json").replaceAll("\\", "/");

const reminder = [
  "문서/구조 작업 리마인드:",
  `- 먼저 ${docsReadmePath} 와 ${contextMapPath} 를 확인해 읽어야 할 문서를 좁힌다.`,
  "- 라우팅 대상 문서를 추가하거나 이동하면 관련 index/README 와 context-map.json 을 함께 갱신한다.",
  "- 문서/구조 변경 후에는 corepack pnpm run verify 를 실행한다.",
];

process.stdout.write(`${reminder.join("\n")}\n`);
