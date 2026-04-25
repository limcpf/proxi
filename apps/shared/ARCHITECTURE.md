# shared 기준 문서

## 함께 읽을 문서
- 운영 절차와 재현성 점검: [`/Users/lim/dev/proxi/apps/shared/README.md`](./README.md)
- 도입 결정 근거: [`/Users/lim/dev/proxi/docs/design-docs/2026-04-25-proxi-shared-harness.md`](../../docs/design-docs/2026-04-25-proxi-shared-harness.md)

## 현재 결론
- package: `@proxi/shared`
- path: `apps/shared`
- package type: internal workspace package, no publish
- runtime format: `ESM`
- build output: `dist` JavaScript + `.d.ts`
- validation: `zod`
- testing: `Vitest`

## 책임
- 프로젝트 공통 계약, 타입, 상수를 코드로 관리한다.
- `front` 와 `back` 이 함께 쓸 수 있는 순수 유틸을 둔다.
- 런타임 검증이 필요한 공통 데이터 형태는 `zod` schema 로 표현한다.
- 계약과 타입은 가능한 한 shared 에서 먼저 수립하고 각 프로젝트가 소비한다.

## 포함하지 않는 것
- DB 접근 코드
- React 의존 코드
- NestJS 전용 코드
- 브라우저나 서버 중 한쪽에만 묶이는 IO 코드
- `front` 또는 `back` 내부 모듈 import

## 공개 API
- `src/index.ts`: public API 단일 진입점
- `src/contracts`: 공통 계약, 상수, `zod` schema
- `src/types`: 공통 타입
- `src/utils`: 런타임 환경에 묶이지 않는 순수 유틸

초기 API 는 하네스 검증을 위한 최소 계약으로 시작한다. 실제 도메인 계약은 기능 작업에서 근거를 남기고 확장한다.

## import 정책
- 허용: `apps/front` -> `apps/shared`
- 허용: `apps/back` -> `apps/shared`
- 금지: `apps/shared` -> `apps/front`
- 금지: `apps/shared` -> `apps/back`

## 빌드와 검증
- `corepack pnpm --filter @proxi/shared typecheck`
- `corepack pnpm --filter @proxi/shared test`
- `corepack pnpm --filter @proxi/shared build`
- `corepack pnpm run verify`

기능, 계약, 타입에 대한 테스트를 모두 유지한다.

## 의존성 정책
- 기본 의존성은 `zod` 만 둔다.
- 테스트와 빌드 도구는 `typescript`, `vitest` 로 시작한다.
- 새 런타임 의존성은 필요성이 명확하고 사용자 승인이 있을 때만 추가한다.
