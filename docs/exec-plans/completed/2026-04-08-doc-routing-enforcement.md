# 문서 라우팅 강제 체계 도입

상태: `completed`
완료일: `2026-04-08`

## 목표
- 문서 구조 준수를 운영 규칙이 아니라 기계 검증 규칙으로 승격한다.

## 범위
- `docs/generated/context-map.json` 추가
- `verify:docs` 와 CI 검증 엔트리 추가
- 라우터, 인덱스, 설계 문서, 기술 부채 문서 갱신

## 작업 단계
- 문서 라우팅에 필요한 기준 문서와 하위 폴더 인덱스 상태를 다시 확인했다.
- `context-map.json` 과 `verify-doc-structure.mjs` 를 추가해 링크, 인덱스, 경계 규칙을 검증하도록 만들었다.
- 루트 라우터와 `docs/` 운영 문서를 새 검증 규칙에 맞게 갱신했다.
- PR 에서 `pnpm run verify` 를 실행하는 CI 워크플로를 추가했다.

## 검증 방법
- `pnpm run verify:docs`
- `pnpm run verify`

## 결정 로그
- 기계용 문서 목차는 `docs/generated/context-map.json` 에 둔다.
- 문서 구조 위반은 경고가 아니라 PR 실패로 처리한다.
- 신규 외부 의존성 없이 Node 표준 라이브러리만 사용한다.

## 남은 이슈
- `context-map.json` 은 아직 수동 갱신이 필요하다.
- `apps/back` 에는 여전히 `lint`, `test`, `build` 스크립트가 없다.
