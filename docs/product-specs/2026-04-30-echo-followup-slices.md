# Echo 후속 slice 요구사항

## 상태
- 상태: accepted
- 작성일: 2026-04-30
- 선행 문서: [`2026-04-28-echo-domain-requirements.md`](./2026-04-28-echo-domain-requirements.md)

## 포함 범위
- 파일 업로드와 attachment persistence.
- 아카이브 목록 `/echoes/archive` 와 archived Echo 복구.
- PostgreSQL 기반 단순 본문 검색.
- 브라우저 E2E 를 위한 Vite proxy 와 백엔드 개발 CORS allowlist.
- 전역 API 오류 shape 정리.

## Attachment
- 개발 저장소는 `apps/back/.local/uploads` 를 기본값으로 둔다.
- 운영 저장소 전환은 `PROXI_UPLOAD_ROOT` 또는 storage adapter 설정으로 분리한다.
- DB 에 원본 파일명, mime type, size, checksum, 저장 상대 경로, 생성일을 기록한다.
- 파일은 정적 공개하지 않고 attachment download endpoint 에서 권한 확인 후 stream 으로 내려준다.
- 첫 구현은 10MB 이하 파일만 허용한다.

## Archive
- `/echoes/archive` 는 별도 route 로 둔다.
- 복구는 `status = published`, `deletedAt = null`, `deletedByActorId = null` 로 처리한다.
- 복구 작업 기록을 위해 `updatedAt` 은 갱신한다.
- 일반 피드 정렬은 기존 `createdAt` 기준을 유지한다.

## Search
- 1차 검색은 Echo 본문 단순 검색으로 충분하다.
- 기본 검색 결과는 archived Echo 를 제외한다.
- 아카이브 화면은 archived Echo 만 별도 검색한다.
- embedding 과 vector search 는 기술 부채로 남긴다.

## 제외 범위
- Agent 도메인 등록/수정/삭제.
- Agent mention 실제 검증.
- AI Agent 답변, reaction, job 처리.
- object storage adapter 실제 구현.
- vector DB, embedding provider, 재색인 전략.

