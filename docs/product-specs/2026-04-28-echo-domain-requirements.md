# Echo 도메인 요구사항 및 계약 정리

## 문서 목적
- 이 문서는 `2026-04-27-writing-domain-requirements-checklist.md`의 사용자 답변, Codex 제안, 채택/미채택 표시를 종합한 Echo 도메인 기준 문서다.
- 이 문서를 기준으로 후속 실행 계획과 vertical slice 를 나눈다.
- 이 문서는 구현 상세 설계서가 아니라, 실개발을 시작하기 위한 제품 요구사항과 계약 초안이다.

## 기준 문서
- 원본 체크리스트: `2026-04-27-writing-domain-requirements-checklist.md`
- 작성 기준일: `2026-04-28`
- 작성자: Codex
- 상태: accepted. 이 문서를 기준으로 Echo 도메인 Slice 1-5 구현을 진행한다.

## 1. 도메인 요약
- 도메인 이름은 `Echo` 다.
- Echo 는 Threads 같은 개인 피드형 글이다.
- 사용자가 Echo 를 올리면 장기적으로 등록된 여러 AI Agent 가 해당 Echo 를 프롬프트처럼 읽고 반응하거나 답변할 수 있어야 한다.
- 첫 버전은 AI Agent 도메인 자체를 만들지 않고, Echo 도메인 안에 확장 지점만 남긴다.
- 사용자는 1인 사용자이며 별도 로그인/계정 시스템은 전제하지 않는다.
- Echo 는 사용자뿐 아니라 장기적으로 AI Agent 도 작성할 수 있는 공통 posting 메커니즘이어야 한다.

## 2. 첫 개발 범위

### 포함
- 사용자는 본문을 입력해 root Echo 를 작성할 수 있다.
- 사용자는 최신순 피드에서 root Echo 목록을 볼 수 있다.
- 사용자는 Echo 상세 화면을 볼 수 있다.
- 사용자는 본인이 작성한 Echo 를 수정할 수 있다.
- 사용자는 본인이 작성한 Echo 를 소프트 삭제할 수 있다.
- 사용자는 Echo 상세에서 댓글을 작성하고 볼 수 있다.
- 댓글은 별도 Comment 도메인이 아니라 parent 를 가진 자식 Echo 로 모델링한다.
- Back 은 Prisma/PostgreSQL 기반 저장소를 사용한다.
- Shared 는 Front/Back 이 함께 쓰는 Echo 계약과 zod schema 를 제공한다.
- Front 는 SNS 스타일로 상단 작성 폼과 하단 피드를 제공한다.

### 제외
- AI Agent 도메인 구축.
- 실제 AI Agent 답변 생성.
- AI Agent 이모지 반응 처리.
- 파일 업로드 구현.
- 아카이브 복구 구현.
- 검색, 임베딩, 벡터 검색.
- 서버 저장 draft.
- optimistic update.
- 삭제 확인 전용 separate route.
- 무한 depth 댓글.

### 후속 slice 후보
- Agent mention 실제 검증과 Agent 도메인 연결.
- 파일 업로드와 attachment 도메인.
- 아카이브 목록과 복구.
- AI Agent 반응 및 답변.
- 검색, 임베딩, 벡터 기반 탐색.

## 3. 사용자와 권한
- actor 는 `owner` 와 `agent` 로 확장 가능해야 한다.
- 첫 버전에서 실제 사용자는 `owner` 하나다.
- 로그인은 없다.
- owner 는 모든 본인 Echo 를 작성, 조회, 수정, 삭제할 수 있다.
- agent 는 장기적으로 Echo 를 작성할 수 있지만, owner 가 작성한 Echo 를 수정하거나 삭제할 수 없다.
- 첫 버전에서는 agent 도메인을 만들지 않으므로, agent 권한은 타입과 확장 지점만 둔다.
- 권한 위반은 서버에서 반드시 막아야 한다.
- 권한 위반은 프런트에서 한국어 팝업 또는 오류 상태로 보여준다.

## 4. Echo 상태 모델

### 상태 값
- `draft`: 작성 중인 임시 상태.
- `published`: 피드와 상세에서 보이는 정상 게시 상태.
- `archived`: 소프트 삭제되어 일반 피드에서 빠지는 상태.

### 첫 버전 적용 방식
- 서버 DB 에는 `published`, `archived` 를 우선 저장한다.
- `draft` 는 첫 버전에서 브라우저 localStorage 상태로만 사용한다.
- 서버 저장 draft 는 후속 기능으로 둔다.
- `modified` 는 상태가 아니다.
- 수정 여부는 `updatedAt` 이 `createdAt` 보다 늦은지로 판단한다.

