# 프런트 디자인 시스템

이 문서는 `apps/front` 화면을 새로 만들거나 수정할 때 우선 적용할 시각, 컴포넌트, 레이아웃 규칙이다.

## 기준과 우선순위
- 방향성은 IBM Carbon Design System 에서 영감을 받은 enterprise precision 이다.
- IBM 브랜드 자산, IBM 로고, proprietary icon font 는 사용하지 않는다. Proxi 고유 이름과 `lucide-react` 기반 아이콘만 사용한다.
- 이 문서는 `apps/front` 화면 구현의 현재 시각 기준이다.
- 스택, 상태 책임, API 경계는 [`/Users/lim/dev/proxi/apps/front/ARCHITECTURE.md`](./ARCHITECTURE.md)를 우선한다.
- 사용자 흐름과 수용 기준은 `docs/product-specs` 를 우선한다.
- 과거 디자인 결정 문서와 충돌하면 실제 화면 제작에서는 이 문서를 우선한다.

## 화면 제작 절차
1. 화면의 중심 목적을 한 문장으로 적는다.
2. primary action 을 하나만 정한다.
3. URL 로 올라갈 상태와 로컬 UI 상태를 먼저 분리한다.
4. server state 는 TanStack Query 경계로 분리하고, mutation 후 invalidation 규칙을 정한다.
5. loading, empty, error, disabled 상태를 먼저 설계한다.
6. 아래 `--cds-*` 토큰과 컴포넌트 규칙 안에서 스타일을 만든다.
7. 임의 색상, 임의 spacing, 임의 radius 를 추가하기 전에 기존 규칙으로 표현 가능한지 확인한다.

## 시각 방향
- 밝은 흰색 배경 `#ffffff` 과 near-black 텍스트 `#161616` 을 기본으로 한다.
- 핵심 accent 는 IBM Blue 60 계열 `#0f62fe` 하나만 사용한다.
- 깊이는 그림자보다 배경 레이어링으로 만든다: white -> gray 10 -> gray 20.
- 버튼, 입력, 카드, 타일은 기본적으로 `0px` radius 를 쓴다.
- spacing 은 8px grid 를 따른다. micro spacing 에만 2px, 4px 를 허용한다.
- 카드는 flat 하게 두고, dropdown, tooltip, modal 처럼 실제로 겹치는 floating UI 에만 shadow 를 쓴다.

## 언어와 문구
- 화면 문구의 기본 언어는 한국어다.
- 버튼, 비어 있는 상태, 오류, 도움말, form label, toast 는 한국어를 우선한다.
- 기술 식별자, API field, 코드, 파일명, 고유 제품명은 영어를 유지할 수 있다.
- 한국어 문장은 짧게 쓴다. 한 문장에는 하나의 행동 또는 하나의 상태만 담는다.
- CTA 는 명사형보다 동사형을 우선한다. 예: `저장`, `복구`, `첨부 추가`, `아카이브로 이동`.
- 영어 UI copy 를 새로 추가해야 하면, 한국어 병기 또는 한국어 대체가 어려운 이유를 코드 리뷰에서 설명할 수 있어야 한다.

## 색상 토큰

CSS 변수는 Carbon 호환성을 고려해 `--cds-*` prefix 를 사용한다.

```css
:root {
  --cds-background: #ffffff;
  --cds-layer-01: #f4f4f4;
  --cds-layer-01-hover: #e8e8e8;
  --cds-layer-02: #e0e0e0;
  --cds-text-primary: #161616;
  --cds-text-secondary: #525252;
  --cds-text-placeholder: #6f6f6f;
  --cds-text-disabled: #8d8d8d;
  --cds-border-subtle: #c6c6c6;
  --cds-border-muted: #e0e0e0;
  --cds-link-primary: #0f62fe;
  --cds-link-primary-hover: #0043ce;
  --cds-button-primary: #0f62fe;
  --cds-button-primary-hover: #0353e9;
  --cds-button-primary-active: #002d9c;
  --cds-focus: #0f62fe;
  --cds-focus-inset: #ffffff;
  --cds-support-error: #da1e28;
  --cds-support-success: #24a148;
  --cds-support-warning: #f1c21b;
  --cds-support-info: #0f62fe;
}
```

### 역할
- `#0f62fe`: primary CTA, link, focus, selected 상태
- `#ffffff`: page background, white layer, blue button text
- `#161616`: primary text, heading, dark masthead
- `#525252`: secondary text, helper text, description
- `#6f6f6f`: placeholder, muted text
- `#c6c6c6`: divider, subtle border, input bottom border
- `#f4f4f4`: card, tile, field, alternating section
- `#e8e8e8`: gray 10 surface hover
- `#da1e28`: error, danger action
- `#24a148`: success
- `#f1c21b`: warning

## 다크 테마 기준

다크 테마를 만들 때만 아래 토큰을 쓴다. 기본 화면은 white theme 이다.

