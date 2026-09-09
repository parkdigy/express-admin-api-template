# 저장소 에이전트 안내

## 핵심 구조

- Node.js 24, Express 5, TypeScript, Knex 기반 API 서버다. 진입점은 `src/app.ts`이며 `routes → controllers → db/query` 순서로 요청을 처리한다.
- `src/app.ts`의 첫 `import './init'`은 전역 타입·함수(`db`, `env`, `param`, `util`, `ll` 등)를 등록하므로 순서를 보존한다.
- 라우트는 `Controller(...)` 래퍼를 사용한다. DB 쿼리에는 같은 `MyRequest`를 전달하고, 실패는 throw하여 요청 단위 트랜잭션이 rollback되게 한다.
- DB 변경 시 `src/db/models`, `src/db/query`, `src/db/db.ts`와 관련 `index.ts` export를 함께 맞춘다. 환경변수 이름은 `.env.example`에도 반영한다.
- `dist`, `@dev`, `@logs`는 직접 편집하지 않는다.

## 검증과 안전

- 기본 검증: `npm run verify`
- 별칭·번들·진입점 변경: 추가로 `npm run build:webpack`
- `npm run build`는 `dist`와 Watchman 상태를 변경한다. `make:publish:*`, `publish:*`, `reset:gitignore`, PM2 명령은 명시적 요청 없이 실행하지 않는다.

두 계층 이상을 함께 바꾸거나 트랜잭션·스케줄러를 다룰 때는 `.agents/skills/express-template-orchestrator/SKILL.md`를 사용한다.
