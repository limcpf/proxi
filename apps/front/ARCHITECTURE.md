# 프런트 기준 문서

## 함께 읽을 문서
- 운영 절차와 재현성 점검: [`/Users/lim/dev/proxi/apps/front/README.md`](./README.md)
- 화면 디자인 시스템: [`/Users/lim/dev/proxi/apps/front/DESIGN.md`](./DESIGN.md)
- 스택 결정 근거: [`/Users/lim/dev/proxi/docs/design-docs/2026-04-18-proxi-front-spa-stack.md`](../../docs/design-docs/2026-04-18-proxi-front-spa-stack.md)
- 디자인 원칙: [`/Users/lim/dev/proxi/docs/design-docs/2026-04-18-proxi-front-design-principles.md`](../../docs/design-docs/2026-04-18-proxi-front-design-principles.md)
- UI UX 원칙: [`/Users/lim/dev/proxi/docs/product-specs/2026-04-18-proxi-front-ui-ux-principles.md`](../../docs/product-specs/2026-04-18-proxi-front-ui-ux-principles.md)

## 문서 역할
- 이 문서: 스택, 책임, 구현 기본값
- `DESIGN.md`: 실제 화면 제작 시 적용할 시각 언어, token, 컴포넌트 스타일
- 디자인 원칙 문서: 과거 디자인 결정과 배경
- UI UX 원칙 문서: 화면 목적, 액션 위계, 점진적 공개, 정보 밀도

## 현재 결론
- app type: `React SPA`
- base stack: `React + Vite + TypeScript`
- router/data: `TanStack Router + TanStack Query`
- form/validation: `react-hook-form + zod`
- styling/ui: `Tailwind CSS + shadcn/ui + Radix UI`
- testing: `Vitest + Testing Library + Playwright`
- design direction: `IBM layout discipline`, `Threads-style content tone`, `focused compose flow`
- copy direction: `Korean-first UI copy`
- UI UX direction: `one page, one purpose`, `one primary action`, `progressive disclosure`

## 왜 `React SPA` 로 시작하는가

### 지금 필요한 것은 `SSR` 이 아니라 `제품 UI` 다
- 현재 시작점은 `apps/back` 중심이다.
- 첫 `front` 는 공개 마케팅 사이트보다 제품 UI, 운영 UI, 콘솔 UI 에 가깝다.
- 현재 단계에서는 `SEO`, `SSR`, `RSC`, `BFF` 복잡도를 먼저 들일 이유가 약하다.

결론:
- 지금은 `Next.js` 보다 `React + Vite` 가 더 가볍고 명확하다.

### 라우팅과 데이터는 `TanStack` 으로 맞추는 편이 자연스럽다
- `TanStack Router` 는 search params 기반 상태 설계에 유리하다.
- `TanStack Query` 와 함께 route 단위 prefetch, cache, invalidation 을 맞추기 쉽다.
- 필터, 정렬, 페이지네이션, 탭 상태를 URL 에 올리기 좋다.

결론:
- `React Router + TanStack Query` 조합보다 `TanStack Router + TanStack Query` 조합을 우선한다.

### `Tailwind` 는 속도를 위해 쓰되 자유도를 줄인다
- 화면은 빠르게 만들되, 스타일 값은 token 과 variant 로 제한해야 한다.
- `DESIGN.md` 와 UI UX 원칙 문서가 `Tailwind` 사용의 제약 기준이 된다.

## 채택 스택

### 핵심
- UI runtime: `React`
- Build / dev server: `Vite`
- Language: `TypeScript`
- Routing: `TanStack Router`
- Server state / cache: `TanStack Query`
- Form state: `react-hook-form`
- Validation: `zod`
- Styling: `Tailwind CSS`
- UI primitive / base components: `shadcn/ui`, `Radix UI`
- Testing: `Vitest`, `Testing Library`, `Playwright`

### 보조
- Icon: `lucide-react` 계열 사용 가능
- Class utility: `clsx`, `tailwind-merge` 계열 사용 가능

보조 라이브러리는 필요가 명확할 때만 추가한다.

## 지금 하지 않는 것

### 채택하지 않음
- `Next.js`
- 초기 기본값으로서의 전역 상태 라이브러리
- 프런트 전용 타입과 로직의 근거 없는 `shared` 승격
- 백엔드 코드 직접 import
- 임의값 중심 Tailwind 스타일링

### 보류
- OpenAPI 기반 타입/클라이언트 자동 생성
- Storybook
- 다국어 시스템
- 디자인 token 자동 생성 파이프라인

보류는 필요가 명확해질 때 추가한다.

## 상태 책임 분리
- URL 상태: `TanStack Router`
- 서버 비동기 상태: `TanStack Query`
- 폼 입력 상태: `react-hook-form`
- 동기 검증 규칙: `zod`
- 일시적 UI 상태: 컴포넌트 로컬 state

기본 원칙:
- 필터, 정렬, 탭, 페이지네이션은 가능하면 URL 로 올린다.
- 서버 응답 캐시는 Query 에 둔다.
- 입력 중 폼 값은 Form 에 둔다.
- 모달 열림, 드롭다운 상태 같은 짧은 상태는 local state 로 둔다.
- 여러 도구에 같은 상태를 중복 보관하지 않는다.

