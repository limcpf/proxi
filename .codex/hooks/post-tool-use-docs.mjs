import {
  extractCommandExitCode,
  extractToolCommand,
  extractCommandStillRunning,
  fingerprintFiles,
  isFullVerifyCommand,
  listDocStructureFiles,
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
const toolResponseCandidates = [
  input.tool_response,
  input.toolResponse,
  input.tool_output,
  input.toolOutput,
  input.response,
  input.result,
  input,
];
const verifyExitCode = extractCommandExitCode(...toolResponseCandidates);
const verifyCommandRan = isFullVerifyCommand(command);
const verifyStillRunning = extractCommandStillRunning(...toolResponseCandidates);
const verifySucceeded =
  verifyCommandRan && !verifyStillRunning && (verifyExitCode === 0 || verifyExitCode === null);

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
