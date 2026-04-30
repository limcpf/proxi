# 프런트 디자인 시스템

이 문서는 Echo 화면을 새로 만들거나 수정할 때 우선 적용할 시각, 컴포넌트, 레이아웃 규칙이다.

## 기준과 우선순위
- 방향성은 IBM식 layout discipline 과 Threads식 content-first social tone 을 결합한 SaaS 제품 UI 다.
- Echo 는 개인 micro-posting 도구이며, 짧은 생각을 쓰고 피드에서 다시 보는 흐름이 중심이다.
- 새 기능을 추가하지 않고, 화면 위계와 사용성만 개선한다.
- 스택, 상태 책임, API 경계는 [`/Users/lim/dev/proxi/apps/front/ARCHITECTURE.md`](./ARCHITECTURE.md)를 우선한다.
- 사용자 흐름과 수용 기준은 `docs/product-specs` 를 우선한다.
- 과거 디자인 결정 문서와 충돌하면 실제 화면 제작에서는 이 문서를 우선한다.

## 화면 제작 절차
1. 화면의 중심 목적을 한 문장으로 적는다.
2. primary action 을 하나만 정한다.
3. Header, Hero/Intro, Compose, Feed 의 세그먼트를 먼저 분리한다.
4. URL 상태, server state, form state, local UI state 를 분리한다.
5. loading, empty, error, disabled 상태를 먼저 설계한다.
6. 아래 token, type scale, spacing, component 규칙 안에서 스타일을 만든다.
7. 새 색상, radius, shadow, spacing 을 추가하기 전 기존 token 으로 표현 가능한지 확인한다.

## 시각 방향
- 화면은 중앙 정렬된 720-880px 폭을 기본으로 한다.
- IBM처럼 alignment, spacing, section boundary 를 엄격하게 유지한다.
- Threads처럼 content-first, soft card, muted metadata 를 사용한다.
- 장식적 side border, 강한 배경, 과한 hero 높이는 쓰지 않는다.
- Compose box 를 화면의 primary interaction surface 로 둔다.
- Feed 는 card 기반 세로 흐름으로 두고 과한 shadow 를 피한다.
- prototype 느낌의 강한 파랑과 날카로운 모서리는 피한다.

## 언어와 문구
- 화면 문구의 기본 언어는 한국어다.
- 버튼, 비어 있는 상태, 오류, 도움말, form label, toast 는 한국어를 우선한다.
- 기술 식별자, API field, 코드, 파일명, 고유 제품명은 영어를 유지할 수 있다.
- 한국어 문장은 짧게 쓴다. 한 문장에는 하나의 행동 또는 하나의 상태만 담는다.
- CTA 는 명사형보다 동사형을 우선한다. 예: `저장`, `복구`, `첨부 추가`, `아카이브로 이동`.

## 색상 토큰

```css
:root {
  --echo-bg: #f7f8fb;
  --echo-surface: #ffffff;
  --echo-surface-soft: #f1f4f9;
  --echo-text: #172033;
  --echo-text-muted: #5d6678;
  --echo-text-subtle: #7b8496;
  --echo-border: #dfe5ee;
  --echo-border-strong: #c8d2e0;
  --echo-primary: #355d7c;
  --echo-primary-hover: #294962;
  --echo-primary-active: #1f384c;
  --echo-primary-soft: #edf4f8;
  --echo-danger: #d14343;
  --echo-success: #1f8a5b;
}
```

### 역할
- `--echo-bg`: 앱 배경
- `--echo-surface`: compose box, cards, modal
- `--echo-surface-soft`: hover, secondary surface
- `--echo-text`: 제목과 본문
- `--echo-text-muted`: 설명, metadata
- `--echo-border`: 기본 구분선
- `--echo-primary`: primary CTA 와 focus
- `--echo-primary-soft`: 선택, chip, subtle emphasis
- `--echo-danger`: destructive action

## 타이포그래피

### Font family
- Primary: `IBM Plex Sans`, fallback `Pretendard, Noto Sans KR, Apple SD Gothic Neo, sans-serif`
- Mono: `IBM Plex Mono`, fallback `Menlo, Courier, monospace`
- 새 dependency 없이 fallback 이 깨지지 않게 유지한다.

