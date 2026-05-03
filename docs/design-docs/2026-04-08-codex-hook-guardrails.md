# Codex hook 가드레일 도입

상태: `accepted`

## 배경
- `context-map.json` 과 `verify:docs` 는 PR 단계에서는 문서 구조를 강제하지만, 세션 시작 순간과 종료 직전의 행동은 별도로 고정하지 못했다.
- 새 세션이 시작될 때마다 루트 `AGENTS.md`, 가장 가까운 `AGENTS.md`, `context-map.json` 을 다시 확인하도록 유도할 장치가 필요했다.
- 문서 변경 후 `verify` 를 놓치지 않게 하려면 문서와 검증 스크립트 사이에 세션 수준 가드레일이 필요했다.
- 새 작업이 `main` 에서 시작되면 관련된 task 브랜치와 git worktree 로 바로 분리하는 작업 환경 가드레일도 필요했다.

## 결정
- repo-local `.codex/hooks.json` 과 `.codex/hooks/*.mjs` 를 추가한다.
- `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop` 훅을 사용해 시작 체크리스트, `main` 에서의 task 브랜치/worktree 부트스트랩, Bash 직전 main 차단, 문서 변경 상태 기록, 종료 전 `corepack pnpm run verify` 강제를 구현한다.
- 훅 상태는 비추적 경로인 `.codex/tmp/` 아래에 저장하고, 현재 작업트리의 문서 변경 fingerprint 와 마지막 검증 fingerprint 를 비교해 종료 시점 판단에 사용한다.
- worktree 기본 루트는 `/tmp/<project>-wt/` 로 두고, 작업 브랜치는 `task/<slug>-<yyyymmdd>` 규칙으로 만든다.

## 대안
- 문서와 PR 검증만으로 운영하는 방식은 세션 시작 행동을 고정하지 못해 채택하지 않았다.
- `PreToolUse` 에만 의존하는 방식은 새 작업 부트스트랩과 종료 검증을 대신할 수 없어 채택하지 않았다. 대신 Bash 직전의 main 차단만 담당하게 한다.
- 모든 작업을 현재 브랜치에서 이어가는 방식은 task 간 물리적 분리가 없어 채택하지 않았다.

## 영향
- 새 세션은 시작 즉시 라우터와 기계용 목차를 다시 확인하는 컨텍스트를 받는다.
- `main` 에서 첫 작업 프롬프트가 들어오면 에이전트가 관련 브랜치와 worktree 를 자동 생성하고, 해당 경로에서 새 세션을 다시 시작하도록 강제한다.
- Bash 실행 직전에도 현재 브랜치가 `main` 이면 조용한 선차단 훅이 실행을 막아, 작업 시작 후 브랜치가 바뀐 경우의 우회 경로를 줄인다.
- 문서/구조 변경은 작업 시작 시점에 리마인드를 받고, 종료 직전에는 `verify` 없이 마무리하기 어렵다.
- 현재 문서 변경 후속 상태 기록은 `PostToolUse` 의 `Bash` 실행 후에 반응하므로 비 Bash 편집은 `Stop` 훅에서 최종 보완한다.

## 후속 작업
- Hook 이벤트 범위가 넓어지면 `apply_patch` 같은 편집도 더 이른 단계에서 포착하도록 개선한다.
- `/tmp/<project>-wt/` 아래 오래된 worktree 정리 정책과 prune 절차를 보강한다.

## 사후 변경
- `verify` 성공 여부 기록은 `PostToolUse` 에서 활성 실행 surface 의 명령 입력 키를 함께 읽어야 한다.
- 초기 구현은 `tool_input.command` 만 읽어 `corepack pnpm run verify` 가 `cmd` 필드로 전달되는 실행 경로에서 `verifiedFingerprint` 가 갱신되지 않는 문제가 있었다.
- 이후 후속 수정으로 `command` 와 `cmd` 를 모두 읽게 해, 실제 `verify` 성공 후 `Stop` 훅이 오탐 경고를 내지 않도록 보완했다.
- 2026-05-04 후속 수정으로 `PostToolUse` 입력과 응답이 중첩 JSON 또는 대체 필드명으로 전달되는 경우도 처리한다. 실행 중 응답은 검증 성공으로 보지 않고, 완료형 `verify` 응답은 exit code `0` 을 명시적으로 읽은 경우에만 현재 fingerprint 를 검증 완료로 기록한다.
- 2026-05-04 후속 수정으로 `PreToolUse` 의 `main` Bash 차단을 main 전용 선차단 훅으로 복원했다. 문서/검증 리마인드는 출력하지 않고, 현재 브랜치가 `main` 인 Bash 실행만 막아 작업 시작 후 브랜치 변경 우회를 줄인다.
- 2026-05-04 후속 수정으로 `PostToolUse` 의 사용자-facing 문서 변경 리마인드와 상태 메시지를 제거했다. `PostToolUse` 는 Bash 실행 후 상태와 verify fingerprint 만 조용히 갱신하고, 리마인드는 `UserPromptSubmit`, 종료 강제는 `Stop` 에서 담당한다.
