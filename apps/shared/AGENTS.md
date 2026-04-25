# shared 작업 라우터

## 항상 먼저 읽을 문서
- [`/Users/lim/dev/proxi/apps/shared/ARCHITECTURE.md`](./ARCHITECTURE.md)
- 루트 [`/Users/lim/dev/proxi/AGENTS.md`](../../AGENTS.md)

## 작업 유형별 추가로 읽을 문서
- 구조 변경, 경계 변경, 새 규칙 도입: [`/Users/lim/dev/proxi/docs/DESIGN.md`](../../docs/DESIGN.md), [`/Users/lim/dev/proxi/docs/design-docs/index.md`](../../docs/design-docs/index.md)
- API 계약, 공통 타입, 데이터 형태 변경: [`/Users/lim/dev/proxi/docs/RELIABILITY.md`](../../docs/RELIABILITY.md)
- 인증, 인가, 비밀정보, 외부 연동 계약 변경: [`/Users/lim/dev/proxi/docs/SECURITY.md`](../../docs/SECURITY.md)
- 장시간 작업: [`/Users/lim/dev/proxi/docs/PLANS.md`](../../docs/PLANS.md)

## shared 작업 규칙
- shared 관련 사실의 기준 문서는 이 디렉터리의 `ARCHITECTURE.md` 이다.
- `front` 와 `back` 은 `shared` 를 import 할 수 있지만, `shared` 는 `front` 나 `back` 을 import 하지 않는다.
- DB 접근 코드, React 의존 코드, NestJS 전용 코드는 shared 에 두지 않는다.
- 공통 계약, 타입, 상수, `zod` schema 는 shared 에서 우선 수립한다.
- public API 는 `src/index.ts` 를 통해서만 노출한다.
- 사용자가 승인하지 않은 신규 의존성은 추가하지 않는다.

## 완료 기준
- shared 변경은 `corepack pnpm --filter @proxi/shared test`, `typecheck`, `build` 를 통과해야 한다.
- 구조나 문서 라우팅이 바뀌면 `corepack pnpm run verify` 를 통과해야 한다.