### Type scale

| 역할 | 크기 | Weight | Line height | 용도 |
| --- | --- | --- | --- | --- |
| Page title | 32px | 600 | 40px | 화면 핵심 heading |
| Section title | 20px | 600 | 28px | compose/feed/detail section |
| Body | 16px | 400 | 28px | Echo 본문, 설명 |
| Label / Meta | 14px | 500 | 20px | label, metadata, button |
| Caption | 12px | 500 | 16px | badge, 보조 정보 |

### 원칙
- heading 은 2단계만 둔다: page title, section title.
- 본문 contrast 를 낮추지 않는다. 장문 Echo 는 `--echo-text` 를 사용한다.
- metadata 는 `--echo-text-muted` 또는 `--echo-text-subtle` 만 사용한다.
- font weight 는 400, 500, 600 중심으로 제한한다.

## 레이아웃
- page max width 는 720-880px 이다. 현재 기본값은 820px 이다.
- spacing 은 8px grid 를 따른다.
- Header 와 content 사이: 24-32px
- Hero intro 와 compose: 16px
- Compose 와 feed: 24px
- Feed card 사이: 16px
- Section 내부 padding: 16-20px
- 모바일은 16px side padding 을 유지한다.

## 컴포넌트 규칙

### Compose Box
- background: `--echo-surface`
- radius: 12px
- border: `1px solid --echo-border`
- shadow: subtle panel shadow 만 허용
- heading 과 form 사이에는 1px divider 로 구조를 분리한다.
- textarea 는 16px body scale 로 읽기 쉽게 둔다.
- focus 시 border 를 primary 로 바꾸고 4px soft focus ring 을 준다.

### Button
- radius: 10px
- primary 는 `--echo-primary` 배경과 white text 를 사용한다.
- secondary 는 white surface, border, dark text 를 사용한다.
- ghost 는 배경 없이 muted text 를 사용하고 hover 에서만 soft surface 를 준다.
- hover/active/focus/disabled 상태를 항상 둔다.

### Feed Card
- background: `--echo-surface`
- radius: 12px
- border: `1px solid --echo-border`
- shadow 는 아주 약하게 둔다.
- hover 에서는 border/shadow 만 조금 강화한다.
- metadata 는 author, time, status 순으로 한 줄에 묶는다.
- 본문이 카드의 중심이다. 링크와 보조 action 은 낮은 대비로 둔다.

### Input, Textarea
- full border input 을 사용한다.
- radius: 12px
- focus: primary border + soft focus ring
- placeholder 는 `--echo-text-subtle`
- error 는 danger border 와 danger text 를 사용한다.

### Badge / Attachment Chip
- pill radius 를 사용한다.
- 배경은 primary soft 또는 neutral soft 만 사용한다.
- 본문보다 작고 차분하게 유지한다.

## Don't
- 새 기능을 추가하지 않는다.
- decorative side border 를 넣지 않는다.
- overly saturated default blue 를 쓰지 않는다.
- hero 를 크게 만들지 않는다.
- 카드마다 다른 radius, shadow, border 를 쓰지 않는다.
- 본문을 낮은 contrast gray 로 만들지 않는다.
- spacing scale 밖의 임의값을 반복해서 추가하지 않는다.

## 에이전트용 프롬프트 기준

```txt
Echo 는 개인 micro-posting SaaS 제품이다.
화면은 720-880px 중앙 정렬, calm neutral background, white card surface 를 사용한다.
IBM식 정렬과 section segmentation 을 유지하고, Threads식 content-first feed tone 을 적용한다.
Compose box 를 primary focus 로 두고, Feed 는 16px 간격의 card list 로 만든다.
Primary color 는 muted slate-blue 계열 하나만 key action 에 사용한다.
버튼은 10px radius, 입력과 카드는 12px radius 를 사용한다.
본문은 16px/28px 로 읽기 쉽게 유지하고, UI copy 는 한국어를 기본으로 한다.
```
