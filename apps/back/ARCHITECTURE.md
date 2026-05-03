# Framework
- NestJS@11.1.18
- Biome@2.4

# Package
- package: `@proxi/back`
- runtime format: `ESM`
- shared contract: `@proxi/shared` public API

# DB
- PostgreSQL@18.3
  - Use Docker
# ORM
- Prisma@7.6.0

# Logging
- Grafana Alloy@1.15.0
- Prometheus@3.11.0
- Loki@3.7.1
- Tempo@2.10.3
- Grafana@12.4.2

## Logging Architect
0. NestJS(로그 발생)
1. Grafana Alloy (수집/가공)
1.1. Prometheus (메트릭)
1.2. Loki (로그)
1.3. Tempo (트레이스)
2. Grafana (조회/대시보드/알림)

## 현재 하네스
- `src/main.ts`: Nest 앱 bootstrap
- `src/app.module.ts`: 최소 앱 모듈
- `src/app.controller.ts`: `GET /health`, `GET /shared-contract`
- `src/app.service.ts`: health 응답과 shared 계약 smoke 응답
- `src/common/auth/current-actor.ts`: 첫 버전의 로그인 없는 단일 owner 요청 액터 resolver
- `src/echo`: Echo 작성, 목록, 상세, 수정, 아카이브, 복구, 댓글, 검색
- `src/attachment`: Echo attachment 업로드와 권한 확인 stream 다운로드
- `prisma/schema.prisma`: Echo, EchoMention, Attachment persistence schema

## 개발 운영
- 개발 기본 CORS origin 은 `PROXI_CORS_ORIGINS` 로 제어하며 기본값은 `http://localhost:5173` 이다.
- 개발 attachment 저장소는 `PROXI_UPLOAD_ROOT` 로 제어하며 기본값은 `.local/uploads` 이다.
- attachment download URL 의 public origin 은 `PROXI_PUBLIC_API_BASE_URL` 로 제어한다. 값이 없으면 기존 상대 경로를 반환한다.
- 로컬 migration 은 `corepack pnpm --filter @proxi/back prisma:migrate:dev` 를 사용한다.
- 운영/CI migration 은 `corepack pnpm --filter @proxi/back prisma:migrate:deploy` 를 사용한다.

## 검증
- `corepack pnpm --filter @proxi/back lint`
- `corepack pnpm --filter @proxi/back typecheck`
- `corepack pnpm --filter @proxi/back test`
- `corepack pnpm --filter @proxi/back build`
- `corepack pnpm run verify`

## 보류
- Grafana Alloy, Prometheus, Loki, Tempo, Grafana 실제 배포 구성
- Cloudflare R2 또는 Backblaze B2 호환 object storage adapter
