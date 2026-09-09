# API와 DB 계약

## 요청 흐름

- `src/routes`는 URI, HTTP method, 인증·업로드 미들웨어를 정하고 `Controller(...)`로 controller를 연결한다.
- `Controller`는 `Starter → controller → transaction commit/rollback → Finisher`를 관리한다.
- 입력은 기존 `src/common/param` 프리셋을 우선 사용한다.
- controller 추가 시 해당 폴더와 상위 `index.ts` export를 함께 갱신한다.

## DB 확장

1. `src/db/models/<Domain>/<Domain>.ts`에 레코드와 insert/update 타입, Knex `Tables` 선언을 정의한다.
2. model과 query의 `index.ts` export를 연결한다.
3. `MySqlQuery` 또는 `MsSqlQuery` 기반 쿼리 클래스를 구현한다.
4. `src/db/db.ts`에 공개 인스턴스를 연결한다.

모든 builder에 같은 `req`를 전달해야 활성 transaction을 공유한다. 실패는 상위 `Controller`까지 throw한다. `edit`와 `remove`의 빈 where 방어를 raw 쿼리로 우회하지 않는다.

## 완료 확인

- URI·method와 인증 미들웨어가 요구사항과 일치하는가?
- 모델, 쿼리, `db` 인스턴스, export가 동기화됐는가?
- 성공, 입력 오류, 인증 실패, DB 실패 경로를 확인했는가?
- 외부 호출 성공 후 DB 실패와 재시도 부작용을 검토했는가?
