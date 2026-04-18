# 시스템 지도

## 공통 도구체인
- Node LTS `v24.14.1`
- Corepack enabled
- `pnpm@10.33.0`
- TypeScript `6.0`
- Git `2.43.0`

## 저장소 구조
- 루트는 모노레포 진입점이며 공통 규칙과 공통 문서 시스템을 가진다.
- 워크스페이스 범위는 `apps/*` 이다.
- 현재 저장소에 존재하는 앱은 `apps/back`, `apps/front` 이다.
- `front`, `back`, `shared` 는 운영상 서로 다른 문맥으로 취급하며, 새 프로젝트가 추가되면 각 루트에 `AGENTS.md` 와 `ARCHITECTURE.md` 를 둔다.

## 문서 계층
- 루트 `AGENTS.md`: 어떤 문서를 먼저 읽어야 하는지 정하는 라우터
- 프로젝트별 `AGENTS.md`: 해당 프로젝트 전용 규칙과 검증 기준
- `docs/`: 버전 관리되는 지식 저장소
- `docs/exec-plans/`: 진행 중이거나 완료된 작업 기억

## 현재 하위 프로젝트
- `apps/back`
  - 세부 기술 스택과 운영 경계는 [`/Users/lim/dev/proxi/apps/back/ARCHITECTURE.md`](./apps/back/ARCHITECTURE.md) 참고
- `apps/front`
  - 세부 기술 스택과 구현 기본값은 [`/Users/lim/dev/proxi/apps/front/ARCHITECTURE.md`](./apps/front/ARCHITECTURE.md) 참고

## 운영 원칙
- 저장소 밖에만 존재하는 규칙은 공식 규칙으로 간주하지 않는다.
- 구조 변경은 설계 문서 또는 실행 계획 문서로 근거를 남긴다.
- 품질, 신뢰성, 보안 기준은 문서와 검증 절차를 함께 갱신한다.
