# proxi 프런트 SPA 스택 기준

상태: `accepted`

## 배경
- 현재 저장소의 구현 중심은 `apps/back` 이다.
- 첫 프런트는 공개 마케팅 사이트보다 제품 UI, 운영 UI, 콘솔 UI 성격이 강하다.
- 초기 단계에서 `SSR`, `RSC`, `BFF` 복잡도를 함께 도입하면 운영 경계와 문서 기준이 불필요하게 커진다.

## 결정
- `apps/front` 는 `React SPA` 로 시작한다.
- 기본 도구체인은 `React + Vite + TypeScript` 로 둔다.
- 라우팅과 서버 상태는 `TanStack Router + TanStack Query` 로 맞춘다.
- 폼과 검증은 `react-hook-form + zod` 를 기본값으로 둔다.
- 스타일링은 `Tailwind CSS` 를 사용하되 semantic token 과 variant 중심으로 제한한다.
- UI primitive 는 `shadcn/ui` 와 `Radix UI` 계열을 기준으로 둔다.
- 저장소 루트 `shared` 패키지와 전역 상태 라이브러리는 초기 기본값으로 채택하지 않는다.

## 대안

### `Next.js`
- 장점: `SSR`, `RSC`, `SEO`, 파일 기반 라우팅과 서버 경계가 즉시 준비된다.
- 기각 이유: 현재 우선순위는 제품 UI 생산성과 운영 단순성이다. 초기 단계에서 필요한 복잡도보다 도입 비용이 크다.

### `React Router + TanStack Query`
- 장점: 익숙한 구성이며 조합 사례가 많다.
- 기각 이유: search params 기반 상태 설계와 route 단위 데이터 경계를 생각하면 `TanStack Router` 와 맞추는 편이 더 직접적이다.

### 루트 `shared` 패키지 선도입
- 장점: 타입과 유틸을 빠르게 재사용할 수 있다.
- 기각 이유: 초기에는 경계를 흐리고 백엔드 직접 import 유혹을 키운다. HTTP 계약 기반 경계를 먼저 고정하는 편이 안전하다.

## 영향
- `apps/front` 는 독립된 프로젝트 문맥으로 추가하고 자체 `AGENTS.md` 와 `ARCHITECTURE.md` 를 둔다.
- 디자인 원칙과 UI UX 원칙은 별도 문서로 분리해 스택 문서의 책임을 좁힌다.
- 검증 기본값은 `Vitest + Testing Library` 로 시작하고, Storybook/E2E/OpenAPI 생성은 후순위로 둔다.

## 후속 작업
- [`/Users/lim/dev/proxi/apps/front/ARCHITECTURE.md`](../../apps/front/ARCHITECTURE.md) 에 구현 기본값을 고정한다.
- [`/Users/lim/dev/proxi/docs/design-docs/2026-04-18-proxi-front-design-principles.md`](./2026-04-18-proxi-front-design-principles.md) 에 시각 규칙을 분리한다.
- [`/Users/lim/dev/proxi/docs/product-specs/2026-04-18-proxi-front-ui-ux-principles.md`](../product-specs/2026-04-18-proxi-front-ui-ux-principles.md) 에 화면 동작 규칙을 분리한다.
