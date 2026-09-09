# API와 DB 계약

## 요청 흐름

- `src/routes`는 URI, HTTP method, 인증·업로드 미들웨어를 정하고 controller를 연결한다. 새 경로는 `src/routes/index.ts`, 새 controller는 폴더와 상위 `index.ts` export까지 확인한다.
- JSON API는 `ApiController(...)` 계열을 사용한다. 이 래퍼는 선택적 `Logger → Starter → controller → commitAll/rollbackAll → Finisher`와 `api.error` 응답을 관리한다.
- 웹훅처럼 자체 응답 형식이 필요한 기존 흐름은 `Controller(...)` 계열을 따른다. 이 래퍼의 오류 응답은 일반 문자열이므로 JSON API에 무심코 사용하지 않는다.
- 인증 checker가 wrapper 바깥에 있으면 `Starter`와 요청 트랜잭션보다 먼저 실행된다. 인증 실패 응답 뒤 controller가 호출되지 않는지, 인증 조회에 transaction을 기대하지 않는지 확인한다.
- `param(req, ...)` 입력은 `req.params`, `req.query`, `req.body` 순서로 합쳐져 뒤 값이 앞 값을 덮어쓴다. 기존 `src/common/param` preset을 우선 사용한다.
- controller 내부 오류는 throw한다. 특히 `ApiController` 안에서 `api.error(res, error)`만 호출하면 controller는 정상 종료로 간주되어 열린 transaction이 commit될 수 있다.
- controller 추가 시 해당 폴더와 상위 `index.ts` export를 함께 갱신한다.

## DB 확장

1. `src/db/models/<Domain>/<Domain>.ts`에 레코드와 insert/update 타입, Knex `Tables` 선언을 정의한다.
2. model과 query의 `index.ts` export를 연결한다.
3. `MySqlQuery` 또는 실제 연결에 맞는 query base로 쿼리 클래스를 구현한다.
4. `src/db/db.ts`에 공개 인스턴스를 연결한다.

현재 `src/db/db.ts`와 `src/db/knex/knex.ts`는 MySQL 경로를 사용한다. `MsSqlKnexUtil`과 `knex.mssql.template.ts`의 존재만으로 MSSQL 지원이 활성화됐다고 간주하지 않는다.

모든 builder에 같은 `req`를 전달해야 활성 transaction을 공유한다. wrapper는 남은 transaction을 commit/rollback하지만 transaction 자체를 시작하지 않는다. 원자성이 필요한 쓰기는 명시적으로 `db.trans.begin(req)`하고 모든 쿼리를 await한다. fire-and-forget promise가 controller 반환 후 완료된 transaction을 다시 사용하지 않게 한다.

`edit`, `editWithUpdateDate`, `remove`는 where가 비어 있으면 `null`을 반환해 전체 변경을 막는다. raw builder로 이 방어를 우회하지 않는다. 이 저장소에는 migration이 없으므로 model/Knex 타입 수정과 실제 DB 스키마 적용을 별도 계약으로 다룬다.

## 완료 확인

- URI·method와 인증 미들웨어가 요구사항과 일치하는가?
- 성공과 오류가 기존 `api.success`/`ApiError` 응답 구조를 유지하는가?
- 모델, 쿼리, `db` 인스턴스, export가 동기화됐는가?
- transaction begin 이후 모든 DB·비동기 작업을 반환 전에 await하는가?
- 성공, 입력 오류, 인증 실패, DB 실패 경로를 확인했는가?
- 외부 호출 성공 후 DB 실패와 재시도 부작용을 검토했는가?
- 실제 스키마와 라이브 DB 검증 여부를 정적 타입 검증과 구분했는가?
