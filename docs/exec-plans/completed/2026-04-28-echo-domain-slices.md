# Echo 도메인 개발 실행 계획

## 상태
- 상태: completed
- 완료일: 2026-04-28
- 기준 제품 문서: [`docs/product-specs/2026-04-28-echo-domain-requirements.md`](../../product-specs/2026-04-28-echo-domain-requirements.md)
- 시작일: 2026-04-28
- DnD: Slice 1부터 Slice 5까지 모두 완료하고 `corepack pnpm run verify` 를 통과한다.
- 작업 범위: `apps/shared`, `apps/back`, `apps/front`, 관련 문서와 검증 스크립트

## 목표
- Echo 도메인의 작성, 목록, 상세, 수정, 소프트 삭제, 댓글 흐름을 제품 요구사항 기준으로 구현한다.
- Shared 계약을 먼저 고정해 Back 과 Front 가 같은 요청/응답 payload 와 validation 기준을 공유한다.
- Back 은 Nest 기반 Hexagonal 구조로 Echo domain/application/ports/adapters 경계를 만든다.
- Front 는 `/echoes`, `/echoes/$echoId` 흐름을 구현하고 mutation 이후 invalidate/refetch 방식으로 최신 상태를 보여준다.
- 구현 중 남기는 결정은 이 문서의 결정 로그에 즉시 반영한다.

## 포함 범위
- Shared Echo id/status/author/request/response 타입과 zod schema.
- Shared 계약 테스트.
- Prisma/PostgreSQL 기반 Echo persistence.
- Nest `EchoModule` 과 `/echoes` REST endpoint.
- Echo create/list/detail/update/archive/reply use case.
- Front `/echoes` 피드, 작성 폼, 목록 카드.
- Front `/echoes/$echoId` 상세, 댓글, 수정, 삭제 modal.
- loading, empty, error, disabled, permission, not found 상태.
- localStorage 기반 draft 보존.
- Echo 관련 단위, 계약, 화면, 통합 검증.

## 제외 범위
- AI Agent 도메인 구축.
- 실제 AI Agent 답변 생성.
- 파일 업로드와 attachment persistence.
- 아카이브 목록과 복구.
- 검색, 임베딩, 벡터 검색.
- 서버 저장 draft.
- optimistic update.
- 삭제 확인 전용 separate route.
- 무한 depth 댓글.

## 구현 기본 결정
- Agent mention 은 첫 구현에서 실제 Agent DB 검증을 하지 않는다. Shared 계약에는 `mentionedAgentIds` 확장 지점을 두고, raw body 는 그대로 보존한다.
- archived Echo 상세는 기존 `/echoes/$echoId` URL 에서 read-only 로 보여준다. 별도 아카이브 context 는 후속 slice 로 둔다.
- `EchoStatus` 는 shared enum 에 `draft`, `published`, `archived` 를 포함한다. 서버 v1 응답과 DB persistence 는 `published`, `archived` 만 생성하고 `draft` 는 Front localStorage 상태로만 사용한다.
- Echo 인용 표기는 `#e_<echoId>` 를 기준으로 한다.
- 댓글 depth 는 1로 제한한다. Back domain 에서 강제하고 Front 에서는 대댓글 작성 UI 를 제공하지 않는다.
- 목록은 cursor 기반 API 로 설계하고 Front 는 무한 스크롤 UX 로 소비한다.
- 첫 버전 actor 는 `owner` 단일 사용자로 고정한다. `agent` author type 은 계약과 persistence 확장 지점으로만 둔다.
- mutation 은 optimistic update 없이 성공 후 query invalidation/refetch 를 사용한다.

## Slice 1: Echo contract
- 상태: completed
- 대상: `apps/shared`
- 산출물: Echo branded id, status, author, request, response 타입.
- 산출물: `CreateEchoRequest`, `UpdateEchoRequest`, `EchoSummary`, `EchoDetail`, `ListEchoesResponse` zod schema.
- 산출물: public export 경로.
- 산출물: 빈 본문 거부, 상태 enum, 필수 응답 필드, id 형식, 필드명 안정성을 검증하는 계약 테스트.
- 검증: `corepack pnpm --filter @proxi/shared test`
- 검증: `corepack pnpm --filter @proxi/shared typecheck`
- 검증: `corepack pnpm --filter @proxi/shared build`
- 완료 기준: Back/Front 가 import 할 수 있는 Echo 계약이 shared public API 로 고정된다.

## Slice 2: Echo backend core
- 상태: completed
- 대상: `apps/back`
- 선행 읽기: `apps/back/AGENTS.md`, `apps/back/ARCHITECTURE.md`, `docs/RELIABILITY.md`
- 산출물: Prisma Echo model 과 필요한 migration 또는 schema 변경.
- 산출물: `EchoModule`.
- 산출물: domain entity 와 상태 전이, 권한, 댓글 depth 규칙.
- 산출물: create, list, get, update, archive, create reply use case.
- 산출물: repository port 와 Prisma repository adapter.
- 산출물: `/echoes`, `/echoes/:echoId`, `/echoes/:echoId/replies` controller.
- 산출물: HTTP adapter 입구의 shared zod validation.
- 산출물: `echo.created`, `echo.updated`, `echo.archived` 로그 이벤트.
- 검증: `corepack pnpm --filter @proxi/back test`
- 검증: `corepack pnpm --filter @proxi/back typecheck`
- 검증: `corepack pnpm --filter @proxi/back build`
- 완료 기준: API 레벨에서 create/list/detail/update/archive/reply 흐름이 테스트로 검증된다.

