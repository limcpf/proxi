# 태그형 Codex PR 리뷰 도입

상태: `superseded`

대체 결정:
- GitHub 와 연결된 Codex OAuth 댓글 경로를 기본값으로 사용한다.
- 저장소 안의 커스텀 `openai/codex-action` workflow 와 profile prompt 는 유지하지 않는다.

## 배경
- 단일 자동 PR 리뷰는 어떤 관점으로 검토할지 모호해, 구조·보안·문서·테스트 같은 서로 다른 판단 기준이 한 번에 섞이기 쉽다.
- 저장소는 이미 `AGENTS.md`, `docs/`, hook, `verify` 로 운영 규칙을 구조화하고 있으므로, 리뷰도 요청 의도를 분명히 드러내는 방식이 더 잘 맞는다.
- 당시에는 GitHub 의 기본 `@codex` 흐름만으로는 저장소 안에 버전관리되는 profile 별 프롬프트를 운영하기 어렵다고 판단했다.
- 프론트 추가 이후 PR 마다 같은 핵심 관점의 리뷰를 반복해서 요청하게 되어, 수동 코멘트만으로는 기본 운영 흐름이 번거로워졌다.

## 결정
- 현재는 GitHub 와 연결된 Codex OAuth 계정의 기본 댓글 리뷰 경로만 사용한다.
- 추가 요청은 PR 코멘트 `@codex <지침>` 형태로 남긴다.
- 리뷰 원칙은 루트 `AGENTS.md` 의 `Review guidelines` 에 두고, 세부 지시는 각 PR 코멘트에서 직접 전달한다.

## 대안
- 모든 PR에 단일 자동 리뷰를 거는 방식은 관점 혼합이 심해지고, 리뷰 의도가 PR 대화에 명시적으로 남지 않아 채택하지 않았다.
- GitHub label 로 profile 을 고르는 방식은 보기에 직관적이지만, 라벨 상태 관리 비용이 커서 채택하지 않았다.
- 커스텀 GitHub Actions workflow 와 profile prompt 를 유지하는 방식은 운영 복잡도와 인증 경로 혼선을 키워 현재는 채택하지 않는다.

## 영향
- 리뷰 요청 방식은 GitHub 의 기본 Codex OAuth 연동 동작에 맞춰 단순해진다.
- 저장소 안에서 별도 workflow, prompt 세트, API key secret 을 운영하지 않는다.
- 리뷰 관점은 고정 profile 이 아니라, 코멘트 지시 문구에서 직접 정한다.

## 후속 작업
- 필요하면 댓글 템플릿이나 PR 템플릿 수준에서 권장 리뷰 지시 예시를 제공한다.
