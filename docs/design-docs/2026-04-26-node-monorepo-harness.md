# Node 모노레포 하네스 보강

## 상태
accepted

## 배경
- 저장소는 `apps/*` 범위의 pnpm workspace 로 `front`, `back`, `shared` 를 운영한다.
- 기존 `front` 와 `shared` 는 검증 가능했지만 `back` 은 package placeholder 에 가까웠다.
- `@proxi/shared` 는 내부 패키지로 존재했지만 소비 앱의 `workspace:*` 의존성으로 연결되어 있지 않았다.
- Node 버전 기준도 `.nvmrc`, 문서, CI 사이에 불일치가 있었다.

## 결정
- Node 기준은 CI 와 문서 기준인 `v24.14.1` 로 단일화한다.
- pnpm 버전 기준은 루트 `package.json` 의 `packageManager` 에만 둔다.
- `@proxi/shared` 는 `dist` 기반 public API 를 유지하고, `front` 와 `back` 이 `workspace:*` 로 소비한다.
- `apps/back` 은 NestJS 최소 하네스와 `lint`/`typecheck`/`test`/`build` 검증 명령을 가진다.
- `Biome` 은 루트 공통 lint 도구로 두고 각 앱은 `biome check .` 를 실행한다.
- 저장소 전체 검증은 shared build 후 workspace lint, typecheck, test, build 를 순서대로 실행한다.

## 대안
- shared `src` 직접 import: 소비자 TS 설정과 런타임 배포 형태가 달라져 제외했다.
- 백엔드 no-op 검증만 추가: 에이전트가 실제 Nest 경계에서 작업하기 어렵기 때문에 제외했다.
- Prisma 와 DB 구성까지 한 번에 추가: 이번 목표가 Node 모노레포 하네스 안정화이므로 후속 작업으로 남겼다.

## 영향
- `front` 와 `back` 은 `@proxi/shared` public API 를 실제 workspace 의존성으로 import 할 수 있다.
- 백엔드 변경도 프런트와 shared 처럼 기계 검증 완료 기준을 가진다.
- `corepack pnpm run verify` 는 문서 구조와 전체 workspace 하네스를 함께 확인한다.

## 후속 작업
- 백엔드 도메인 기능이 생기면 Prisma schema, migration, DB 검증 명령을 별도 설계로 추가한다.
- 운영 관측 가능성 스택은 실제 수집 지점과 배포 경로가 생길 때 문서와 검증을 함께 확장한다.