### 소프트 삭제
- 삭제는 hard delete 가 아니라 soft delete 다.
- 삭제 시 row 를 지우지 않고 `status = archived` 로 변경한다.
- 삭제 시 `deletedAt`, `deletedByActorId` 를 기록한다.
- 일반 피드는 `published` Echo 만 보여준다.
- 아카이브 화면은 후속 slice 에서 `archived` Echo 를 보여준다.
- 삭제된 Echo 의 기존 상세 URL 은 죽이지 않는다.
- 삭제된 Echo 상세는 read-only archived 상태를 보여주고 새 댓글 작성은 막는다.
- 검색 결과에서는 기본적으로 archived Echo 를 제외한다.

## 5. Echo 내용 규칙
- Echo 는 제목이 없다.
- 필수 입력은 `body` 하나다.
- 빈 본문은 작성할 수 없다.
- 본문 포맷은 Markdown 이다.
- 작성 UI 는 첫 버전에서 textarea 를 사용한다.
- 렌더링은 Markdown preview 로 보여준다.
- 이미지, 파일, 링크는 장기적으로 Markdown/Obsidian 유사 문법을 지향한다.
- 임베드는 지원하지 않는다.
- 본문 길이 제한은 첫 버전에서 두지 않는다.
- 너무 긴 본문에 대한 제한이 필요해지면 별도 정책으로 추가한다.

## 6. 댓글 모델
- 댓글은 별도 Comment 도메인이 아니라 Echo 의 자식이다.
- root Echo 는 `parentEchoId = null` 이다.
- 댓글 Echo 는 `parentEchoId` 를 가진다.
- 댓글은 root Echo 를 추적하기 위해 `rootEchoId` 를 가진다.
- 첫 댓글 버전은 `depth = 1` 까지만 허용한다.
- 대댓글 무한 중첩은 첫 버전에서 지원하지 않는다.
- 피드 목록은 root Echo 만 보여준다.
- 상세 화면은 root Echo 와 child Echo 목록을 보여준다.
- archived Echo 에는 새 댓글을 달 수 없다.

## 7. Mention 과 인용

### Agent mention
- 사용자는 본문에 `@agentName` 형태로 등록된 AI Agent 를 mention 할 수 있어야 한다.
- mention 은 단순 텍스트가 아니라 등록된 Agent ID 와 매핑되어야 한다.
- 첫 버전은 Agent 도메인을 만들지 않으므로 실제 검증은 후속 slice 로 둘 수 있다.
- 장기 구현에서는 본문 raw text 와 mention entity 를 분리 저장한다.
- mention entity 는 `agentId`, `displayName`, `rangeStart`, `rangeEnd` 를 가진다.
- Agent 이름이 바뀌어도 과거 Echo 의 표시와 실제 대상이 깨지지 않아야 한다.

### Echo 인용
- 사용자는 다른 Echo 를 본문에서 인용할 수 있어야 한다.
- 기본 문법은 `#echoId` 계열이다.
- 단순 `#123` 은 해시태그와 충돌할 수 있으므로 피한다.
- 추천 문법은 `#e_<echoId>` 다.
- 파일 참조와 충돌하지 않도록 파일은 `#file_<attachmentId>` 또는 `#{attachmentId}` 계열로 분리한다.

## 8. 파일 업로드 정책
- 파일 업로드는 첫 slice 에서 제외한다.
- 후속 slice 에서 Echo 본문에 파일을 첨부할 수 있게 한다.
- 파일 크기는 10MB 이상 업로드를 제한한다.
- 개발 기본 저장 위치는 `apps/back/.local/uploads` 다.
- 운영 기본 저장 위치는 `/var/lib/proxi/uploads` 다.
- 실제 경로는 `PROXI_UPLOAD_ROOT` 설정값으로 제어한다.
- 파일명은 원본 파일명 그대로 저장하지 않고 `AttachmentId` 기반 이름으로 저장한다.
- DB 에 원본 파일명, mime type, size, checksum, 저장 상대 경로, 생성일을 기록한다.
- 파일은 정적 공개하지 않고 권한 확인 후 stream endpoint 로 내려준다.

