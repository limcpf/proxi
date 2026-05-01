# Echo 미니멀 피드 UI 실행 계획

## 상태
- 상태: completed
- 시작일: 2026-05-01
- 완료일: 2026-05-01
- 기준 제품 문서: [`docs/product-specs/2026-05-01-echo-minimal-feed-ui.md`](../../product-specs/2026-05-01-echo-minimal-feed-ui.md)
- DnD: Echo 피드 화면을 극단형 미니멀 기준으로 구현했고, 검색/첨부/아카이브/상세/복사 기능을 유지하며 `corepack pnpm run verify` 를 통과했다.

## 목표
- Echo feed route 의 기본 화면에서 설명과 반복 라벨을 제거한다.
- 작성, 최근 피드 본문, 필수 보조 액션만 남긴다.
- 기존 기능은 삭제하지 않고 기본 노출 위계만 낮춘다.

## 결과
- Echo feed route 의 hero, 반복 kicker, 과한 heading 을 제거했다.
- create composer 는 보이는 label 없이 textarea, `첨부`, submit 중심으로 줄였다.
- 파일 input 과 검색 input 은 기본 화면에서 숨기고 필요할 때만 노출한다.
- Echo card 는 본문을 먼저 보여주고 metadata 와 `상세`, `복사`를 낮은 위계로 정리했다.
- 후속 보정으로 Echo feed 를 Carbon-lite row/list UI 로 바꾸고, shadow 와 큰 radius 중심의 card 표현을 제거했다.
- 상세, 아카이브, loading/error/fallback surface 까지 같은 Carbon-lite shell 과 compact surface 규칙으로 통합했다.
- 본문과 정보성 문구의 구분을 강화하기 위해 Echo 본문은 더 큰 body scale 로 올리고, section label, count, metadata, status, placeholder, 보조 action 은 낮은 위계로 내렸다.
- 시스템 문구가 너무 약하고 element 별로 다르게 보이는 문제를 줄이기 위해 action text 와 버튼 크기/굵기를 15px semibold 기준으로 맞췄다.
- 관련 front 테스트를 보강해 검색 접힘, 숨김 첨부 input, 작성 invalidation, empty 상태를 확인한다.

## 범위
- 수정 대상은 Echo feed, archive, detail UI 와 공통 composer/card/style, 관련 front test 로 제한한다.
- public API, shared schema, 백엔드, DB, migration 은 변경하지 않는다.
- 모든 Echo route 는 메인 피드와 같은 Carbon-lite shell, compact surface, divider list 기준을 따른다.

## 작업 단계
1. `EchoFeedPage` 에서 hero section 을 제거하고 compose 를 첫 번째 주요 surface 로 올린다.
2. feed header 를 `최근` 과 표시 개수 중심으로 줄이고 archive 이동은 낮은 위계의 보조 링크로 둔다.
3. 검색 UI 를 접힌 상태로 바꾼다. 검색어가 없으면 `검색` 보조 액션만 보이고, 검색어가 있거나 사용자가 열면 input, submit, 초기화를 보인다.
4. `EchoComposer` create mode 에서 보이는 label 을 제거하고 placeholder 중심으로 입력 목적을 전달한다.
5. 파일 input 은 화면에서 숨기고 `첨부` 보조 액션으로 파일 선택을 열게 한다. 선택된 파일은 chip 또는 caption 으로 표시한다.
6. `EchoCard` 는 본문 우선 구조로 정리한다. metadata 와 action 은 낮은 대비의 한 줄 보조 영역으로 낮춘다.
7. `styles.css` 에서 page, compose, feed, card 간격과 padding 을 미니멀 기준으로 줄인다. 새 token 없이 기존 token 만 사용한다.
8. front 테스트를 갱신한다. 검색 접힘, 첨부 input 숨김, 작성 후 invalidation, empty 상태를 확인한다.

