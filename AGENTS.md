# 루트 작업 라우터

이 문서는 저장소 전체 규칙을 설명하는 긴 매뉴얼이 아니라, 에이전트가 어떤 문서를 먼저 읽어야 하는지 정하는 진입점이다.

## 항상 먼저 읽을 문서
- [`/Users/lim/dev/proxi/ARCHITECTURE.md`](./ARCHITECTURE.md)
- 현재 작업 경로와 가장 가까운 `AGENTS.md`

## 작업 유형별 추가로 읽을 문서
- 구조 변경, 경계 변경, 새 규칙 도입: [`/Users/lim/dev/proxi/docs/DESIGN.md`](./docs/DESIGN.md), [`/Users/lim/dev/proxi/docs/design-docs/index.md`](./docs/design-docs/index.md)
- 장시간 작업, 중단 후 재개 가능해야 하는 작업: [`/Users/lim/dev/proxi/docs/PLANS.md`](./docs/PLANS.md)
- 문서 구조 탐색, 문서 추가/이동, 인덱스 갱신: [`/Users/lim/dev/proxi/docs/README.md`](./docs/README.md), [`/Users/lim/dev/proxi/docs/generated/context-map.json`](./docs/generated/context-map.json)
- API, DB, 로깅, 운영 안정성 변경: [`/Users/lim/dev/proxi/docs/RELIABILITY.md`](./docs/RELIABILITY.md)
- 인증, 인가, 비밀정보, 외부 연동 변경: [`/Users/lim/dev/proxi/docs/SECURITY.md`](./docs/SECURITY.md)
- 품질 수준 판단이나 후속 작업 정리: [`/Users/lim/dev/proxi/docs/QUALITY_SCORE.md`](./docs/QUALITY_SCORE.md), [`/Users/lim/dev/proxi/docs/exec-plans/tech-debt-tracker.md`](./docs/exec-plans/tech-debt-tracker.md)

## 프로젝트 맵
- 이 저장소는 `front`, `back`, `shared`를 분리된 문맥으로 다루는 모노레포 운영을 목표로 한다.
- 현재 워크스페이스 설정은 `apps/*` 기준이며, 저장소에 실제로 존재하는 앱은 `apps/back`, `apps/front` 이다.
- 프로젝트별 세부 규칙은 각 프로젝트 루트의 `AGENTS.md`와 `ARCHITECTURE.md`에 둔다.
- 하나의 PR에서 여러 프로젝트를 동시에 수정해야 하면 문맥 혼선을 줄이기 위해 작업 단위를 분리한다.

## 저장소 공통 규칙
- 항상 Plan을 먼저 세우고 작업한다.
- 모든 답변과 작업 요약은 한국어로 작성한다.
- 코드 주석은 한국어로 작성한다.
- 사용자가 명시하지 않은 신규 의존성 추가는 피한다.
- 관련 없는 파일은 수정하지 않는다.
- 변경은 가능한 한 최소 범위로 유지한다.
- 반복해서 참조해야 하는 결정, 규칙, 작업 기억은 저장소 안의 문서로 남긴다.
- Codex hook 이 세션 시작과 종료 전에 라우터 확인과 검증 체크리스트를 다시 주입한다.
- 새 작업은 `main` 에서 직접 시작하지 않고, `main` 기준 작업 브랜치와 git worktree 를 만들어 물리적으로 분리한 뒤 진행한다.

## Review guidelines
- Codex 리뷰는 GitHub 와 연결된 OAuth 계정의 기본 댓글 경로를 사용한다.
- `Verify` workflow 가 PR 에서 성공하면 후속 job 이 기본 리뷰 요청 코멘트를 자동으로 남긴다.
- 추가 요청은 PR 코멘트 `@codex <지침>` 형태로 남긴다.
- 리뷰는 코멘트에 적은 지시 범위 안에서만 수행하고, 다른 관점의 지적은 치명적 연관성이 있을 때만 포함한다.
- findings 를 먼저, 심각도 높은 순으로 정리한다.
- 스타일 취향보다 버그, 회귀, 위험한 가정, 누락된 검증을 우선한다.
- 근거가 있으면 파일 경로와 라인 번호를 적는다.
- 명시적 문제가 없으면 그 사실과 남은 리스크만 짧게 적는다.
- 리뷰 본문은 한국어로 작성한다.

## 문서 운영 규칙
- `AGENTS.md`는 짧은 라우터로 유지하고, 상세 규칙은 `docs/` 또는 하위 `AGENTS.md`로 분리한다.
- 설계 결정은 `docs/design-docs/`에, 사용자 동작 기준은 `docs/product-specs/`에 기록한다.
- 실제 실행 계획은 `docs/exec-plans/active/`와 `docs/exec-plans/completed/`에서 관리한다.
- 사람이 직접 편집하지 않는 파생 문서는 `docs/generated/`에만 둔다.

## 완료 기준
- 변경과 직접 관련된 검증을 수행하거나, 검증 수단이 없으면 그 사실을 명시한다.
- 규칙이나 운영 방식이 바뀌면 관련 문서를 함께 갱신한다.
- 문서 라우팅 대상 파일을 추가하거나 이동하면 관련 `index.md`/`README.md` 와 `docs/generated/context-map.json` 을 함께 갱신한다.
- 장시간 작업이었다면 실행 계획 문서 상태를 현재 결과에 맞게 갱신한다.