## Slice 3: Echo frontend feed
- 상태: completed
- 대상: `apps/front`
- 선행 읽기: `apps/front/AGENTS.md`, `apps/front/ARCHITECTURE.md`, `docs/product-specs/2026-04-18-proxi-front-ui-ux-principles.md`
- 산출물: `/echoes` route.
- 산출물: 상단 Echo 작성 폼.
- 산출물: 최신순 root Echo 피드.
- 산출물: cursor 기반 추가 조회 또는 무한 스크롤 소비 구조.
- 산출물: `EchoFeedItemViewModel` mapping.
- 산출물: TanStack Query key `['echoes', 'list', { cursor, status }]`.
- 산출물: 작성 성공 후 `['echoes', 'list']` invalidation.
- 검증: `corepack pnpm --filter @proxi/front test`
- 검증: `corepack pnpm --filter @proxi/front typecheck`
- 검증: `corepack pnpm --filter @proxi/front build`
- 완료 기준: 사용자가 `/echoes` 에서 Echo 를 작성하고 피드에서 확인할 수 있다.

## Slice 4: Echo detail and editing
- 상태: completed
- 대상: `apps/front`, `apps/back`
- 산출물: `/echoes/$echoId` route.
- 산출물: 상세 조회, Markdown 렌더링, 댓글 목록, 댓글 작성 UI.
- 산출물: 수정 폼과 삭제 확인 modal.
- 산출물: archived Echo read-only 상세 상태.
- 산출물: `EchoViewModel` mapping.
- 산출물: 상세 query key `['echoes', 'detail', echoId]`.
- 산출물: 수정, 삭제, 댓글 작성 후 요구사항 기준 invalidation.
- 검증: `corepack pnpm --filter @proxi/front test`
- 검증: `corepack pnpm --filter @proxi/back test`
- 검증: `corepack pnpm run verify`
- 완료 기준: 상세, 댓글, 수정, 삭제 흐름이 제품 수용 기준과 테스트로 검증된다.

## Slice 5: hardening
- 상태: completed
- 대상: `apps/shared`, `apps/back`, `apps/front`
- 산출물: loading, empty, error, disabled, permission, not found 상태 문구 정리.
- 산출물: 저장 실패와 이탈 시 localStorage draft 보존.
- 산출물: archived Echo 댓글 차단 확인.
- 산출물: 권한 없는 actor 수정/삭제 차단 확인.
- 산출물: 테스트 누락 보강.
- 산출물: 전체 문서와 구현 사이 불일치 정리.
- 검증: `corepack pnpm run verify`
- 완료 기준: 전체 verify 통과와 함께 요구사항 문서의 수용 기준을 충족한다.

## 검증 방법
- Shared 단독: `corepack pnpm --filter @proxi/shared test`
- Shared typecheck: `corepack pnpm --filter @proxi/shared typecheck`
- Shared build: `corepack pnpm --filter @proxi/shared build`
- Back 단독: `corepack pnpm --filter @proxi/back test`
- Back typecheck: `corepack pnpm --filter @proxi/back typecheck`
- Back build: `corepack pnpm --filter @proxi/back build`
- Front 단독: `corepack pnpm --filter @proxi/front test`
- Front typecheck: `corepack pnpm --filter @proxi/front typecheck`
- Front build: `corepack pnpm --filter @proxi/front build`
- 전체 검증: `corepack pnpm run verify`

## 결정 로그
- 2026-04-28: 제품 기준 문서는 `docs/product-specs/2026-04-28-echo-domain-requirements.md` 로 고정한다.
- 2026-04-28: 첫 구현 순서는 Shared contract, Back core, Front feed, Front detail/editing, hardening 순서로 진행한다.
- 2026-04-28: 첫 구현의 완료 정의는 Slice 1부터 Slice 5까지 전체 완료와 `corepack pnpm run verify` 통과로 둔다.
- 2026-04-28: Agent mention 은 계약 확장 지점만 만들고 실제 Agent 도메인 검증은 후속 slice 로 둔다.
- 2026-04-28: archived Echo 는 기존 상세 URL 에서 read-only 로 보여준다.
- 2026-04-28: shared `EchoStatus` 는 `draft`, `published`, `archived` 를 포함하되 서버 v1 persistence 는 `published`, `archived` 만 사용한다.
- 2026-04-28: Prisma 7.6 은 `prisma.config.ts` 와 `@prisma/adapter-pg` 기반으로 구성한다.
- 2026-04-28: Markdown preview 는 첫 구현에서 신규 런타임 의존성 없이 안전한 최소 renderer 로 둔다.
- 2026-04-28: Slice 1-5 구현을 완료했고 최종 `corepack pnpm run verify` 로 DnD 를 확인한다.
- 2026-04-28: 최종 `corepack pnpm run verify` 가 통과했다.

## 남은 이슈
- 실제 PostgreSQL 컨테이너 실행과 migration apply 는 별도 운영/개발 환경 준비 시 확인해야 한다.
- Agent 도메인 검증, 파일 업로드, 아카이브 목록/복구, 검색/임베딩은 후속 slice 로 남긴다.
