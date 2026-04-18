# Codex PR 리뷰 번들 자동 요청 운영

상태: `accepted`

## 배경
- 단일 자동 PR 리뷰는 어떤 관점으로 검토할지 모호해, 구조·보안·문서·기능·검증 같은 서로 다른 판단 기준이 한 번에 섞이기 쉽다.
- 저장소는 이미 `AGENTS.md`, `docs/`, hook, `verify` 로 운영 규칙을 구조화하고 있으므로, 리뷰도 요청 의도를 PR 대화에 직접 남기는 방식이 더 잘 맞는다.
- GitHub 와 연결된 Codex OAuth 댓글 경로를 기본값으로 쓰므로, 저장소 안의 별도 API key 나 `openai/codex-action` workflow 는 유지하지 않는다.
- 다만 `GITHUB_TOKEN` 으로 남긴 댓글은 `github-actions[bot]` 주체가 되어 Codex 응답 경로와 맞지 않는다.
- 그래서 `Verify` 뒤 자동 댓글이 필요하면, Codex 와 연결된 같은 GitHub 계정의 PAT 를 workflow secret 으로 사용해야 한다.

## 결정
- GitHub 와 연결된 Codex OAuth 댓글 경로를 기본 리뷰 경로로 사용한다.
- `Verify` workflow 가 `pull_request` 에서 성공하면 후속 job 이 `COMMENTER_PAT` 로 5개 기본 리뷰 요청 코멘트를 자동으로 남긴다.
- `COMMENTER_PAT` 는 Codex 와 연결된 같은 GitHub 계정의 토큰을 사용한다.
- 기본 5개 관점은 `architecture`, `security`, `docs`, `feature`, `qa` 로 고정한다.
- 자동 코멘트는 `head.sha + profile` 기준 marker 를 남겨 같은 커밋에 중복 요청이 쌓이지 않게 한다.
- 추가 요청은 PR 코멘트 `@codex <관점과 지침>` 형태로 남기고, 필요하면 `reliability`, `performance`, `testing` 같은 관점을 직접 적어 확장한다.
- 리뷰 원칙은 루트 `AGENTS.md` 의 `Review guidelines` 에 두고, 세부 지시는 각 코멘트에서 직접 전달한다.

## 대안
- 모든 PR에 단일 자동 리뷰를 거는 방식은 관점 혼합이 심해지고, 리뷰 의도가 PR 대화에 명시적으로 남지 않아 채택하지 않았다.
- GitHub label 로 profile 을 고르는 방식은 보기에 직관적이지만, 라벨 상태 관리 비용이 커서 채택하지 않았다.
- 커스텀 GitHub Actions workflow 와 profile prompt 를 유지하는 방식은 운영 복잡도와 인증 경로 혼선을 키워 채택하지 않는다.
- `GITHUB_TOKEN` 으로 `@codex` 댓글을 남기는 방식은 댓글 작성 주체가 `github-actions[bot]` 가 되어 사용자 계정 응답 경로와 어긋나므로 채택하지 않는다.
- 사람이 매번 5개 코멘트를 수동으로 남기는 방식은 단순하지만, 기본 리뷰 루틴이 자주 빠져 자동화를 유지한다.

## 영향
- 리뷰 요청 방식은 GitHub 의 기본 Codex OAuth 연동 동작에 맞춰 단순해진다.
- 저장소 안에서 별도 prompt 세트나 API key secret 을 운영하지 않는다.
- `Verify` 성공이 기본 리뷰 요청의 선행 조건이 된다.
- PR 대화에는 어떤 관점의 리뷰가 자동으로 요청됐는지가 코멘트 단위로 남는다.
- 기본 번들은 5개 코멘트로 고정하되, 필요하면 추가 관점을 같은 방식으로 확장할 수 있다.
- `COMMENTER_PAT` 는 저장소 secret 으로만 보관하고, 범위는 이 저장소의 `Issues: write`, `Pull requests: write` 수준으로 최소화한다.

## 권장 코멘트 예시
- `@codex architecture 관점으로 이 PR의 최신 변경만 리뷰해주세요. findings 를 먼저, 심각도 높은 순으로 정리하고 구조 경계와 결합도 중심으로 봐주세요.`
- `@codex security 관점으로 이 PR의 최신 변경만 리뷰해주세요. 권한, 토큰, 신뢰 경계, 우회 가능성을 우선 봐주세요.`
- `@codex docs 관점으로 이 PR의 최신 변경만 리뷰해주세요. 문서와 실제 동작의 정합성, 라우팅, 누락된 기록을 봐주세요.`
- `@codex feature 관점으로 이 PR의 최신 변경만 리뷰해주세요. 사용자 흐름, 저장/조회 동작, 회귀 위험을 봐주세요.`
- `@codex qa 관점으로 이 PR의 최신 변경만 리뷰해주세요. 핵심 시나리오의 검증 공백과 누락된 상태를 봐주세요.`

## 운영 메모
- `COMMENTER_PAT` 가 비어 있으면 자동 댓글 job 은 notice 만 남기고 건너뛴다.
- fine-grained PAT 를 권장하고, 발급 계정은 Codex 와 연결된 같은 GitHub 계정을 사용한다.
