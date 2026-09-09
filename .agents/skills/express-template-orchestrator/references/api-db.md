# API와 DB 계약

## 요청과 wrapper 흐름

- `src/routes/index.ts`는 `/deploy`, `/ping`, `/auth`를 공개 진입점으로 등록하고 `/export`, `/admin`, `/privacy_access`, `/my`, `/test`에는 상위 `ApiJwtCookieAuthChecker`를 적용한다. 세부 route의 checker가 중복돼 보여도 먼저 상위 계약과 호출 순서를 확인한 뒤 정리한다.
- `ApiController(controller, callPermissionCheck, logging, loggingData, ...)`는 선택적 `ApiCallPermissionChecker → Logger → Starter → controller → commitAll/rollbackAll → Finisher`를 구성하고 표준 `api.error` 응답을 만든다.
- `ApiControllerReadRole`과 `ApiControllerExportRole`은 menu role을 검사한 뒤 `ApiController`를 실행한다. `ApiControllerWriteRole`은 Write role과 함께 `callPermissionCheck=true`를 넘겨 `/my/permission`의 비밀번호 재확인 세션을 한 번 소비한다.
- `ApiSuperAdminChecker`, `ApiMenuRoleChecker`, 상위 JWT checker는 wrapper 밖에서 실행되므로 `Starter`와 요청 transaction보다 앞선다. 인증·권한 DB 조회에 controller transaction을 기대하지 않는다.
- `/deploy/github`는 raw request body로 GitHub SHA-256 서명을 검증하고 자체 결과 코드를 보내므로 `Controller(...)` 흐름을 유지한다. 일반 JSON API를 이 패턴으로 옮기지 않는다.
- controller 내부 오류는 `ApiError`를 throw한다. `ApiController` 안에서 `api.error(res, error)`만 호출하면 정상 반환으로 처리되어 열린 transaction이 commit될 수 있다. `Controller`는 내부 오류를 기록하되 `{ result: { c: -1, m } }` 형태의 고정 500 응답만 노출한다.

## 입력, 응답, export

- `param(req, ...)`는 `req.params`, `req.query`, `req.body` 순서로 병합해 뒤의 값이 앞의 값을 덮어쓴다. 기존 `src/common/param` preset을 우선하고 같은 이름을 여러 위치에 두지 않는다.
- 일반 성공 응답은 `api.success`/`api.successMsg`, 실패는 `ApiError`의 HTTP status와 `result.c` 계약을 따른다. 새 코드는 내부 오류·비밀값을 응답이나 로그로 직접 노출하지 않는다.
- export controller는 `excel.export`로 파일 응답을 만들지만 인증과 Export role, 검색 파라미터, 조회 query는 화면 목록 계약과 함께 유지한다.

## 관리자 메뉴와 감사 계약

- 메뉴 ID의 코드 기준은 `src/common/menu/menu.ts`, 기본 스키마·seed 기준은 `database/admin.sql`의 `admin_menu`다. 새 관리자 화면은 ID, parent, URI, super/all-user 속성을 양쪽에서 맞춘다.
- 화면 조회와 export 접근 기록 키는 `admin_user_access_key` seed가 허용 목록 역할을 한다. 소비 측이 보내는 ID와 일치하지 않으면 `AdminUserAccessLog.add`가 `NOTFOUND`로 처리하므로 route/UI 계약 변경 시 함께 검토한다.
- 개인정보 값 반환은 `PrivacyAccess`의 사용자 권한, `AdminPrivacyAccessLogType`, 대상 조회, 사유와 감사 로그 저장을 하나의 계약으로 취급한다. 목록·export에서는 비-super 사용자의 자기 로그 제한을 보존한다.

## DB 확장과 transaction

1. `src/db/models/<Domain>`에 record/insert/update 타입과 Knex `Tables` 선언을 정의하고 `index.ts`를 연결한다.
2. 실제 연결에 맞는 `MySqlQuery` 기반 query를 구현하고 query barrel과 `src/db/db.ts` 공개 인스턴스를 연결한다.
3. 기본 설치 데이터나 관리자 계약이 바뀌면 `database/admin.sql`을 갱신한다. 이 저장소에는 migration runner가 없으므로 운영 DB 반영 절차는 별도로 확인한다.

모든 builder에 같은 `req`를 전달해야 활성 transaction을 공유한다. wrapper는 남은 transaction을 commit/rollback하지만 시작하지 않는다. 원자성이 필요한 쓰기는 `db.trans.begin(req)`을 명시하고 모든 쿼리를 await한다. 수동 `commit(req)` 뒤의 쿼리·파일·외부 작업은 이후 오류가 나도 되돌릴 수 없으므로 commit 위치를 의도적으로 정한다.

`edit`, `editWithUpdateDate`, `remove`는 변경 data나 where 조건이 비어 있으면 `null`을 반환해 무조건 변경을 막는다. raw builder로 이 방어를 우회하지 않는다.

## 업로드 계약

- 새 업로드는 기존 `ApiMulterController*`/`MulterController` 조합을 사용하고 `MulterOptions`의 MIME+확장자 허용 목록, 파일 수·크기·field/part 제한을 유지한다.
- `MulterOriginalNameChanger`는 업로드 뒤 파일명을 UTF-8로 복원하고 `MulterRemover`는 finish 단계에서 임시 파일을 삭제한다. 인증·권한 실패, controller throw, 정상 완료 각각에서 파일 잔존 여부를 확인한다.

## 완료 확인

- URI·method, 상위/내부 JWT 인증, role, 비밀번호 재확인과 logging 옵션이 요구사항과 일치하는가?
- 성공·오류·redirect·paging·파일 응답이 기존 계약을 유지하는가?
- model, query, `db`, barrel export, `menu.ts`, `database/admin.sql`의 관련 seed가 동기화됐는가?
- transaction 시작부터 controller 반환까지 모든 DB·비동기 작업을 await하고, 수동 commit 경계를 검토했는가?
- 정상, 입력 오류, 인증 실패, role 실패, DB 실패, 업로드 거부·정리 경로를 확인했는가?
- 실제 스키마·Redis session·HTTP route 검증 여부를 정적 타입/단위 테스트와 구분했는가?