```css
[data-theme="dark"] {
  --cds-background: #161616;
  --cds-layer-01: #262626;
  --cds-layer-02: #393939;
  --cds-text-primary: #f4f4f4;
  --cds-text-secondary: #c6c6c6;
  --cds-border-subtle: #393939;
  --cds-link-primary: #78a9ff;
  --cds-focus: #78a9ff;
}
```

## 타이포그래피

### Font family
- Primary: `IBM Plex Sans`, fallback `Helvetica Neue, Arial, sans-serif`
- Mono: `IBM Plex Mono`, fallback `Menlo, Courier, monospace`
- Serif 는 editorial 목적이 명확할 때만 제한적으로 사용한다.
- 폰트 로딩 방식은 별도 구현 결정이 있기 전까지 CSS fallback 을 깨지 않게 둔다.

### Type scale

| 역할 | 크기 | Weight | Line height | Letter spacing | 용도 |
| --- | --- | --- | --- | --- | --- |
| Display 01 | 60px | 300 | 70px | 0 | hero headline |
| Display 02 | 48px | 300 | 56px | 0 | secondary hero |
| Heading 01 | 42px | 300 | 50px | 0 | expressive heading |
| Heading 02 | 32px | 400 | 40px | 0 | section heading |
| Heading 03 | 24px | 400 | 32px | 0 | sub-section title |
| Heading 04 | 20px | 600 | 28px | 0 | card title, feature header |
| Heading 05 | 20px | 400 | 28px | 0 | lighter card heading |
| Body Long 01 | 16px | 400 | 24px | 0 | standard reading text |
| Body Long 02 | 16px | 600 | 24px | 0 | emphasized body |
| Body Short 01 | 14px | 400 | 18px | 0.16px | compact body, captions |
| Body Short 02 | 14px | 600 | 18px | 0.16px | nav item, compact label |
| Caption 01 | 12px | 400 | 16px | 0.32px | metadata, timestamp |
| Code 01 | 14px | 400 | 20px | 0.16px | inline code, terminal |
| Code 02 | 16px | 400 | 24px | 0 | code block |
| Mono Display | 42px | 400 | 50px | 0 | data-forward hero accent |

### 원칙
- 42px 이상 display text 는 weight 300 을 우선한다.
- 14px 에는 `0.16px`, 12px 에는 `0.32px` letter spacing 을 적용한다.
- weight 는 300, 400, 600 세 단계만 쓴다. 700 bold 는 기본값으로 쓰지 않는다.
- display text 에 letter spacing 을 추가하지 않는다.

## 컴포넌트 규칙

### Button
- 기본 높이: 48px
- compact 높이: 40px
- expressive 높이: 64px
- border radius: 0px
- padding: `14px 63px 14px 15px` 를 기본으로 하고, trailing icon 공간을 고려한다.
- focus: `2px` blue ring 과 white inset 을 사용한다.

Primary:
- background: `--cds-button-primary`
- color: `#ffffff`
- hover: `--cds-button-primary-hover`
- active: `--cds-button-primary-active`

Secondary:
- background: `#393939`
- color: `#ffffff`
- hover: `#4c4c4c`
- active: `#6f6f6f`

Tertiary:
- background: transparent
- color: `--cds-link-primary`
- border: `1px solid --cds-link-primary`
- hover: blue text 와 `#edf5ff` background tint

Ghost:
- background: transparent
- color: `--cds-link-primary`
- padding: `14px 16px`
- border: none
- hover: `#e8e8e8` background

Danger:
- background: `--cds-support-error`
- color: `#ffffff`
- hover: `#b81921`

### Card, Tile, Container
- background: `#ffffff` 또는 `--cds-layer-01`
- border: none 또는 `1px solid --cds-border-muted`
- border radius: 0px
- shadow: 사용하지 않는다.
- content padding: 16px
- clickable hover: `--cds-layer-01-hover`
- hierarchy 는 shadow 대신 background layer 로 만든다.
- clickable tile 은 bottom-right arrow icon 을 쓸 수 있다.

### Input, Textarea, Select
- background: `--cds-layer-01`
- height: 40px default, 48px large
- padding: `0 16px`
- side/top border: none
- bottom border: `2px solid transparent` default
- active bottom border: `2px solid #161616`
- focus bottom border: `2px solid --cds-focus`
- error bottom border: `2px solid --cds-support-error`
- border radius: 0px
- label: 12px, weight 400, letter spacing 0.32px, `--cds-text-secondary`
- helper text: 12px, `#6f6f6f`
- placeholder: `--cds-text-placeholder`

### Navigation
- masthead background: `#161616`
- masthead height: 48px
- brand: Proxi text or product mark, white on dark
- links: 14px, weight 400, `#c6c6c6`
- link hover: `#ffffff`
- active link: `#ffffff` with 2px bottom border
- mobile: hamburger trigger and left-sliding panel

### Link
- default: `--cds-link-primary`, no underline
- hover: `--cds-link-primary-hover`, underline
- body inline link: underline by default
- visited color 는 바꾸지 않는다.

