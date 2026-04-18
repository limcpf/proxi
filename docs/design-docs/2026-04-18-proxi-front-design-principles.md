# proxi 프런트 디자인 원칙

상태: `accepted`

## 목표
- `proxi front` 의 시각 언어를 빠르게 맞추되, 페이지마다 다른 규칙이 생기지 않도록 기준을 고정한다.

## 기본 방향
- cozy density
- Korean-first readability
- calm, low-fatigue UI
- semantic token 우선

## 타이포그래피
- 기본 서체는 한국어 가독성을 우선하는 sans 계열로 둔다.
- 본문은 긴 문장을 버티는 line-height 와 자간을 우선한다.
- 강조는 font weight 와 색 대비로 해결하고, 과한 크기 점프로 해결하지 않는다.
- 제목 계층은 많아도 3단계를 넘기지 않는다.

## spacing 과 density
- 화면은 넉넉하지만 비어 보이지 않는 `cozy` 밀도를 기본값으로 둔다.
- 레이아웃 간격은 소수의 spacing step 으로 제한한다.
- 카드, 폼, 목록의 내부 패딩은 control size 와 함께 움직이게 만든다.
- 한 화면에서 dense 와 spacious 패턴을 섞지 않는다.

## token 원칙
- 색, radius, border, shadow 는 semantic token 이름으로 관리한다.
- 페이지 한 장을 맞추기 위해 임의값을 바로 추가하지 않는다.
- token 은 배경, surface, 강조, 위험, 성공처럼 의미를 드러내는 이름을 쓴다.
- 같은 역할의 컴포넌트는 같은 token 조합을 재사용한다.

## visual hierarchy
- 페이지의 가장 중요한 목적은 한눈에 보여야 한다.
- 보조 정보는 대비를 낮추고, 핵심 값과 상태는 대비를 분명히 준다.
- 강조 색은 좁게 쓰고 반복 노출을 피한다.
- border, shadow, tint 를 동시에 과하게 쓰지 않는다.

## control 과 component
- 버튼, 입력창, badge, panel 은 고정된 size variant 안에서만 움직인다.
- component 이름은 장식보다 역할을 반영한다.
- 새 화면을 만들 때는 기존 variant 로 설명 가능한지 먼저 확인한다.
- primitive 위에 composed component 를 쌓아 페이지 section 을 만든다.

## motion
- 모션은 상태 전환을 설명할 때만 넣는다.
- 등장 애니메이션은 짧고 차분하게 제한한다.
- 피드백이 목적이 아닌 장식성 모션은 기본값으로 두지 않는다.
