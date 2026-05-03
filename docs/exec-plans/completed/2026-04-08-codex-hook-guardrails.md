# Codex hook 가드레일 도입

상태: `completed`
완료일: `2026-04-08`

## 목표
- 세션 시작과 종료 단계에서 문서 라우팅과 검증 체크리스트를 자동으로 다시 주입한다.
- `main` 에서는 새 브랜치와 git worktree 를 먼저 만들고, 그 경로에서만 실제 작업을 진행하게 한다.

## 범위
- `.codex/hooks.json` 과 repo-local hook 스크립트 추가
- `.codex/tmp/` 상태 저장 경로와 ignore 규칙 추가
- Hook 운영을 설명하는 설계/실행 기록 문서 갱신
- `main` 브랜치 보호와 worktree 준비 규칙 추가

## 작업 단계
- Codex 공식 hook 문서를 확인해 이벤트, 입력 필드, 출력 형식을 정리했다.
- 세션 시작, `main` 브랜치 worktree 준비 안내, Bash 직전 main 차단, 문서 변경 상태 기록, 종료 전 검증 강제를 담당하는 Node hook 스크립트를 추가했다.
- Hook 상태를 작업트리 fingerprint 기반으로 저장해 `verify` 이후 재편집 여부까지 구분하도록 만들었다.
- 라우터와 설계/기술 부채 문서를 Hook 계층에 맞게 갱신했다.

## 검증 방법
- 개별 hook 스크립트에 샘플 JSON 을 전달해 출력 형태를 확인한다.
- `corepack pnpm run verify`

## 결정 로그
- Hook 은 repo-local `.codex/hooks.json` 에 둔다.
- `main` 에서 첫 작업 프롬프트가 들어오면 사용자가 원하는 이름으로 branch 와 worktree 를 직접 만들도록 안내한다.
- Bash 실행 직전에 현재 브랜치가 `main` 이면 실행을 막아, 작업 시작 후 브랜치가 바뀌는 우회 경로를 줄인다.
- 문서/구조 변경이 있으면 작업 시작 시점에 리마인드하고, 종료 직전 기본 검증 명령으로 `corepack pnpm run verify` 를 요구한다.
- 신규 외부 의존성 없이 Node 표준 라이브러리만 사용한다.

## 남은 이슈
- 문서 변경 후속 상태 기록은 현재 `PostToolUse` 의 `Bash` 실행 후에만 반응하므로 비 Bash 편집은 `Stop` 에서 최종 보완한다.
- `/tmp/<project>-wt/` 아래 오래된 worktree 정리 정책은 아직 수동 운영이다.

## 사후 변경
- 후속 수정으로 `PostToolUse` 의 `verify` 성공 기록 로직이 `tool_input.command` 뿐 아니라 `tool_input.cmd` 도 읽도록 보완했다.
- 이 변경은 `corepack pnpm run verify` 를 실제로 성공시켰는데도 `verifiedFingerprint` 가 갱신되지 않아 `Stop` 훅이 오탐 경고를 내는 문제를 막기 위한 것이다.
- 2026-05-04: `PostToolUse` 의 명령 추출과 응답 성공 판정을 다시 보강했다. 중첩 JSON, 대체 응답 필드명, `Process exited with code 0` 문자열을 처리하고, 실행 중 응답과 exit code 미검출 응답은 성공으로 기록하지 않도록 했다.
- 2026-05-04: `PreToolUse` 의 `main` Bash 차단 훅을 main 전용 선차단으로 복원했다. `main` 에서의 작업 분리는 `UserPromptSubmit` 에서 만들고, 이후 Bash 실행 시점에는 현재 브랜치가 `main` 인 경우만 조용히 차단한다.
- 2026-05-04: `PostToolUse` 의 문서 변경 리마인드 출력과 상태 메시지를 제거했다. Bash 실행마다 반복되는 경고를 막고, `PostToolUse` 는 상태 기록과 verify fingerprint 갱신만 담당한다.
- 2026-05-04: `UserPromptSubmit` 이 branch 와 worktree 를 자동 생성하지 않도록 바꿨다. `main` 에서는 수동 `git worktree add -b` 명령 형식만 안내하고, 사용자가 정한 이름의 작업 경로에서 새 세션을 시작하게 한다.
