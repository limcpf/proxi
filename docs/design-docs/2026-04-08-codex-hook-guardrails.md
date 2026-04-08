# Codex hook 가드레일 도입

상태: `accepted`

## 배경
- `context-map.json` 과 `verify:docs` 는 PR 단계에서는 문서 구조를 강제하지만, 세션 시작 순간과 종료 직전의 행동은 별도로 고정하지 못했다.
- 새 세션이 시작될 때마다 루트 `AGENTS.md`, 가장 가까운 `AGENTS.md`, `context-map.json` 을 다시 확인하도록 유도할 장치가 필요했다.
- 문서 변경 후 `verify` 를 놓치지 않게 하려면 문서와 검증 스크립트 사이에 세션 수준 가드레일이 필요했다.

## 결정
- repo-local `.codex/hooks.json` 과 `.codex/hooks/*.mjs` 를 추가한다.
- `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop` 훅을 사용해 시작 체크리스트, 문서 변경 리마인드, 종료 전 `corepack pnpm run verify` 강제를 구현한다.
- 훅 상태는 비추적 경로인 `.codex/tmp/` 아래에 저장하고, 현재 작업트리의 문서 변경 fingerprint 와 마지막 검증 fingerprint 를 비교해 종료 시점 판단에 사용한다.

## 대안
- 문서와 PR 검증만으로 운영하는 방식은 세션 시작 행동을 고정하지 못해 채택하지 않았다.
- `PreToolUse` 에만 의존하는 방식은 현재 `Bash` 우회 가능성이 있어 핵심 enforcement 지점으로 채택하지 않았다.

## 영향
- 새 세션은 시작 즉시 라우터와 기계용 목차를 다시 확인하는 컨텍스트를 받는다.
- 문서/구조 변경은 작업 중 리마인드를 받고, 종료 직전에는 `verify` 없이 마무리하기 어렵다.
- 현재 `PostToolUse` 는 `Bash` 에만 반응하므로 비 Bash 편집은 `Stop` 훅에서 최종 보완한다.

## 후속 작업
- Hook 이벤트 범위가 넓어지면 `apply_patch` 같은 편집도 더 이른 단계에서 포착하도록 개선한다.
