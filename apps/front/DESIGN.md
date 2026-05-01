# 프런트 디자인 시스템

이 문서는 Echo 화면을 새로 만들거나 수정할 때 우선 적용할 시각, 컴포넌트, 레이아웃 규칙이다.

## 기준과 우선순위
- 방향성은 IBM/Carbon-lite layout discipline 을 우선하고, Echo 본문만 content-first tone 으로 둔다.
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
- Carbon-lite 처럼 선명한 alignment, 낮은 radius, divider 중심 list 를 사용한다.
- 장식적 side border, 강한 배경, 과한 hero 높이는 쓰지 않는다.
- Compose box 를 화면의 primary interaction surface 로 두되 shadow 없는 input module 로 만든다.
- Feed 는 card stack 보다 row/list 흐름을 우선하고 divider 로 항목 경계를 만든다.
- 상세, 아카이브, loading, empty, error 상태도 feed 와 같은 Carbon-lite shell, surface, divider 규칙을 따른다.
- Echo 본문과 UI 정보성 문구를 명확히 분리한다. 본문은 가장 높은 대비와 큰 body scale 을 쓰고, section label, count, metadata, status, action text 는 14-16px semibold 계열로 일관되게 둔다.
- Carbon blue 는 primary CTA 와 focus 에만 제한적으로 사용한다.

## 언어와 문구
- 화면 문구의 기본 언어는 한국어다.
- 버튼, 비어 있는 상태, 오류, 도움말, form label, toast 는 한국어를 우선한다.
- 기술 식별자, API field, 코드, 파일명, 고유 제품명은 영어를 유지할 수 있다.
- 한국어 문장은 짧게 쓴다. 한 문장에는 하나의 행동 또는 하나의 상태만 담는다.
- CTA 는 명사형보다 동사형을 우선한다. 예: `저장`, `복구`, `첨부 추가`, `아카이브로 이동`.

## 색상 토큰

