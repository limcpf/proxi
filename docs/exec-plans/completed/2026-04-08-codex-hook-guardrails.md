# Codex hook 가드레일 도입

상태: `completed`
완료일: `2026-04-08`

## 목표
- 세션 시작과 종료 단계에서 문서 라우팅과 검증 체크리스트를 자동으로 다시 주입한다.
- `main` 에서는 새 task 브랜치와 git worktree 를 먼저 만들고, 그 경로에서만 실제 작업을 진행하게 한다.

## 범위
- `.codex/hooks.json` 과 repo-local hook 스크립트 추가
- `.codex/tmp/` 상태 저장 경로와 ignore 규칙 추가
- Hook 운영을 설명하는 설계/실행 기록 문서 갱신
- `main` 브랜치 보호와 `/tmp/<project>-wt/` worktree 부트스트랩 규칙 추가

## 작업 단계
- Codex 공식 hook 문서를 확인해 이벤트, 입력 필드, 출력 형식을 정리했다.
- 세션 시작, `main` 브랜치 worktree 부트스트랩, 문서 변경 리마인드, 종료 전 검증 강제를 담당하는 Node hook 스크립트를 추가했다.
- Hook 상태를 작업트리 fingerprint 기반으로 저장해 `verify` 이후 재편집 여부까지 구분하도록 만들었다.
- 라우터와 설계/기술 부채 문서를 Hook 계층에 맞게 갱신했다.

## 검증 방법
- 개별 hook 스크립트에 샘플 JSON 을 전달해 출력 형태를 확인한다.
- `corepack pnpm run verify`

## 결정 로그
- Hook 은 repo-local `.codex/hooks.json` 에 둔다.
- `main` 에서 첫 작업 프롬프트가 들어오면 task 브랜치와 `/tmp/<project>-wt/` worktree 를 자동 생성한다.
- 문서/구조 변경이 있으면 종료 직전 기본 검증 명령으로 `corepack pnpm run verify` 를 요구한다.
- 신규 외부 의존성 없이 Node 표준 라이브러리만 사용한다.

## 남은 이슈
- `PreToolUse` 와 `PostToolUse` 는 현재 `Bash` 에만 반응하므로 비 Bash 편집은 `Stop` 에서 최종 보완한다.
- `/tmp/<project>-wt/` 아래 오래된 worktree 정리 정책은 아직 수동 운영이다.
