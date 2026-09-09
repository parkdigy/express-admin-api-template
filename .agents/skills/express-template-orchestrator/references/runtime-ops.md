# 런타임과 운영 경계

## 서버 수명주기

- `src/app.ts`는 가장 먼저 `src/init`을 불러 전역 타입·함수를 등록한다.
- 이후 보안 헤더, body/cookie parser, 선택적 Redis session, 라우트, HTTP(S) 서버를 구성한다.
- 서버 listen 후 scheduler를 시작하고 `process.send`가 있으면 PM2에 `ready` 신호를 보낸다. HTTPS 모드는 보안 서버와 HTTP→HTTPS redirect 서버를 함께 연다.
- `SIGINT`에서는 열려 있는 HTTP(S) 서버가 모두 닫힌 뒤 프로세스를 종료한다. 서버 배열, keep-alive 종료 처리, hot-reload 경계를 바꿀 때 두 모드를 모두 검토한다.
- 현재 라우트 등록부는 `/deploy`, `/ping`, `/auth`뿐이다. 문서나 과거 템플릿의 라우트를 현재 기능으로 간주하지 않는다.

## 공통 모듈과 전역

- 공통 모듈은 명시적 import/export를 우선하고 관련 `index.ts`를 맞춘다.
- 전역 추가가 꼭 필요하면 `src/init`의 런타임 할당과 `declare global` 타입을 함께 변경한다.
- 프로토타입 확장에는 전체 런타임 회귀 테스트를 추가한다.
- TypeScript path alias는 `tsconfig.json`이 원본이고 webpack이 이를 읽어 alias를 만든다. alias·진입점 변경은 TypeScript 통과만으로 충분하지 않다.

## 스케줄러

- `JobBase` 구현은 안정적인 `getId()`를 제공하고 `src/scheduler/Jobs/index.ts`와 등록부를 함께 갱신한다.
- scheduler는 local 환경에서 job을 등록하지 않으며, `JobBase.$$running`은 한 Node 프로세스 안에서만 중복 실행을 막는다. PM2 다중 프로세스·다중 서버의 동시 실행에는 분산 lock이나 원자적 DB claim이 별도로 필요하다.
- `schedule` callback은 `$$run()` promise를 반환하지 않고 `JobBase`도 오류를 삼킨다. `handler()`는 자체적으로 오류를 기록하고 실제 비동기 완료까지 await해야 한다. callback형 `exec`나 반환하지 않은 promise는 중복 방지를 너무 일찍 해제할 수 있다.
- 외부 호출과 DB 변경이 섞이면 부분 성공 후 재시도의 중복 부작용을 검토한다.

## 배포

- `/deploy/github`는 GitHub 서명과 ref 확인 후 Git, 설치, PM2 명령을 실행할 수 있는 운영 엔드포인트다. 정적 분석 외 실제 호출은 배포 작업으로 취급한다.
- `npm run build:webpack`은 production 번들을 `dist`에 쓰고, `npm run build`는 그 전에 Watchman 상태와 `dist`를 변경한다.
- 배포 브랜치 스크립트는 checkout, merge, push, Git index 변경을 포함하므로 일반 검증에 사용하지 않는다.

## 검증 경계

- `npm run verify`는 `npm run tsc && npm run lint && npm test -- --runInBand`이다.
- `tsc`와 lint의 기본 대상은 `src`; Jest 테스트는 `test/`에 있고 `tsconfig.test.json`을 사용한다.
- 현재 테스트는 주로 `common`과 `init` 단위 동작을 다룬다. 실제 HTTP route, MySQL transaction, Redis session, scheduler, PM2 reload는 별도 통합·라이브 검증 없이는 확인됐다고 보고하지 않는다.
- webpack 설정·path alias·entry 변경은 생성물 쓰기가 허용된 경우 `npm run build:webpack`으로 확인하고, 소스 검증과 번들 검증을 구분해 기록한다.
