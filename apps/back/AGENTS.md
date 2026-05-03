# 백엔드 작업 라우터

## 항상 먼저 읽을 문서
- [`/Users/lim/dev/proxi/apps/back/ARCHITECTURE.md`](./ARCHITECTURE.md)
- 루트 [`/Users/lim/dev/proxi/AGENTS.md`](../../AGENTS.md)

## 작업 유형별 추가로 읽을 문서
- NestJS 모듈 경계, DB 구조, 외부 연동, 로깅 구조 변경: [`/Users/lim/dev/proxi/docs/DESIGN.md`](../../docs/DESIGN.md), [`/Users/lim/dev/proxi/docs/design-docs/index.md`](../../docs/design-docs/index.md)
- 스키마, 마이그레이션, 운영 장애 대응, 재시도 정책 변경: [`/Users/lim/dev/proxi/docs/RELIABILITY.md`](../../docs/RELIABILITY.md)
- 인증, 인가, 비밀정보, 데이터 노출면 변경: [`/Users/lim/dev/proxi/docs/SECURITY.md`](../../docs/SECURITY.md)
- 장시간 작업: [`/Users/lim/dev/proxi/docs/PLANS.md`](../../docs/PLANS.md)

## 백엔드 작업 규칙
- 백엔드 관련 사실의 기준 문서는 이 디렉터리의 `ARCHITECTURE.md` 이다.
- DB, ORM, 로깅 파이프라인에 영향을 주는 변경은 설계 근거 또는 실행 계획을 남긴다.
- 관측 가능성 스택 변경은 수집 지점, 저장소, 조회 경로를 함께 설명한다.
- `@proxi/shared` 는 public API 만 `workspace:*` 의존성으로 소비한다.

## 완료 기준
- 수정이 백엔드 동작 경계에 영향을 주면 관련 문서가 함께 갱신되어야 한다.
- 백엔드 변경은 `corepack pnpm --filter @proxi/back lint`, `typecheck`, `test`, `build` 를 통과해야 한다.
- 구조나 문서 라우팅이 바뀌면 `corepack pnpm run verify` 를 통과해야 한다.