## API 연동 원칙
- 프런트는 백엔드 모듈을 직접 import 하지 않는다.
- 프런트는 HTTP API 계약을 통해 백엔드와 통신한다.
- 개발 기본 API 경로는 Vite proxy 의 `/api` 이며 백엔드 origin 은 `http://localhost:3000` 이다.
- attachment download 는 백엔드가 내려준 `downloadUrl` 을 그대로 사용한다. 교차 origin 배포에서는 백엔드 `PROXI_PUBLIC_API_BASE_URL` 과 프런트 `VITE_PROXI_API_BASE_URL` 이 같은 public API origin 을 가리켜야 한다.
- Echo 작성 또는 댓글 작성 중 attachment 업로드 후 본문 생성이 실패하면 프런트 API layer 에서 성공한 미연결 attachment 를 삭제해 orphan 누적을 막는다.
- 브라우저 E2E 기준 URL 은 `http://localhost:5173` 하나로 통일한다.
- 초반에는 얇은 API layer 로 시작한다.
- API 계약이 커지면 OpenAPI 기반 생성 방식을 검토한다.

기본 규칙:
- API 호출은 route component 안에서 직접 흩뿌리지 않는다.
- feature 또는 domain 단위 query / mutation 함수로 모은다.
- query key 는 일관된 규칙으로 만든다.
- mutation 후 invalidation 규칙을 명시한다.

## 스타일링 원칙
- `Tailwind CSS` 를 사용한다.
- raw utility 남용보다 semantic class 와 component variant 를 우선한다.
- `DESIGN.md` 의 typography, spacing, token, component 기준을 따른다.
- UI UX 원칙 문서의 정보 밀도, 버튼 수, primary action 규칙을 따른다.

기본 방향:
- IBM식 정렬과 section segmentation
- Threads식 content-first feed 와 muted metadata
- neutral background 와 white card 중심의 soft visual system
- 8px grid 와 10-16px radius 중심의 readable UI
- one-primary-action per page

## 컴포넌트 원칙
- 반복 UI 는 component 로 승격한다.
- component 는 visual 이름보다 intent 와 variant 기준으로 정의한다.
- primitive -> composed component -> page section 순서로 쌓는다.
- 페이지마다 새 스타일을 만들기보다 기존 variant 를 재사용한다.

권장 분리:
- `ui`: button, input, dialog, badge 같은 primitive
- `features`: 사용자 행동 단위 조합
- `routes/pages`: 화면 단위 조합

## 디렉터리 기본값

```txt
apps/front
  src/
    app/
    routes/
    features/
    components/
      ui/
    lib/
```

의도:
- `app`: 앱 bootstrap, provider, router
- `routes`: route tree, page entry
- `features`: 기능 단위 로직과 UI
- `components/ui`: 재사용 primitive
- `lib`: 공통 유틸, API client, query helper

초기 구조는 단순하게 시작하고, 실제 기능이 생길 때만 확장한다.

## 페이지 설계 기본값
- 한 페이지는 하나의 중심 목적을 가진다.
- primary action 은 하나를 기본으로 한다.
- 부가 액션은 dropdown, menu, secondary action 으로 뒤로 뺀다.
- 정보는 요약 우선, 상세 후행으로 둔다.
- 고급 옵션은 기본적으로 접는다.

## 테스트 기본값
- 컴포넌트와 로직 테스트는 `Vitest + Testing Library` 로 시작한다.
- 브라우저 happy path 는 `Playwright` 로 별도 명령에서 검증한다.
- 우선순위는 아래 순서다.

1. 핵심 폼 검증
2. route 단위 loading / empty / error 상태
3. 주요 query / mutation 흐름
4. 사용자 핵심 액션 성공/실패 분기

## 에이전트용 구현 규칙
1. 이 화면의 중심 목적을 한 문장으로 적는다.
2. primary action 을 하나로 정한다.
3. URL 로 올라가야 할 상태를 먼저 분리한다.
4. query / mutation 경계를 정한다.
5. loading / empty / error / disabled 상태를 먼저 생각한다.
6. `DESIGN.md` 의 typography / spacing / component 기준에 맞춘다.
7. UI UX 원칙 문서의 버튼 수, 정보 밀도 규칙에 맞춘다.
8. 임의값이나 예외 variant 를 만들기 전 기존 패턴으로 설명 가능한지 확인한다.

## 금지 규칙
- `front` 가 백엔드 내부 코드를 직접 가져다 쓰지 않는다.
- 프런트 전용 타입과 로직을 근거 없이 `shared` 로 승격하지 않는다.
- 페이지마다 다른 디자인 규칙을 만들지 않는다.
- URL 상태, query 상태, form 상태를 한 군데에 억지로 몰아넣지 않는다.
- 전역 상태 라이브러리를 습관적으로 추가하지 않는다.
- 화면에 동등한 중요도의 버튼을 많이 늘어놓지 않는다.
