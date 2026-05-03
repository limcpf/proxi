# 기술 부채 추적기

기준일: `2026-04-08`

| 항목 | 증상 | 영향 | 우선순위 | 후속 방향 |
| --- | --- | --- | --- | --- |
| 문서 라우팅 목차 수동 갱신 부담 | `docs/generated/context-map.json` 과 사람용 인덱스를 함께 유지해야 한다. | 갱신 누락 시 `verify:docs` 가 실패해 작업 흐름이 끊길 수 있다. | 중간 | 필요하면 `context-map.json` 동기화 스크립트나 템플릿 자동화를 검토한다. |
| Hook 이벤트 범위 제한 | Codex hook 의 `PostToolUse` 는 현재 `Bash` 에만 반응한다. | `apply_patch` 같은 비 Bash 편집은 종료 시점까지는 후속 리마인드를 받지 못한다. | 중간 | Hook 이벤트 범위가 넓어지면 문서 변경 감지를 더 이른 단계로 옮긴다. |
| Worktree 정리 정책 부재 | `/tmp/<project>-wt/` 아래 task worktree 가 자동 생성되지만 수명 주기와 prune 규칙이 없다. | 오래된 worktree 가 누적되면 디스크 사용량과 브랜치 관리 비용이 커진다. | 중간 | 주기적 prune 절차와 자동 정리 기준을 문서로 추가한다. |
| 제품 사양 문서 부재 | 사용자 동작 기준이 저장소 안에 없다. | 구현 판단이 대화 문맥에 의존할 수 있다. | 중간 | 주요 기능부터 `docs/product-specs/` 에 수용 기준을 추가한다. |
| Attachment object storage adapter 부재 | 첫 구현은 로컬 파일시스템에 저장한다. | 운영에서 Cloudflare R2 또는 Backblaze B2 로 옮길 때 adapter 경계가 필요하다. | 중간 | `PROXI_UPLOAD_ROOT` 기반 구현을 유지하면서 S3/R2 호환 adapter 를 분리한다. |
| 공통 HTTP error mapper 보류 | 현재 Echo controller 는 `mapErrors` 로 `EchoApplicationError` 를 `HttpException` 으로 변환한다. | 도메인이 하나뿐인 상태에서 공통 mapper 를 먼저 만들면 추상화가 앞설 수 있다. | 낮음 | 또 다른 application/domain error 가 생기면 controller-local mapper 를 공통 filter 또는 mapper 로 승격한다. |
| AI Agent 도메인 미구현 | Echo mention 은 아직 실제 Agent 존재 여부를 검증하지 않는다. | AI 답변, reaction, 중복 실행 방지 정책을 붙일 수 없다. | 높음 | 별도 Agent 도메인 slice 에서 관리 UI, resolver, job 상태를 설계한다. |
| Vector search 미구현 | 검색 1차는 PostgreSQL 본문 검색만 제공한다. | 의미 기반 탐색과 재색인 전략이 없다. | 중간 | embedding provider, vector 저장소, archive 포함 정책을 별도 결정한다. |
| E2E 와 DB integration 기본 verify 제외 | 로컬 준비가 필요한 검증은 별도 명령이다. | CI 전까지 회귀 탐지가 수동 실행에 의존한다. | 중간 | CI 환경 준비 후 `verify` 또는 GitHub workflow 필수 단계로 승격한다. |

## 해결된 항목
- 백엔드 검증 명령 부재: `2026-04-26` 에 `apps/back` 최소 Nest 하네스와 `lint`/`typecheck`/`test`/`build` 검증 명령을 추가했다.
