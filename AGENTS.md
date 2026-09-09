# 저장소 에이전트 안내

## 프로젝트와 경계

- `.nvmrc`의 Node.js 24.12.0, Express 5, strict TypeScript, Knex 기반 API 템플릿이다. 요청은 `src/app.ts → src/routes → src/controllers → src/db/query` 순서로 흐른다.
- `src/app.ts`의 첫 `import './init'`은 전역 타입·함수(`db`, `env`, `param`, `api`, `util`, `ll` 등)를 등록한다. 이 import의 위치와 `src/init`의 런타임 할당·전역 선언 짝을 보존한다.
- 현재 활성 DB 경로는 `MySqlKnexUtil`이다. `MsSqlKnexUtil`과 `knex.mssql.template.ts`는 선택용 템플릿이므로 DB 엔진 전환으로 오인하지 않는다.
- JSON API는 기존 `ApiController(...)` 계열, 별도 응답 계약을 가진 웹훅은 기존 `Controller(...)` 패턴을 따른다. 인증 여부와 미들웨어 순서는 인접 라우트에서 확인한다.
- DB 계약 변경 시 `src/db/models`, `src/db/query`, `src/db/db.ts` 및 관련 `index.ts` export를 함께 맞춘다. 이 저장소에는 migration이 없으므로 모델 변경만으로 실제 스키마가 변경됐다고 간주하지 않는다.
- 환경변수를 추가·변경하면 사용처와 `.env.example`을 함께 갱신한다. 비밀값이 든 `.env`는 읽거나 커밋하지 않는다.

## 구현 규칙

- 모든 DB builder에는 동일한 `MyRequest`를 전달한다. 트랜잭션은 자동 시작되지 않으므로 필요하면 명시적으로 `db.trans.begin(req)`하고, 쿼리와 외부 작업을 모두 `await`한 뒤 controller를 종료한다.
- `ApiController` 안의 실패는 `api.error(...)`로 직접 응답하지 말고 throw한다. 그래야 `rollbackAll`과 일관된 API 오류 변환이 실행된다.
- `param(req, ...)`는 `params → query → body` 순서로 덮어쓴다. 새 입력은 기존 `src/common/param` preset을 우선 사용하고 충돌하는 이름을 만들지 않는다.
- `dist`, `@dev`, `@logs`, `@uploads`는 생성물 또는 런타임 데이터이므로 직접 편집하지 않는다.

## 검증과 운영 안전

- 기본 검증은 `npm run verify`다. 이는 `src` TypeScript·ESLint와 `test/`의 Jest 단위 테스트를 검사하지만 실제 DB, Redis, HTTP 서버, 스케줄러, 배포 동작까지 증명하지는 않는다.
- webpack 진입점·alias·번들 설정 변경 시 `npm run build:webpack`도 필요하지만 이 명령은 `dist`를 쓴다. 생성물 변경이 허용된 작업에서만 실행하고 결과를 구분해 보고한다.
- `npm run build`는 `dist`와 Watchman 상태를 변경한다. `make:publish:*`, `publish:*`, `reset:gitignore`, `reinstall*`, PM2 및 `/deploy/github` 흐름은 명시적 요청 없이 실행하지 않는다.
- 두 계층 이상을 함께 바꾸거나 트랜잭션·스케줄러·서버 수명주기를 다룰 때는 `.agents/skills/express-template-orchestrator/SKILL.md`를 사용한다.
