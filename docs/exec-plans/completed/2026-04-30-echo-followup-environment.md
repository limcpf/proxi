# Echo 후속 slice 와 개발 환경 보강 실행 계획

## 상태
- 상태: completed
- 시작일: 2026-04-30
- 완료일: 2026-05-03
- 기준 제품 문서: [`docs/product-specs/2026-04-30-echo-followup-slices.md`](../../product-specs/2026-04-30-echo-followup-slices.md)
- DnD: attachment, archive/restore, 단순 검색, 개발 환경 문서, proxy/CORS, 오류 shape, E2E 진입점을 구현하고 `corepack pnpm run verify` 를 통과한다.

## 목표
- 브라우저 E2E 기준 URL 을 `http://localhost:5173` 하나로 통일한다.
- 로컬 PostgreSQL 과 migration apply 절차를 문서와 script 로 고정한다.
- Echo attachment persistence, archive 목록/복구, 단순 검색을 후속 slice 로 구현한다.
- Agent 도메인, AI Agent 답변, embedding/vector search 는 현재 브랜치 범위에서 제외하고 기술 부채로 남긴다.

## 작업 단계
1. 개발 문서, `.env.example`, Docker Compose, Prisma migration script 를 추가한다.
2. Vite `/api` proxy 와 백엔드 CORS allowlist 를 추가한다.
3. Nest 전역 exception filter 로 `code`, `message`, `details`, `requestId` 오류 shape 을 고정한다.
4. Shared Echo 계약에 attachment, search query, archive/restore 응답을 반영한다.
5. Prisma attachment model 과 upload/download/claim persistence 를 추가한다.
6. `/echoes/archive`, `/echoes/:echoId/restore`, `GET /echoes?q=` 흐름을 Back/Front 에 연결한다.
7. Markdown renderer 를 전용 라이브러리 기반으로 교체한다.
8. Playwright E2E 와 Docker Compose 기반 DB integration test 명령을 추가한다.

## 검증 방법
이번 머지 게이트는 `corepack pnpm run verify` 통과를 기준으로 한다.

- `corepack pnpm --filter @proxi/shared test`
- `corepack pnpm --filter @proxi/back test`
- `corepack pnpm --filter @proxi/front test`
- `corepack pnpm --filter @proxi/back typecheck`
- `corepack pnpm --filter @proxi/front typecheck`
- `corepack pnpm run verify`
- 별도 로컬 검증: `corepack pnpm --filter @proxi/back test:integration`
- 별도 로컬 검증: `corepack pnpm --filter @proxi/front e2e`

`test:integration` 과 `e2e` 는 로컬 DB, migration, 브라우저 준비가 필요한 별도 검증이므로 이번 머지 게이트에서는 제외한다. CI 환경 준비 후 필수 검증으로 승격한다.

## 결정 로그
- 2026-04-30: 개발 기본 API 경로는 Vite `/api` proxy 로 두고 백엔드는 `PROXI_CORS_ORIGINS` allowlist 를 명시한다.
- 2026-04-30: 로컬 migration 은 `prisma migrate dev`, 운영/CI migration 은 `prisma migrate deploy` 로 분리한다.
- 2026-04-30: attachment 개발 저장소는 `apps/back/.local/uploads` 로 두고 `PROXI_UPLOAD_ROOT` 로 교체 가능하게 한다.
- 2026-04-30: 첫 attachment 업로드 전송은 신규 multipart 의존성 없이 base64 JSON payload 로 구현한다.
- 2026-04-30: 검색 1차는 PostgreSQL 본문 contains 검색으로 구현하고 vector search 는 후속으로 둔다.
- 2026-05-03: 후속 slice 구현과 보강 리뷰 수정을 완료했고 최종 머지 게이트는 `corepack pnpm run verify` 로 둔다.

## 남은 이슈
- Cloudflare R2 또는 Backblaze B2 호환 object storage adapter.
- Agent 도메인과 mention 실제 검증.
- AI Agent 반응과 답변 job 처리.
- embedding provider, vector 저장소, 재색인 전략.
- DB integration test 와 E2E 의 CI 필수 검증 승격.
