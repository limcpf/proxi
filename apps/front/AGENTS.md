# 프런트 작업 라우터

## 항상 먼저 읽을 문서
- [`/Users/lim/dev/proxi/apps/front/ARCHITECTURE.md`](./ARCHITECTURE.md)
- 화면 또는 컴포넌트 작업이면 [`/Users/lim/dev/proxi/apps/front/DESIGN.md`](./DESIGN.md)
- 루트 [`/Users/lim/dev/proxi/AGENTS.md`](../../AGENTS.md)

## 작업 유형별 추가로 읽을 문서
- 스택 변경, 구조 변경, 경계 변경, 새 규칙 도입: [`/Users/lim/dev/proxi/docs/DESIGN.md`](../../docs/DESIGN.md), [`/Users/lim/dev/proxi/docs/design-docs/index.md`](../../docs/design-docs/index.md)
- 화면 목적, 액션 위계, 점진적 공개 기준 확인: [`/Users/lim/dev/proxi/apps/front/DESIGN.md`](./DESIGN.md), [`/Users/lim/dev/proxi/docs/product-specs/index.md`](../../docs/product-specs/index.md)
- 장시간 작업: [`/Users/lim/dev/proxi/docs/PLANS.md`](../../docs/PLANS.md)

## 프런트 작업 규칙
- 프런트 관련 사실의 기준 문서는 이 디렉터리의 `ARCHITECTURE.md` 이다.
- 화면 시각 규칙과 컴포넌트 스타일 기준은 이 디렉터리의 `DESIGN.md` 이다.
- 화면 문구는 한국어를 기본으로 작성한다.
- 프런트는 백엔드 내부 코드를 직접 import 하지 않고 HTTP API 계약으로만 통신한다.
- 상태는 URL, 서버 상태, 폼 상태, 로컬 UI 상태로 나눠서 관리한다.
- 스타일링은 `Tailwind CSS` 를 쓰되 semantic token 과 variant 중심으로 제한한다.
- 전역 상태 라이브러리는 명확한 근거 없이는 기본값으로 추가하지 않는다.

## 완료 기준
- 프런트 동작 기준이 바뀌면 관련 문서와 인덱스가 함께 갱신되어야 한다.
- 실행 가능한 검증 명령을 수행하고, 실행하지 못한 검증이 있으면 이유를 남긴다.
