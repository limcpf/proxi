# 태그형 Codex PR 리뷰 도입

상태: `accepted`

## 배경
- 단일 자동 PR 리뷰는 어떤 관점으로 검토할지 모호해, 구조·보안·문서·테스트 같은 서로 다른 판단 기준이 한 번에 섞이기 쉽다.
- 저장소는 이미 `AGENTS.md`, `docs/`, hook, `verify` 로 운영 규칙을 구조화하고 있으므로, 리뷰도 요청 의도를 분명히 드러내는 방식이 더 잘 맞는다.
- GitHub 의 기본 `@codex review` 흐름만으로는 저장소 안에 버전관리되는 profile 별 프롬프트를 운영하기 어렵다.

## 결정
- 기본 자동 리뷰는 켜지 않고, PR 코멘트 `@codex review <profile>` 로만 Codex 리뷰를 요청한다.
- 지원 profile 은 `architecture`, `reliability`, `security`, `docs`, `performance`, `testing` 으로 고정한다.
- `issue_comment` 기반 GitHub Actions workflow 가 `openai/codex-action@v1` 를 실행하고, profile 별 프롬프트를 조합해 GitHub Review 로 결과를 남긴다.
- 공통 리뷰 원칙은 루트 `AGENTS.md` 의 `Review guidelines` 에 두고, 관점별 우선순위는 `.github/codex/prompts/review/` 아래 profile 파일에 둔다.
- 리뷰 요청은 저장소 collaborator 만 할 수 있게 제한한다.

## 대안
- 모든 PR에 단일 자동 리뷰를 거는 방식은 관점 혼합이 심해지고, 리뷰 의도가 PR 대화에 명시적으로 남지 않아 채택하지 않았다.
- GitHub label 로 profile 을 고르는 방식은 보기에 직관적이지만, 라벨 상태 관리 비용이 커서 채택하지 않았다.
- 기본 자동 리뷰와 profile 리뷰를 함께 두는 하이브리드 방식은 운영 복잡도에 비해 초기 이득이 크지 않아 v1 에서는 채택하지 않았다.

## 영향
- PR 작성자나 리뷰어는 원하는 관점의 Codex 리뷰를 명시적으로 요청할 수 있다.
- 리뷰 결과는 같은 PR 안에서도 `security`, `docs`, `testing` 처럼 서로 다른 관점을 분리해 남길 수 있다.
- profile 추가나 변경은 workflow 와 prompt 파일, `AGENTS.md` 를 함께 갱신해야 한다.
- 기본 자동 리뷰가 없으므로, Codex 리뷰는 사람이 필요할 때만 실행된다.

## 후속 작업
- 필요하면 `general` 또는 `release` 같은 추가 profile 을 별도 설계로 확장한다.
- profile 수가 늘어나면 prompt 조합과 command 파싱을 별도 스크립트로 분리하는 것을 검토한다.
