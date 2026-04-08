# 문서 시스템

이 디렉터리는 저장소 안에서 버전 관리되는 지식 저장소다. 루트 `AGENTS.md` 는 이 문서들로 라우팅하고, 실제 판단 기준과 작업 기억은 여기서 관리한다.

## 빠른 라우팅
- 문서 구조 탐색, 문서 추가/이동, 인덱스 갱신: [`/Users/lim/dev/proxi/docs/generated/context-map.json`](./generated/context-map.json), 이 문서
- 구조 변경, 경계 변경, 새 규칙 도입: [`/Users/lim/dev/proxi/docs/DESIGN.md`](./DESIGN.md), [`/Users/lim/dev/proxi/docs/design-docs/index.md`](./design-docs/index.md)
- 장시간 작업, 중단 후 재개 필요: [`/Users/lim/dev/proxi/docs/PLANS.md`](./PLANS.md), [`/Users/lim/dev/proxi/docs/exec-plans/active/README.md`](./exec-plans/active/README.md)
- 품질 수준 판단과 후속 작업 정리: [`/Users/lim/dev/proxi/docs/QUALITY_SCORE.md`](./QUALITY_SCORE.md), [`/Users/lim/dev/proxi/docs/exec-plans/tech-debt-tracker.md`](./exec-plans/tech-debt-tracker.md)

## 디렉터리 책임
- `design-docs/`: 설계 결정과 구조 선택
- `product-specs/`: 사용자 동작과 수용 기준
- `exec-plans/`: 진행 중이거나 완료된 실행 계획
- `generated/`: 기계가 우선 소비하는 파생 문서와 라우팅 색인
- `references/`: 외부 문서의 로컬 요약

## 운영 원칙
- 문서는 가능한 한 경로별 책임이 분명해야 한다.
- 같은 규칙을 여러 파일에 중복하지 않는다.
- 규칙이 바뀌면 라우터보다 실제 기준 문서를 먼저 수정한다.
- 라우팅 대상 문서는 `docs/generated/context-map.json` 에 등록한다.
- 각 하위 폴더는 `index.md` 또는 `README.md` 로 후속 문서를 노출한다.
- `docs` 아래 Markdown 이 아닌 파일은 `docs/generated/` 에만 둔다.
- 문서 구조 변경 후에는 `pnpm run verify:docs` 를 통과시킨다.
