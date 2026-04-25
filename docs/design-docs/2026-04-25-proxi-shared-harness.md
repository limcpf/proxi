# shared 하네스 도입

## 상태
accepted

## 배경
- 저장소는 `front`, `back`, `shared` 를 분리된 문맥으로 운영하는 방향을 가진다.
- 기존 워크스페이스 범위는 `apps/*` 이고 실제 프로젝트는 `apps/front`, `apps/back` 만 존재했다.
- 공통 계약, 타입, 상수, 검증 schema 를 각 프로젝트에 흩어두면 API 경계가 커질수록 중복과 불일치가 생긴다.

## 결정
- `apps/shared` 에 내부 workspace 패키지 `@proxi/shared` 를 둔다.
- `shared` 는 `front` 와 `back` 이 소비하는 공통 계약, 타입, 상수, 순수 유틸, `zod` schema 를 관리한다.
- `front/back -> shared` import 만 허용하고 `shared -> front/back` import 는 금지한다.
- 빌드는 `tsc` 로 `ESM` JavaScript 와 `.d.ts` 를 생성한다.
- 검증은 `Vitest` 기반 기능, 계약, 타입 테스트와 TypeScript build/typecheck 로 시작한다.

## 대안
- 타입 전용 패키지: `zod` schema 와 런타임 상수, 순수 유틸을 공유해야 하므로 제외했다.
- 빌드 산출물 없이 TS 소스 직접 import: 소비자 설정에 coupling 이 생기므로 제외했다.
- 루트 `shared` 디렉터리: 현재 workspace 규칙이 `apps/*` 이므로 `apps/shared` 를 선택했다.

## 영향
- `apps/shared/AGENTS.md` 와 `apps/shared/ARCHITECTURE.md` 가 새 프로젝트 기준 문서가 된다.
- `docs/generated/context-map.json` 은 shared 라우팅 문서를 포함한다.
- `front` 와 `back` 은 공통 계약을 `@proxi/shared` public API 로 소비할 수 있다.

## 후속 작업
- 실제 도메인 계약은 기능 단위 작업에서 추가한다.
- API 계약이 커지면 OpenAPI 기반 생성과 shared 수동 계약의 역할 분리를 다시 검토한다.
