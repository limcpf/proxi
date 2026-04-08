# 생성 문서 저장소

이 디렉터리는 기계가 우선 소비하는 파생 문서와 라우팅 색인 전용이다.

## 현재 파일
- [`/Users/lim/dev/proxi/docs/generated/context-map.json`](./context-map.json): 문서 경로, 책임, 읽기 조건을 담은 기계용 목차

## 규칙
- `context-map.json` 은 `pnpm run verify:docs` 의 기준 입력으로 사용한다.
- `docs` 아래 Markdown 이 아닌 파일은 이 디렉터리에만 둔다.
- 문서 구조를 바꾸면 관련 인덱스와 `context-map.json` 을 함께 갱신한다.
- 사람이 직접 읽는 기준 문서는 여기에 두지 않는다.
