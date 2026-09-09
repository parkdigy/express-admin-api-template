# 런타임과 운영 경계

## 초기화와 서버 수명주기

- `src/app.ts`의 첫 `import './init'`은 dotenv 이후 전역 타입·함수·상수를 등록한다. 새 전역이 꼭 필요하면 `src/init`의 런타임 할당과 `declare global` 타입을 함께 변경하고 초기화 순서 의존성을 테스트한다.
- 앱은 keep-alive 종료 처리, Helmet, URL-encoded/JSON parser, cookie parser, 선택적 Redis session, CORS·remote IP, route 순으로 구성된다. `/deploy/github`만 JSON parser의 `verify`에서 정확한 raw body를 보관하므로 parser 순서를 바꾸면 서명 검증을 다시 확인한다.
- HTTPS 모드는 TLS 서버와 HTTP→HTTPS redirect 서버를 함께 만들고, 일반 모드는 HTTP 서버 하나를 만든다. listen 뒤 scheduler를 시작하고 `process.send`가 있으면 PM2 `ready`를 보낸다.
- `SIGINT`에서는 keep-alive를 끄고 모든 서버의 `close` callback 뒤 종료한다. 서버 배열, hot reload, HTTP(S) 분기 변경 시 두 모드와 진행 중 요청을 모두 검토한다.
- hot reload는 공통 모듈을 accept하고 route 변경 시 route 모듈을 교체한 뒤 서버를 재시작한다. 개발 성공을 production bundle·PM2 reload 성공으로 간주하지 않는다.

## 인증, session, 환경변수

- 관리자 인증은 JWT cookie와 `AdminUser.infoForSession` DB 조회를 사용한다. cookie는 `httpOnly`, `path=/`이며 현재 `secure`/`sameSite` 옵션은 별도 설정하지 않는다. cookie 옵션을 바꾸면 HTTP/HTTPS 및 프런트 origin 계약을 라이브 검증한다.
- Redis session middleware는 `SESSION_DRIVER=redis`와 `APP_KEY`, `PROJECT_NAME`, Redis host/port가 모두 있을 때만 등록된다. Write role의 5초 1회성 비밀번호 재확인은 `req.session`에 의존하므로 session 없는 환경의 실패 조건을 확인한다.
- 환경변수를 추가·변경하면 실제 사용처, `src/@types/process.d.ts`, `.env.example`, 필요 시 `ecosystem.config.js`를 함께 맞춘다. `.env*`의 실제 비밀값은 읽거나 기록하지 않는다.
- TypeScript path alias의 기준은 `tsconfig.json`이고 webpack이 이를 읽어 alias를 만든다. alias·entry 변경은 TypeScript 성공만으로 번들 동작이 증명되지 않는다.

## 스케줄러와 비동기 작업

- `scheduler.$start()`는 local 환경에서 job을 등록하지 않으며 현재 `PM2_RELOAD` 설정에 따라 `AppReloadJob`을 매일 등록한다. job 추가 시 안정적인 `getId()`, `src/scheduler/Jobs/index.ts`, 등록부, 환경변수 계약을 함께 갱신한다.
- `JobBase.$$running`은 한 Node 프로세스 안에서만 중복 실행을 막는다. PM2 cluster, 여러 서버·컨테이너에서는 분산 lock이나 원자적 DB claim이 별도로 필요하다.
- schedule callback이 `$$run()` promise를 반환하지 않고 `JobBase`가 오류를 밖으로 전파하지 않으므로 `handler()`는 실제 완료까지 await하고 자체 오류 로그를 남겨야 한다. callback형 `exec`나 반환하지 않은 promise는 실행 보호를 너무 일찍 해제할 수 있다.
- 외부 호출과 DB 변경이 섞이면 `외부 성공 → DB 실패 → 재시도`의 중복 부작용과 idempotency를 검토한다.

## 업로드, 로그, 외부 연결

- 업로드 임시 파일은 controller wrapper의 finish middleware에서 비동기 삭제된다. 오류·권한 거부·프로세스 종료 시 파일이 남을 수 있는 조건과 `@uploads` 운영 정책을 라이브 환경에서 확인한다.
- request data와 오류는 `util.sanitize`를 거쳐 민감 키를 마스킹하고 길이를 제한한다. 새 로그 경로는 header, token, password, DB/command 오류를 원문으로 응답하거나 영구 기록하지 않는지 테스트한다.
- Redis 연결, Slack 시작 알림, S3, IP 조회, mail은 외부 계약이다. mock 단위 테스트나 TypeScript 통과를 실제 네트워크·자격증명 검증으로 보고하지 않는다.

## 배포

- `/deploy/github`는 `x-hub-signature-256`, raw body, `push` event, `DEPLOY_GITHUB_REF`, pull 뒤 commit hash를 검사한 후 Git/install/PM2 명령을 실행할 수 있다. raw body·서명·오류 비노출 테스트를 유지한다.
- controller의 command 실행은 callback 기반이고 성공 응답 뒤 `npm run install:prod && npm run pm2:reload`를 시작할 수 있다. 일반 검증에서 endpoint를 호출하거나 해당 명령을 직접 실행하지 않는다.
- `npm run build:webpack`은 production bundle을 `dist`에 쓴다. `npm run build`는 Watchman, `dist`, test/lint/build를 함께 실행하고, publish 스크립트는 checkout·merge·push·Git index를 바꿀 수 있으므로 명시적 요청 없이 실행하지 않는다.

## 검증 경계

- `npm run verify`는 `npm run tsc && npm run lint && npm test -- --runInBand`이다. TypeScript와 lint의 기본 대상은 `src`, Jest는 `test/`와 `tsconfig.test.json`을 사용한다.
- 현재 단위 테스트는 공통 유틸, 전역 확장, `Controller` 오류 응답, Multer 제한, deploy 서명/오류 경로 등을 다룬다. 실제 route 인증·권한, MySQL transaction, Redis session, HTTP(S), 파일 삭제, scheduler, PM2 reload는 별도 통합·라이브 검증이 필요하다.
- webpack 설정·alias·entry를 바꿨으면 생성물 쓰기가 허용된 경우 `npm run build:webpack`을 추가하고, 소스 검증과 번들 검증을 구분해 기록한다.
