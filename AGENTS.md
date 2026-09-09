# 저장소 에이전트 안내

## 프로젝트와 핵심 경계

- `.nvmrc`의 Node.js 24.12.0, Express 5, strict TypeScript, Knex 기반 관리자 API 템플릿이다. 일반 요청은 `src/app.ts → src/routes → src/controllers → src/db/query`로 흐르고, 관리자 인증·메뉴 권한·접근 로그·개인정보 조회·Excel export가 기본 기능에 포함된다.
- `src/app.ts`의 첫 `import './init'`은 `db`, `env`, `param`, `api`, `jwt`, `menu`, `util`, `ll` 등의 런타임 전역과 타입 선언을 연결한다. import 위치와 `src/init`의 할당/`declare global` 짝을 보존한다.
- 활성 DB 구현은 `src/db/knex/knex.ts`와 `MySqlKnexUtil`이다. `MsSqlKnexUtil`과 `knex.mssql.template.ts`는 선택용 템플릿이며 현재 연결로 간주하지 않는다.
- `src/routes/index.ts`의 상위 인증과 각 route의 `ApiController*Role`, `ApiSuperAdminChecker`, `ApiCallPermissionChecker` 순서를 함께 읽는다. `ApiController`의 두 번째 인자는 비밀번호 확인 뒤 5초 동안 한 번만 유효한 쓰기 권한 검사다.
- DB 계약은 `src/db/models`, `src/db/query`, `src/db/db.ts`, 관련 `index.ts` export와 `database/admin.sql`을 함께 확인한다. migration 체계가 없으므로 타입이나 seed SQL 변경만으로 실행 중 DB가 변경됐다고 간주하지 않는다.
- 관리자 메뉴 ID는 `src/common/menu/menu.ts`와 `database/admin.sql`의 `admin_menu`, 화면·export 접근 키는 `admin_user_access_key` seed와 소비 측 계약을 동기화한다.

## 구현 규칙

- 모든 Knex builder에는 동일한 `MyRequest`를 전달한다. transaction은 자동 시작되지 않으므로 원자성이 필요한 쓰기는 `db.trans.begin(req)` 후 모든 쿼리와 비동기 작업을 `await`한다. controller 반환 뒤 같은 transaction을 쓰는 작업을 남기지 않는다.
- `ApiController` 내부 실패는 `api.error(...)`로 직접 응답하지 말고 `ApiError`를 throw한다. wrapper가 `rollbackAll`과 표준 API 오류 변환을 수행하게 한다. `/deploy/github`처럼 자체 응답 코드를 가진 흐름은 기존 `Controller(...)` 계약을 유지한다.
- `param(req, ...)`는 `params → query → body` 순서로 값을 덮어쓴다. 새 입력은 `src/common/param` preset을 우선 사용하고 같은 이름이 여러 입력 위치에서 충돌하지 않게 한다.
- 업로드는 `ApiMulterController*`와 `src/middlewares/Multer`의 파일 제한·파일명 복원·후처리 삭제를 함께 검토한다. 허용 형식이나 크기를 바꾸면 `MulterOptions` 테스트와 임시 파일 정리 경로도 확인한다.
- 환경변수 계약을 바꾸면 사용처, `src/@types/process.d.ts`, `.env.example`을 동기화한다. 비밀값이 있는 `.env*`는 읽거나 커밋하지 않는다.
- `dist`, `@dev`, `@logs`, `@uploads`는 생성물 또는 런타임 데이터다. 명시적 산출물 작업이 아니면 직접 편집하지 않는다.

## 검증과 운영 안전

- 기본 검증은 `.nvmrc` 버전에서 `npm run verify`다. 이는 `src` TypeScript·ESLint와 `test/` Jest 단위 테스트를 검사하지만 실제 MySQL, Redis session, HTTP(S), 파일 업로드, scheduler, PM2 동작은 증명하지 않는다.
- webpack entry·alias·번들 설정을 바꾸면 생성물 쓰기가 허용된 경우에만 `npm run build:webpack`을 추가하고, 정적 검증과 번들 검증을 구분해 보고한다.
- `npm run build`는 Watchman과 `dist`를 변경한다. `make:publish:*`, `publish:*`, `reset:gitignore`, `reinstall*`, PM2 명령, `/deploy/github` 호출은 명시적 요청 없이 실행하지 않는다.
- API/DB/권한 중 둘 이상을 바꾸거나 transaction·업로드·scheduler·서버 수명주기·배포를 다룰 때는 `.agents/skills/express-template-orchestrator/SKILL.md`를 사용한다.