```css
:root {
  --echo-bg: #f4f4f4;
  --echo-surface: #ffffff;
  --echo-surface-soft: #e8e8e8;
  --echo-text: #161616;
  --echo-text-muted: #525252;
  --echo-text-subtle: #6f6f6f;
  --echo-border: #e0e0e0;
  --echo-border-strong: #8d8d8d;
  --echo-primary: #0f62fe;
  --echo-primary-hover: #0050e6;
  --echo-primary-active: #002d9c;
  --echo-primary-soft: #edf5ff;
  --echo-danger: #da1e28;
  --echo-success: #24a148;
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
| Body | 17px | 400-500 | 28px | Echo 본문 |
| UI Body | 16px | 400 | 24px | 설명, dialog copy |
| System Text | 15-16px | 600-700 | 20-24px | section label, button, action link |
| Label / Meta | 14px | 600 | 20px | metadata, count, badge, 보조 정보 |

### 원칙
- heading 은 2단계만 둔다: page title, section title.
- 본문 contrast 를 낮추지 않는다. Echo 본문은 `--echo-text` 와 body scale 을 사용한다.
- section label, count, metadata, status, action link 는 본문보다 낮은 대비를 쓰되 너무 작거나 약하게 만들지 않는다.
- 같은 역할의 action text 는 element 가 link 이든 button 이든 같은 크기, weight, line-height 를 사용한다.
- metadata 는 `--echo-text-muted` 또는 `--echo-text-subtle` 만 사용하고, 본문과 같은 대비를 쓰지 않는다.
- font weight 는 400, 500, 600 중심으로 제한한다.

## 레이아웃
- page max width 는 720-880px 이다. 현재 기본값은 820px 이다.
- spacing 은 8px grid 를 따른다.
- spacing 은 의미 단위별로 차등 적용한다. 같은 gap 을 모든 영역에 반복하지 않는다.
- 큰 전환 간격: 독립적인 surface 사이 24-32px
- 중간 컴포넌트 간격: related block 사이 16-24px
- 작은 텍스트 간격: label, helper, metadata 사이 8-12px
- Header 와 content 사이: 20-24px
- Hero intro 와 compose: 20px 내외
- Compose 와 feed: 16-20px. 작성과 읽기는 같은 흐름이므로 과하게 띄우지 않는다.
- Feed title 과 search 는 하나의 control group 으로 묶고 12px 내외로 둔다.
- Feed row 사이: 0px. row 경계는 divider 로 표현한다.
- Section 내부 padding: 16px 중심
- 모바일은 16px side padding 을 유지한다.
- 어떤 route 도 grid stretch 로 빈 surface 를 화면 높이까지 늘리지 않는다.

## 컴포넌트 규칙

### Compose Box
- background: `--echo-surface`
- radius: 2px
- border: `1px solid --echo-border`
- shadow 를 쓰지 않는다.
- 별도 heading, helper text, divider 를 기본으로 두지 않는다.
- 작성 필드를 카드의 첫 요소로 두고, 입력/첨부/액션 사이만 중간 간격을 둔다.
- textarea 는 16px body scale 로 읽기 쉽게 둔다.
- focus 시 border 를 primary 로 바꾸고 4px soft focus ring 을 준다.

### Button
- radius: 2px
- 기본 system text 는 15px semibold 를 사용한다.
- primary 는 `--echo-primary` 배경과 white text 를 사용한다.
- secondary 는 white surface, border, dark text 를 사용한다.
- ghost 는 배경 없이 muted text 를 사용하고 hover 에서만 soft surface 를 준다.
- hover/active/focus/disabled 상태를 항상 둔다.

### Feed Row
- background: `--echo-surface`
- radius: 0px
- border 는 row container 와 divider 로만 둔다.
- shadow 를 쓰지 않는다.
- hover 에서는 neutral background 만 사용한다.
- metadata 는 author, time, status 순으로 한 줄에 묶는다.
- 본문이 카드의 중심이다. 링크와 보조 action 은 낮은 대비로 둔다.
- 본문은 metadata, count, action link 보다 한 단계 큰 글자 크기로 둔다.
- `상세`, `복사` 같은 같은 역할의 row action 은 link/button element 차이 없이 동일하게 보이게 한다.
- row padding 은 12-16px 범위로 유지해 스캔 밀도를 높인다.

### Input, Textarea
- full border input 을 사용한다.
- radius: 2px
- focus: primary border + soft focus ring
- placeholder 는 `--echo-text-subtle`
- placeholder 는 실제 작성 본문보다 낮은 대비여야 한다.
- error 는 danger border 와 danger text 를 사용한다.

### Badge / Attachment Chip
- 낮은 radius 를 사용한다.
- 배경은 primary soft 또는 neutral soft 만 사용한다.
- 본문보다 작고 차분하게 유지한다.

## Don't
- 새 기능을 추가하지 않는다.
- decorative side border 를 넣지 않는다.
- Carbon blue 를 primary CTA 외 장식에 쓰지 않는다.
- hero 를 크게 만들지 않는다.
- feed 에 카드 shadow 를 쓰지 않는다.
- 본문을 낮은 contrast gray 로 만들지 않는다.
- spacing scale 밖의 임의값을 반복해서 추가하지 않는다.

## 에이전트용 프롬프트 기준

```txt
Echo 는 개인 micro-posting 제품이다.
화면은 720-880px 중앙 정렬, Carbon-lite neutral background, white module surface 를 사용한다.
IBM식 정렬, 낮은 radius, no-shadow, divider 기반 section segmentation 을 유지한다.
Compose box 를 primary input module 로 두고, Feed 는 card stack 이 아니라 row/list 로 만든다.
Primary color 는 Carbon blue 계열 하나만 key action 과 focus 에 사용한다.
버튼과 입력은 2px radius 를 사용하고, feed row 는 radius 없이 divider 로 구분한다.
본문은 16px/24-28px 로 읽기 쉽게 유지하고, UI copy 는 한국어를 기본으로 한다.
```
