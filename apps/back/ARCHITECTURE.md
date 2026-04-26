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

## 검증
- `corepack pnpm --filter @proxi/back lint`
- `corepack pnpm --filter @proxi/back typecheck`
- `corepack pnpm --filter @proxi/back test`
- `corepack pnpm --filter @proxi/back build`
- `corepack pnpm run verify`

## 보류
- Prisma schema, migration, Docker DB 구성
- Grafana Alloy, Prometheus, Loki, Tempo, Grafana 실제 배포 구성