## DnD
- hero title, hero 설명, `ECHO`, `FEED` 반복 kicker 가 feed 화면에서 보이지 않는다.
- 첫 viewport 에 compose 와 최근 피드 첫 항목 또는 empty 상태가 함께 들어온다.
- create composer 기본 화면에는 textarea, `첨부`, submit 만 보인다.
- 파일 선택 전 브라우저 기본 파일 input 은 보이지 않지만 접근 가능한 파일 선택 동작은 유지된다.
- 검색어가 없을 때 검색 input 은 보이지 않는다.
- 검색어가 있거나 검색을 열면 input, submit, 초기화가 보인다.
- Echo card 본문이 metadata 와 action 보다 높은 위계로 보인다.
- `상세 보기`, `본문 복사`, archive 이동은 primary CTA 처럼 보이지 않는다.
- detail page 와 archive page 에서 grid stretch 로 큰 빈 panel 이 생기지 않는다.
- detail page 의 본문, 댓글, 댓글 작성 영역은 내용 높이 중심의 compact surface 로 보인다.
- archive page 는 큰 hero 없이 feed 와 같은 toolbar, 접힌 검색, divider 목록으로 보인다.
- Echo 본문은 `피드`, `댓글`, count, metadata, empty/status 안내, placeholder 보다 먼저 읽힌다.
- `상세`와 `복사`는 link/button element 차이와 무관하게 같은 시스템 액션 텍스트로 보인다.
- attachment, archive, search, detail, copy 의 기존 동작이 회귀하지 않는다.
- `corepack pnpm --filter @proxi/front test`, `corepack pnpm --filter @proxi/front typecheck`, `corepack pnpm run verify` 가 통과한다.

## 검증 방법
- `corepack pnpm --filter @proxi/front test`
- `corepack pnpm --filter @proxi/front typecheck`
- `corepack pnpm run verify`
- 브라우저 수동 확인: `http://localhost:5173` 에서 기본 피드, 검색 열림/초기화, 첨부 선택, 작성 후 목록 반영을 확인한다.

## 검증 결과
- `corepack pnpm --filter @proxi/front test`: 통과
- `corepack pnpm --filter @proxi/front typecheck`: 통과
- `corepack pnpm run verify`: 통과
- Carbon-lite 보정 후 `corepack pnpm --filter @proxi/front test`, `corepack pnpm --filter @proxi/front typecheck`, `corepack pnpm run verify`: 통과
- 모든 Echo page 통합 후 `corepack pnpm --filter @proxi/front test`, `corepack pnpm --filter @proxi/front typecheck`, `corepack pnpm run verify`: 통과
- 정보 계층 보정 후 `corepack pnpm --filter @proxi/front test`, `corepack pnpm --filter @proxi/front typecheck`, `corepack pnpm run verify`: 통과
- 시스템 문구 크기/굵기 통합 후 `corepack pnpm --filter @proxi/front test`, `corepack pnpm --filter @proxi/front typecheck`, `corepack pnpm run verify`: 통과

## 결정 로그
- 2026-05-01: 사용자는 균형형보다 극단형 미니멀을 선택했다.
- 2026-05-01: 기능 삭제 대신 기본 노출 위계를 낮추는 방식으로 구현한다.
- 2026-05-01: 새 dependency 와 새 디자인 token 없이 기존 프런트 디자인 시스템 안에서 해결한다.
- 2026-05-01: 구조/API 변경은 없어 `docs/DESIGN.md` 기준 별도 design-doc 은 추가하지 않았다.
- 2026-05-01: IBM스럽지 않은 soft card UI 를 Carbon-lite 기준으로 재보정했다. Feed 는 row/list 와 divider 를 우선하고, Carbon blue 는 primary CTA 와 focus 에만 제한한다.
- 2026-05-01: 상세/아카이브에도 같은 문제가 남아 있다고 보고 모든 Echo page 를 메인 피드와 같은 Carbon-lite shell 로 통합한다.
- 2026-05-01: 본문과 정보성 UI 문구가 비슷하게 보이는 문제를 별도 정보 계층 보정으로 처리한다.
- 2026-05-01: 시스템 액션 문구는 작게 숨기기보다 15px semibold 로 통일해 본문과 구분하되 조작 가능한 문구임을 분명히 한다.

## 남은 이슈
- 실제 구현 후 모바일 첫 viewport 에서 compose 와 첫 피드 항목이 함께 보이는지 별도 확인이 필요하다.
