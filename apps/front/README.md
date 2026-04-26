# proxi front

현재 `apps/front` 는 `proxi` 프런트 기준을 고정하기 위한 front harness 이다. 실제 제품 화면을 본격적으로 붙이기 전에 스택, 상태 책임, 검증 진입점을 먼저 맞추는 용도로 유지한다.

## 개발 시작
- 의존성 설치: `corepack pnpm install`
- 프런트 dev server 실행: `corepack pnpm --filter @proxi/front dev`

## 검증 명령
- 프런트 lint: `corepack pnpm --filter @proxi/front lint`
- 프런트 타입 검증: `corepack pnpm --filter @proxi/front typecheck`
- 프런트 테스트: `corepack pnpm --filter @proxi/front test`
- 프런트 빌드: `corepack pnpm --filter @proxi/front build`
- 저장소 전체 검증: `corepack pnpm run verify`

## 재현성 점검
깨끗한 환경에서도 같은 결과가 나와야 한다. 기준 절차는 아래 순서로 고정한다.

1. `corepack pnpm install --frozen-lockfile`
2. `corepack pnpm --filter @proxi/front lint`
3. `corepack pnpm --filter @proxi/front typecheck`
4. `corepack pnpm --filter @proxi/front test`
5. `corepack pnpm --filter @proxi/front build`
6. `corepack pnpm run verify`

이 절차가 통과하면 lockfile 기준 설치와 현재 검증 진입점이 서로 맞는 상태로 본다.

## 디렉터리 책임
- `src/app`: 앱 bootstrap, provider, router
- `src/routes`: route tree 와 page entry
- `src/features`: 기능 단위 로직과 UI 조합
- `src/components/ui`: 재사용 primitive
- `src/lib`: 공통 유틸, query helper, client 보조 코드

## 작업 기본 규칙
- 프런트는 백엔드 내부 코드를 직접 import 하지 않고 HTTP API 계약으로만 통신한다.
- 공통 계약은 `@proxi/shared` public API 만 import 한다.
- 상태는 URL, 서버 상태, 폼 상태, 로컬 UI 상태로 나눠서 관리한다.
- 전역 상태 라이브러리는 명확한 근거 없이는 기본값으로 추가하지 않는다.
- 프런트 전용 타입과 로직은 근거 없이 `shared` 로 승격하지 않는다.

## 참고 문서
- 기준 문서: [`/Users/lim/dev/proxi/apps/front/ARCHITECTURE.md`](./ARCHITECTURE.md)
- 스택 결정 근거: [`/Users/lim/dev/proxi/docs/design-docs/2026-04-18-proxi-front-spa-stack.md`](../../docs/design-docs/2026-04-18-proxi-front-spa-stack.md)
- 디자인 원칙: [`/Users/lim/dev/proxi/docs/design-docs/2026-04-18-proxi-front-design-principles.md`](../../docs/design-docs/2026-04-18-proxi-front-design-principles.md)
- UI UX 원칙: [`/Users/lim/dev/proxi/docs/product-specs/2026-04-18-proxi-front-ui-ux-principles.md`](../../docs/product-specs/2026-04-18-proxi-front-ui-ux-principles.md)