## 9. 목록, 상세, 탐색
- 기본 목록은 최신순이다.
- 목록은 무한 스크롤을 사용한다.
- URL 상태는 첫 버전에서 cursor 또는 page 만 둔다.
- 검색은 첫 버전에 포함하지 않는다.
- 검색은 후속으로 임베딩/벡터 검색 기반으로 추가한다.
- 최근 댓글 또는 반응 기준 정렬 화면은 후속으로 추가한다.
- 목록 카드에는 작성자와 본문을 보여준다.
- 본문이 길면 일부만 보여주고 `더보기` 또는 상세 진입을 제공한다.
- 목록 카드에는 상세 진입, 댓글 보기, 본문 복사 액션을 제공한다.
- 상세 화면에는 작성자, Markdown 렌더링 본문, 댓글 목록, 댓글 작성 UI 를 제공한다.
- 존재하지 않는 Echo 는 404 상태를 보여주고 피드로 이동할 수 있게 한다.

## 10. 삭제 UX
- 삭제 전 확인은 필수다.
- 삭제 확인은 modal 로 구현한다.
- separate route 방식은 사용하지 않는다.
- 삭제 확인 문구는 아카이브 이동, 피드 비노출, 새 댓글 차단을 설명해야 한다.
- 삭제된 Echo 는 아카이브에서 볼 수 있다는 점을 안내한다.
- 아카이브 복구는 첫 slice 에 넣지 않고 후속 slice 로 둔다.

추천 문구:
- 제목: `이 Echo 를 아카이브로 보낼까요?`
- 본문: `아카이브에서 다시 볼 수 있지만, 피드에서는 사라지고 새 댓글은 막힙니다.`

## 11. 오류와 예외
- 저장 실패 시 작성 중인 내용은 사라지면 안 된다.
- 작성 중 draft 는 브라우저 localStorage 에 저장한다.
- 새 Echo draft key 는 `echo:draft:new` 다.
- 수정 draft key 는 `echo:draft:{echoId}` 다.
- 작성 중 이탈 시 확인 문구를 보여준다.
- 중복 제출은 버튼 disabled, pending 표시, front throttle 로 막는다.
- 권한 없음은 `이 Echo 를 바꿀 권한이 없어요.` 로 보여준다.
- 일반 서비스 오류는 `메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.` 로 보여준다.
- disabled 상태는 `저장 중이에요. 잠깐만 기다려 주세요.` 로 보여준다.

## 12. Front 요구사항
- route 는 `/echoes`, `/echoes/$echoId` 를 사용한다.
- `/echoes` 는 상단 작성 폼과 하단 피드를 가진다.
- `/echoes/$echoId` 는 상세, 댓글, 수정, 삭제 진입을 가진다.
- `/echoes/archive` 는 후속 slice 에서 추가한다.
- 새 글 작성 전용 route 는 첫 버전에서 만들지 않는다.
- 작성/수정 폼은 같은 컴포넌트를 공유하고 mode 로 구분한다.
- Front 는 shared 계약을 직접 화면 상태로 쓰지 않고 view model 로 변환한다.
- 목록 view model 은 `EchoFeedItemViewModel` 을 사용한다.
- 상세 view model 은 `EchoViewModel` 을 사용한다.
- optimistic update 는 쓰지 않는다.
- mutation 성공 후 invalidate/refetch 를 사용한다.

### TanStack Query key
- 목록: `['echoes', 'list', { cursor, status }]`
- 상세: `['echoes', 'detail', echoId]`
- 아카이브: `['echoes', 'archive', { cursor }]`

### Invalidation
- 작성 성공 후 `['echoes', 'list']` 를 invalidate 한다.
- 수정 성공 후 `['echoes', 'detail', echoId]`, `['echoes', 'list']` 를 invalidate 한다.
- 삭제 성공 후 `['echoes', 'detail', echoId]`, `['echoes', 'list']`, `['echoes', 'archive']` 를 invalidate 한다.
- 댓글 작성 성공 후 `['echoes', 'detail', rootEchoId]` 와 필요하면 `['echoes', 'list']` 를 invalidate 한다.

### 상태 문구
- loading: `메아리를 불러오는 중이에요.`
- empty: `아직 울린 메아리가 없어요. 첫 Echo 를 남겨볼까요?`
- error: `메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.`
- permission error: `이 Echo 를 바꿀 권한이 없어요.`
- not found: `찾는 Echo 가 없어요. 피드로 돌아갈까요?`

## 13. Back 요구사항
- Nest module 이름은 `EchoModule` 이다.
- REST path 는 `/echoes` 를 사용한다.
- Back 은 Hexagonal 구조를 사용한다.
- DB/Prisma 를 첫 실개발부터 포함한다.
- validation 은 HTTP adapter 입구에서 shared zod schema 로 수행한다.
- domain 은 상태 전이와 권한 같은 비즈니스 규칙을 검증한다.
- 수정 동시성 제어는 첫 버전에 넣지 않는다.
- 로그 이벤트는 `echo.created`, `echo.updated`, `echo.archived` 를 남긴다.
- 복구가 생기면 `echo.restored` 를 추가한다.