### Tag, Label
- background: semantic 10-grade tint. 기본 정보성 tag 는 `#edf5ff`
- text: corresponding 60-grade color. 기본 정보성 tag 는 `#0f62fe`
- padding: `4px 8px`
- border radius: 24px
- font: 12px, weight 400, letter spacing 0.32px
- tag 는 radius 예외다. 버튼과 카드의 radius 를 따라가지 않는다.

### Notification Banner
- full-width bar
- background: `#0f62fe` 또는 `#161616`
- text: white, 14px
- close icon 은 right aligned

## 레이아웃

### Spacing scale
- micro: 2px, 4px
- component: 8px, 12px, 16px, 24px, 32px, 40px, 48px
- layout: 16px, 24px, 32px, 48px, 64px, 80px, 96px, 160px
- 임의값은 금지한다. 필요한 값이 있으면 먼저 위 scale 로 반올림한다.

### Grid
- 기준 grid: 16 columns
- max content width: 1584px
- desktop margin: 32px
- mobile margin: 16px
- desktop gutter: 32px
- mobile gutter: 16px
- readable text 는 보통 8-12 columns 안에 둔다.
- full-bleed section 과 contained content 를 구분한다.

### Section rhythm
- 일반 section transition: 48px
- hero transition: 80px 또는 96px
- mobile section padding: 16px 또는 32px
- 배경색 band 를 사용해 구역을 나누고, 과한 vertical whitespace 로 분리하지 않는다.

## Depth와 elevation

| 레벨 | 처리 | 사용처 |
| --- | --- | --- |
| Level 0 | no shadow, `#ffffff` | page surface |
| Layer 01 | no shadow, `#f4f4f4` | card, tile, section |
| Layer 02 | no shadow, `#e0e0e0` | nested panel |
| Raised | `0 2px 6px rgba(0, 0, 0, 0.3)` | dropdown, tooltip, overflow menu |
| Overlay | raised shadow + scrim | modal, side panel |
| Focus | 2px blue ring + white inset | keyboard focus |
| Bottom-border | 2px bottom edge | active input, active tab |

## 반응형 기준

| 이름 | 너비 | 주요 변화 |
| --- | --- | --- |
| Small | 320px | single column, 16px margin, hamburger nav |
| Medium | 672px | 2-column grid 시작 |
| Large | 1056px | full navigation, 3-4 column grid |
| X-Large | 1312px | wide layout |
| Max | 1584px | max content width |

### Touch target
- button: 48px default, 40px minimum
- nav link: 48px row
- input: 40px default, 48px large
- icon button: 48px square
- mobile menu item: 48px full-width row

### Collapse
- hero type: 60px -> 42px -> 32px
- grid: 4 columns -> 2 columns -> 1 column
- card/tile: horizontal grid -> vertical stack
- image: `max-width: 100%`, aspect ratio 유지
- data visualization: mobile 에서 horizontal scroll 허용
- section padding: 48px -> 32px -> 16px

## Do
- display 크기에서는 IBM Plex Sans weight 300 을 사용한다.
- 14px 텍스트에는 0.16px, 12px 텍스트에는 0.32px letter spacing 을 적용한다.
- 버튼, 입력, 카드, 타일은 0px radius 를 사용한다.
- 색상은 `--cds-*` semantic token 으로 참조한다.
- depth 는 shadow 대신 background-color layer 로 만든다.
- input 은 bottom-border 패턴을 사용한다.
- primary interactive color 는 `#0f62fe` 하나로 유지한다.
- 8px grid 를 유지한다.

## Don't
- 버튼 모서리를 둥글게 만들지 않는다.
- 카드와 타일에 shadow 를 넣지 않는다.
- blue 외의 임의 accent color 를 추가하지 않는다.
- weight 700 bold 를 기본 스타일로 쓰지 않는다.
- display text 에 letter spacing 을 추가하지 않는다.
- input 을 full border box 로 만들지 않는다.
- gradient background 를 기본 표현으로 쓰지 않는다.
- spacing scale 밖의 임의값을 넣지 않는다.
- IBM 로고나 proprietary icon font 를 사용하지 않는다.

## 에이전트용 프롬프트 기준

새 페이지나 컴포넌트를 만들 때 아래 문장을 작업 기준으로 삼는다.

```txt
IBM Carbon 에서 영감을 받은 Proxi 프런트 UI 를 만든다.
white/gray/blue 중심의 flat enterprise UI 를 사용하고,
primary accent 는 #0f62fe 하나로 제한한다.
화면 문구는 한국어를 기본으로 사용한다.
버튼, 입력, 카드, 타일은 0px radius 를 유지한다.
spacing 은 8px grid 를 따르고, depth 는 shadow 가 아니라 background layer 로 만든다.
텍스트는 IBM Plex Sans scale 을 따르며 weight 는 300/400/600 만 사용한다.
입력 컴포넌트는 full border 가 아니라 bottom-border 패턴을 사용한다.
```
