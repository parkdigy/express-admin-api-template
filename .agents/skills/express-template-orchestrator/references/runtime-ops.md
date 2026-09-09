# 런타임과 운영 경계

## 서버 수명주기

- `src/app.ts`는 가장 먼저 `src/init`을 불러 전역 타입·함수를 등록한다.
- 이후 보안 헤더, body/cookie parser, 선택적 Redis session, 라우트, HTTP(S) 서버를 구성한다.
- 서버 listen 후 scheduler를 시작하고 PM2에 `ready` 신호를 보낸다.
- `APP_ENV=local`에서만 `/test`가 활성화된다.

## 공통 모듈과 전역

- 공통 모듈은 명시적 import/export를 우선하고 관련 `index.ts`를 맞춘다.
- 전역 추가가 꼭 필요하면 `src/init`의 런타임 할당과 `declare global` 타입을 함께 변경한다.
- 프로토타입 확장에는 전체 런타임 회귀 테스트를 추가한다.

## 스케줄러

- `JobBase` 구현은 안정적인 `getId()`를 제공하고 `src/scheduler/Jobs/index.ts`와 등록부를 함께 갱신한다.
- `handler()`는 실제 비동기 완료까지 await해야 한다. 조기 반환은 중복 실행 방지를 일찍 해제한다.
- 외부 호출과 DB 변경이 섞이면 부분 성공 후 재시도의 중복 부작용을 검토한다.

## 배포

- `/deploy/github`는 서명 확인 후 Git, 설치, PM2 명령을 실행할 수 있는 운영 엔드포인트다.
- `npm run build`는 Watchman 상태와 `dist`를 변경한다.
- 배포 브랜치 스크립트는 checkout, merge, push, Git index 변경을 포함하므로 일반 검증에 사용하지 않는다.
