# 태그형 Codex PR 리뷰 도입

상태: `completed`
완료일: `2026-04-08`

## 목표
- 관점이 섞인 단일 자동 리뷰 대신, profile 별로 분리된 Codex PR 리뷰 요청 경로를 만든다.

## 범위
- `issue_comment` 기반 GitHub Actions workflow 추가
- profile 별 review prompt 추가
- 루트 `AGENTS.md` 의 `Review guidelines` 추가
- 설계 문서와 인덱스, 기계용 목차 갱신

## 작업 단계
- OpenAI 공식 문서를 확인해 `openai/codex-action@v1` 기반 PR 리뷰 workflow 형태를 정리했다.
- PR 코멘트 `@codex review <profile>` 을 파싱하고 collaborator 만 허용하는 workflow 를 추가했다.
- 공통 prompt 와 `architecture`, `reliability`, `security`, `docs`, `performance`, `testing` profile prompt 를 분리했다.
- 결과를 GitHub Review 로 남기도록 저장소 규칙과 설계 기록을 갱신했다.

## 검증 방법
- `pnpm run verify`
- GitHub workflow YAML 구문 검증

## 결정 로그
- 기본 자동 리뷰는 켜지 않고, 코멘트 기반 태그형 리뷰만 사용한다.
- v1 profile 은 6개로 고정한다.
- 결과는 issue comment 가 아니라 GitHub Review `COMMENT` 이벤트로 남긴다.
- 리뷰 요청은 collaborator 로 제한한다.

## 남은 이슈
- GitHub Actions 와 OpenAI 시크릿이 실제 저장소에 설정되어 있어야 end-to-end 로 동작한다.
- profile 추가 시 workflow 안내 문구와 prompt 집합을 함께 갱신해야 한다.

## 사후 변경
- 2026-04-19 기준 저장소는 커스텀 `openai/codex-action` workflow 를 제거하고, GitHub 와 연결된 Codex OAuth 댓글 경로만 사용하도록 전환했다.
- 같은 날 `Verify` 성공 후 PR 에 `@codex` 리뷰 요청 코멘트를 자동으로 남기는 경량 workflow 를 다시 추가했다.
