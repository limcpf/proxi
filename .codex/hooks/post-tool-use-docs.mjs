import {
  buildAdditionalContext,
  extractToolCommand,
  extractCommandSucceeded,
  fingerprintFiles,
  isFullVerifyCommand,
  listDocStructureFiles,
  printJson,
  readHookInput,
  readHookState,
  resolveRepoRoot,
  writeHookState,
} from "./lib.mjs";

const input = await readHookInput();
const sessionCwd = input.cwd ?? process.cwd();
const repoRoot = resolveRepoRoot(sessionCwd);
const state = await readHookState(repoRoot, input.session_id ?? "default");
const docFiles = listDocStructureFiles(repoRoot);
const currentFingerprint = fingerprintFiles(docFiles);
const command = extractToolCommand(input);
const verifySucceeded = isFullVerifyCommand(command) && extractCommandSucceeded(input.tool_response);

if (verifySucceeded) {
  state.verifiedFingerprint = currentFingerprint;
  state.lastVerifyCommand = command;
  state.lastVerifySucceededAt = new Date().toISOString();
}

const needsVerify = docFiles.length > 0 && state.verifiedFingerprint !== currentFingerprint;
state.currentFingerprint = currentFingerprint;
state.docFiles = docFiles;
state.needsVerify = needsVerify;

await writeHookState(repoRoot, input.session_id ?? "default", state);

if (!needsVerify) {
  process.exit(0);
}

if (
  state.lastReminderFingerprint === currentFingerprint &&
  state.lastReminderTurnId === input.turn_id
) {
  process.exit(0);
}

state.lastReminderFingerprint = currentFingerprint;
state.lastReminderTurnId = input.turn_id ?? null;
await writeHookState(repoRoot, input.session_id ?? "default", state);

const preview = docFiles.slice(0, 6).join(", ");
printJson(
  buildAdditionalContext(
    "PostToolUse",
    [
      "문서/구조 변경이 감지되었습니다.",
      preview === "" ? "" : `현재 변경 파일 예시: ${preview}`,
      "관련 index/README 와 docs/generated/context-map.json 갱신 여부를 확인하세요.",
      "마무리 전에는 corepack pnpm run verify 가 필요합니다.",
    ]
      .filter(Boolean)
      .join("\n"),
    {
      systemMessage: "문서/구조 변경이 남아 있습니다. verify 전에는 마무리하지 마세요.",
    },
  ),
);
