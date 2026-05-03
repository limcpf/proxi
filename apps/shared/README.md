# proxi shared

`apps/shared` 는 `front` 와 `back` 이 함께 쓰는 공통 계약, 타입, 상수, 순수 유틸을 관리하는 내부 workspace 패키지다.

## 개발 시작
- 의존성 설치: `corepack pnpm install`
- lint 실행: `corepack pnpm --filter @proxi/shared lint`
- 테스트 실행: `corepack pnpm --filter @proxi/shared test`
- 타입 검증: `corepack pnpm --filter @proxi/shared typecheck`
- 빌드 실행: `corepack pnpm --filter @proxi/shared build`

## 검증 명령
- shared lint: `corepack pnpm --filter @proxi/shared lint`
- shared 테스트: `corepack pnpm --filter @proxi/shared test`
- shared 타입 검증: `corepack pnpm --filter @proxi/shared typecheck`
- shared 빌드: `corepack pnpm --filter @proxi/shared build`
- 저장소 전체 검증: `corepack pnpm run verify`

## 디렉터리 책임
- `src/contracts`: 공통 계약, 상수, `zod` schema
- `src/types`: 공통 타입
- `src/utils`: 런타임 환경에 묶이지 않는 순수 유틸
- `src/index.ts`: public API 단일 진입점

## 소비 규칙
- `front` 와 `back` 은 `@proxi/shared` 의 public API 만 import 한다.
- `shared` 는 `front` 또는 `back` 내부 코드를 import 하지 않는다.
- DB 접근 코드, React 의존 코드, NestJS 전용 코드는 shared 에 두지 않는다.

## import 예시

```ts
import { proxiEntityIdSchema, toApiSuccess } from "@proxi/shared";
```

## 참고 문서
- 기준 문서: [`/Users/lim/dev/proxi/apps/shared/ARCHITECTURE.md`](./ARCHITECTURE.md)
- 도입 결정 근거: [`/Users/lim/dev/proxi/docs/design-docs/2026-04-25-proxi-shared-harness.md`](../../docs/design-docs/2026-04-25-proxi-shared-harness.md)
