# 개발 환경 구성

## 목적
- 새 개발자가 루트에서 로컬 DB, migration, dev server, E2E 실행 절차를 찾을 수 있게 한다.
- 백엔드 DB 운영 세부사항은 앱 문맥에 두되, 루트 문서에서 발견 가능하게 유지한다.

## 환경 변수
- 루트 `.env.example` 은 전체 로컬 개발에 필요한 최소 변수 목록이다.
- `apps/back/.env.example` 은 백엔드 단독 실행과 운영 배포에 필요한 변수를 설명한다.
- 실제 `.env` 파일과 secret 값은 커밋하지 않는다.

## 로컬 PostgreSQL
Docker Compose 를 공식 로컬 기본값으로 사용한다.

```sh
docker compose up -d postgres
```

PostgreSQL 18 Docker 이미지는 기본 데이터 디렉터리가 `/var/lib/postgresql/18/docker` 이므로 compose 볼륨은 부모 경로인 `/var/lib/postgresql` 에 마운트한다.

기본 연결 문자열은 아래와 같다.

```txt
postgresql://proxi:proxi@localhost:5432/proxi
```

이전 compose 설정으로 빈 개발 DB 볼륨을 이미 만들었다면 아래 명령으로 볼륨을 지우고 다시 띄운다. 보존해야 할 로컬 데이터가 있으면 먼저 백업한다.

```sh
docker compose down -v
docker compose up -d postgres
```

## Migration 적용
로컬 개발에서는 Prisma 개발 migration 을 사용한다.

```sh
corepack pnpm --filter @proxi/back prisma:migrate:dev
```

운영, CI, 공유 환경에서는 이미 생성된 migration 만 적용한다.

```sh
corepack pnpm --filter @proxi/back prisma:migrate:deploy
```

## 개발 서버
백엔드와 프런트 개발 서버를 각각 실행한다.

```sh
corepack pnpm --filter @proxi/back dev
corepack pnpm --filter @proxi/front dev
```

브라우저 기준 URL 은 `http://localhost:5173` 하나로 통일한다. 프런트 개발 서버는 `/api` 요청과 attachment download 요청을 백엔드 `http://localhost:3000` 으로 proxy 한다.

백엔드 origin 을 직접 열어야 하는 도구는 `PROXI_CORS_ORIGINS` 에 허용 origin 을 명시한다.
프런트와 백엔드가 다른 origin 으로 배포되면 백엔드는 `PROXI_PUBLIC_API_BASE_URL` 을 브라우저에서 접근 가능한 API origin 으로 설정해 attachment download URL 을 그 origin 기준으로 내려준다.

## Attachment 저장소
개발 기본 저장소는 `apps/back/.local/uploads` 이다. 운영이나 별도 환경에서는 `PROXI_UPLOAD_ROOT` 로 저장 root 를 바꾼다.

파일은 정적 공개하지 않는다. 백엔드는 attachment stream endpoint 에서 요청 액터 기준 접근 확인을 통과한 파일만 내려준다.

## 검증
- 빠른 검증: `corepack pnpm run verify`
- 백엔드 실제 DB 통합 테스트: `corepack pnpm --filter @proxi/back test:integration`
- 브라우저 E2E: `corepack pnpm --filter @proxi/front e2e`

통합 테스트와 E2E 는 로컬 DB, migration, dev server 준비가 필요하므로 기본 `verify` 에는 아직 포함하지 않는다.