### Hexagonal 책임
- `domain`: Echo entity, 상태 전이 규칙, 권한 규칙.
- `application`: create, update, delete, get, list, create child Echo use case.
- `ports`: repository interface.
- `adapters/http`: Nest controller, request parse, response mapping.
- `adapters/persistence`: Prisma repository implementation.

### Endpoint 초안
| Method | Path | 목적 | 응답 |
| --- | --- | --- | --- |
| `POST` | `/echoes` | root Echo 작성 | `201 Created`, `EchoDetail` |
| `GET` | `/echoes` | root Echo 피드 목록 | `200 OK`, `ListEchoesResponse` |
| `GET` | `/echoes/:echoId` | Echo 상세 조회 | `200 OK`, `EchoDetail` |
| `PATCH` | `/echoes/:echoId` | Echo 수정 | `200 OK`, `EchoDetail` |
| `DELETE` | `/echoes/:echoId` | Echo 소프트 삭제 | `204 No Content` |
| `POST` | `/echoes/:echoId/replies` | 자식 Echo 댓글 작성 | `201 Created`, `EchoDetail` |

### HTTP status
- 성공 생성: `201 Created`
- 성공 조회/수정: `200 OK`
- 성공 삭제: `204 No Content`
- 검증 실패: `400 Bad Request`
- 권한 없음: `403 Forbidden`
- 없음: `404 Not Found`
- 상태 충돌: `409 Conflict`

## 14. Shared 계약 초안
- shared 는 endpoint path 나 HTTP method 를 알 필요는 없다.
- shared 는 요청/응답 payload 계약과 zod schema 를 제공한다.
- shared 는 Prisma, repository, React state, Query key 를 포함하지 않는다.
- 날짜는 ISO string 으로 전달한다.
- 식별자는 branded type 으로 둔다.

### 타입 이름
- shared 계약: `EchoDetail`, `EchoSummary`, `CreateEchoRequest`, `UpdateEchoRequest`.
- back domain: `EchoEntity` 또는 `Echo`.
- back persistence: `EchoRecord`.
- front: `EchoViewModel`, `EchoFeedItemViewModel`.

### 식별자
- `EchoId`
- `ActorId`
- `AttachmentId`
- `AgentId`

### Enum
```ts
type EchoStatus = "draft" | "published" | "archived";
type EchoAuthorType = "owner" | "agent";
```

### Error shape
```ts
interface EchoValidationError {
  code: string;
  message: string;
  details?: unknown;
}
```

`message` 는 사용자 노출 가능 문구다. `code` 는 프런트 분기와 서버 로그 검색에 쓰는 안정적인 영문 코드다. `details` 는 사용자에게 그대로 노출하지 않는다.

### Request shape 초안
```ts
interface CreateEchoRequest {
  body: string;
  parentEchoId?: EchoId;
  mentionedAgentIds?: AgentId[];
  referencedEchoIds?: EchoId[];
}

interface UpdateEchoRequest {
  body: string;
  mentionedAgentIds?: AgentId[];
  referencedEchoIds?: EchoId[];
}
```

### Response shape 초안
```ts
interface EchoAuthor {
  id: ActorId;
  type: EchoAuthorType;
  displayName: string;
}

interface EchoSummary {
  id: EchoId;
  body: string;
  status: EchoStatus;
  author: EchoAuthor;
  parentEchoId?: EchoId;
  rootEchoId?: EchoId;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface EchoDetail extends EchoSummary {
  replies: EchoSummary[];
}

interface ListEchoesResponse {
  items: EchoSummary[];
  nextCursor?: string;
}
```

### 계약 테스트 기준
- 빈 본문은 `CreateEchoRequest` 에서 거부된다.
- `EchoStatus` 는 `published`, `archived` 를 유지해야 한다.
- `EchoDetail` 은 `id`, `body`, `status`, `author`, `createdAt`, `updatedAt` 을 요구해야 한다.
- branded id 형식이 바뀌면 테스트가 실패해야 한다.
- 응답 필드 이름이 바뀌면 테스트가 실패해야 한다.

## 15. DB 모델 초안
- 실제 Prisma schema 는 구현 시 확정한다.
- 아래는 요구사항 기준 conceptual model 이다.

