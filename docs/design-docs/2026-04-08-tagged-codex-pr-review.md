# 태그형 Codex PR 리뷰 도입

상태: `accepted`

## 배경
- 단일 자동 PR 리뷰는 어떤 관점으로 검토할지 모호해, 구조·보안·문서·테스트 같은 서로 다른 판단 기준이 한 번에 섞이기 쉽다.
- 저장소는 이미 `AGENTS.md`, `docs/`, hook, `verify` 로 운영 규칙을 구조화하고 있으므로, 리뷰도 요청 의도를 분명히 드러내는 방식이 더 잘 맞는다.
- 현재는 GitHub 와 연결된 Codex OAuth 댓글 경로를 기본값으로 사용하므로, 저장소 안의 별도 API key 나 `openai/codex-action` workflow 는 유지하지 않는다.
- 다만 PR 마다 기본 리뷰 요청은 반복되므로, `verify` 성공 뒤에 Codex 리뷰 요청 코멘트를 자동으로 남기는 얇은 workflow 가 필요하다.

## 결정
- GitHub 와 연결된 Codex OAuth 댓글 경로를 기본 리뷰 경로로 사용한다.
- `Verify` workflow 가 `pull_request` 에서 성공하면 같은 workflow 안의 후속 job 이 해당 PR 에 `@codex ...` 리뷰 요청 코멘트를 자동으로 남긴다.
- 자동 코멘트는 head SHA 기준 숨김 marker 를 남겨 같은 커밋에 중복 요청이 쌓이지 않게 한다.
- 추가 요청은 PR 코멘트 `@codex <지침>` 형태로 남긴다.
- 리뷰 원칙은 루트 `AGENTS.md` 의 `Review guidelines` 에 두고, 세부 지시는 자동 코멘트와 수동 코멘트에서 직접 전달한다.

## 대안
- 모든 PR에 단일 자동 리뷰를 거는 방식은 관점 혼합이 심해지고, 리뷰 의도가 PR 대화에 명시적으로 남지 않아 채택하지 않았다.
- GitHub label 로 profile 을 고르는 방식은 보기에 직관적이지만, 라벨 상태 관리 비용이 커서 채택하지 않았다.
- 커스텀 GitHub Actions workflow 와 profile prompt 를 유지하는 방식은 운영 복잡도와 인증 경로 혼선을 키워 채택하지 않는다.
- 사람이 매번 수동으로 `@codex` 를 남기는 방식은 단순하지만, 기본 리뷰 루틴이 빠질 수 있어 채택하지 않았다.

## 영향
- 리뷰 요청 방식은 GitHub 의 기본 Codex OAuth 연동 동작에 맞춰 단순해진다.
- 저장소 안에서 별도 prompt 세트나 API key secret 을 운영하지 않는다.
- `Verify` 성공이 기본 리뷰 요청의 선행 조건이 된다.
- `workflow_run` 의 default branch 제약을 피하기 위해 리뷰 요청 자동화는 독립 workflow 가 아니라 `Verify` 안의 후속 job 으로 구현한다.
- 리뷰 관점은 고정 profile 이 아니라, 자동 코멘트와 수동 코멘트의 지시 문구에서 직접 정한다.

## 후속 작업
- 필요하면 댓글 템플릿이나 PR 템플릿 수준에서 권장 리뷰 지시 예시를 제공한다.