### Echo
| 필드 | 의미 |
| --- | --- |
| `id` | Echo PK |
| `body` | Markdown 본문 |
| `status` | `published` 또는 `archived` |
| `authorActorId` | 작성 actor |
| `authorType` | `owner` 또는 `agent` |
| `parentEchoId` | 댓글이면 부모 Echo ID |
| `rootEchoId` | thread root Echo ID |
| `depth` | root 는 0, 첫 댓글은 1 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |
| `deletedAt` | 소프트 삭제 시각 |
| `deletedByActorId` | 삭제 actor |

### Mention
| 필드 | 의미 |
| --- | --- |
| `id` | mention PK |
| `echoId` | 대상 Echo |
| `agentId` | 등록된 Agent ID |
| `displayName` | 작성 당시 표시명 |
| `rangeStart` | 본문 내 시작 위치 |
| `rangeEnd` | 본문 내 종료 위치 |

### Attachment
- 첫 slice 에서는 구현하지 않는다.
- 후속 slice 에서 `AttachmentId`, 원본 파일명, mime type, size, checksum, 저장 상대 경로, 생성일을 둔다.

## 16. 수용 기준
- 사용자는 `/echoes` 에서 본문을 입력해 Echo 를 작성할 수 있다.
- 빈 본문으로 Echo 를 작성할 수 없다.
- 작성 성공 후 새 Echo 가 피드에 보인다.
- 피드는 최신 root Echo 를 우선 보여준다.
- 피드는 무한 스크롤 또는 cursor 기반 추가 조회를 지원한다.
- 사용자는 Echo 상세를 열 수 있다.
- 상세는 Markdown 렌더링 본문과 댓글 목록을 보여준다.
- 사용자는 상세에서 댓글을 작성할 수 있다.
- 댓글은 root Echo 의 child Echo 로 저장된다.
- 사용자는 본인이 작성한 Echo 를 수정할 수 있다.
- 수정 후 상세와 목록이 갱신된다.
- 사용자는 본인이 작성한 Echo 를 삭제할 수 있다.
- 삭제된 Echo 는 일반 피드에서 사라진다.
- 삭제된 Echo 는 read-only archived 상태로 확인 가능하다.
- archived Echo 에는 새 댓글을 달 수 없다.
- 권한 없는 actor 는 owner Echo 를 수정하거나 삭제할 수 없다.
- 저장 실패 시 작성 중인 draft 는 브라우저에 남는다.
- loading, empty, error, disabled 상태가 화면에 존재한다.
- Back unit/controller 테스트가 create/detail/update/delete/list/reply 흐름을 검증한다.
- Shared 계약 테스트가 request/response schema 를 검증한다.
- Front 테스트가 작성, 목록 표시, 상세 진입, 수정, 삭제 확인, 댓글 작성 흐름을 검증한다.

## 17. 남은 결정 사항
- 첫 slice 에서 Agent mention 을 실제 DB 검증까지 할지, raw text parsing 과 계약만 둘지 결정해야 한다.
- 첫 slice 에서 archived Echo 상세를 일반 URL 에서 보여줄지, 아카이브 context 에서만 보여줄지 최종 결정해야 한다.
- `EchoStatus` 에 `draft` 를 shared enum 으로 포함할지, front local draft 상태로만 둘지 구현 전 최종 결정해야 한다.
- Echo ID 표시 형식을 `#e_<id>` 로 확정할지 사용자가 확인해야 한다.
- 댓글 depth 를 1로 제한하는 정책을 확정해야 한다.

## 18. 개발 slice 제안

### Slice 1: Echo contract
- Shared Echo id/status/author/request/response schema 작성.
- 계약 테스트 작성.

### Slice 2: Echo backend core
- Prisma Echo model 추가.
- Hexagonal 구조로 domain/application/ports/adapters 구성.
- create/detail/update/archive/list/reply use case 작성.
- unit/controller 테스트 작성.

### Slice 3: Echo frontend feed
- `/echoes` route 작성.
- 작성 폼과 피드 목록 구현.
- Query key 와 mutation invalidation 연결.
- 작성/목록 테스트 작성.

### Slice 4: Echo detail and editing
- `/echoes/$echoId` route 작성.
- 상세, Markdown 렌더링, 댓글, 수정, 삭제 modal 구현.
- 상세/수정/삭제/댓글 테스트 작성.

### Slice 5: hardening
- 오류 문구, empty/loading/disabled 상태 정리.
- draft localStorage 이탈 방지 정리.
- 로그 이벤트 정리.
- 전체 verify 통과.
