---
name: express-template-orchestrator
description: Express 관리자 API 템플릿에서 route, 인증·권한, controller, DB·seed 계약을 함께 변경하거나 transaction, 업로드, scheduler, 서버·배포 위험을 분석하고 검증할 때 사용한다.
---

# Express Template 오케스트레이터

## 언제 사용하는가

- route, controller, DB, 관리자 메뉴·접근 키 중 둘 이상의 계약이 함께 바뀌는 작업
- JWT 인증, 메뉴 role, 비밀번호 재확인, 개인정보 조회 로그 또는 export 권한을 추가·변경하는 작업
- 요청 transaction, Multer 업로드, 전역 초기화, scheduler, 서버 수명주기 또는 배포 경계를 검토하는 작업
- 단일 파일의 기계적 수정이나 기존 계약을 그대로 따르는 작은 테스트 보강에는 사용하지 않는다.

## 필요한 입력

- 목표와 클라이언트에서 관찰 가능한 완료 기준
- URI·method·입력·응답, 상위/route 인증, 메뉴 role, 비밀번호 재확인 여부
- 읽고 쓰는 DB 테이블, 실제 스키마·seed 적용 방법, 외부 서비스와 파일 부작용
- 실행 가능한 검증 범위와 실제 DB·Redis·HTTP·PM2 작업의 허용 범위

정보가 빠졌다면 현재 route와 가장 가까운 controller/query/test에서 가장 좁은 계약을 찾는다. 실제 스키마나 외부 시스템 상태처럼 저장소만으로 확정할 수 없는 항목은 추측하지 않고 미검증 경계로 남긴다.

## 순차 절차

1. `git status --short`로 사용자 변경을 확인한다. 요청과 인접한 `src/routes/index.ts`, 세부 route, wrapper, controller, query/model, seed SQL, 테스트만 단계적으로 읽는다.
2. 현재 계약을 `method + URI`, 입력 출처, 상위/내부 인증, role, 비밀번호 재확인, 성공·오류 응답, DB·파일·외부 부작용으로 정리한다.
3. 변경이 필요하면 DB model/Knex `Tables` → query → `db` 인스턴스와 barrel export → controller → route 순으로 맞춘다. 관리자 화면이면 `menu.ts`/`admin_menu`, 접근 기록이면 `admin_user_access_key`, 개인정보면 type과 로그 저장 계약까지 확인한다.
4. 모든 builder가 같은 `req`를 받는지, 필요한 `db.trans.begin(req)`이 있는지, 명시적 commit 뒤 실패할 작업이 남지 않는지, controller 반환 전에 모든 비동기 작업이 `await`되는지 검토한다.
5. 인증 없음/로그인/JWT, Read·Write·Export·Super role, 5초 1회성 API 호출 권한을 구분한다. wrapper 밖의 checker는 `Starter`와 transaction보다 먼저 실행된다는 점을 반영한다.
6. 정상, 파라미터 오류, 인증·권한 실패, DB 실패를 확인한다. 업로드는 거부·오류 시 임시 파일 정리, 외부 호출은 `외부 성공 → DB 실패 → 재시도`, scheduler는 다중 프로세스 중복 조건을 별도로 검토한다.
7. 가장 가까운 Jest 테스트를 먼저 실행하고 `npm run verify`로 마무리한다. 번들 계약을 바꿨고 생성물 쓰기가 허용된 경우에만 `npm run build:webpack`을 추가한다.
8. 변경 계약, 실행한 검증, 실제 DB·Redis·HTTP(S)·파일시스템·scheduler·PM2·외부 서비스에서 확인하지 못한 영역을 분리해 보고한다.

이 저장소의 교차 계층 작업은 결합도가 높으므로 한 소유자가 단계별 산출물을 이어받는 Pipeline을 기본으로 한다. 읽기 전용 탐색이나 독립 리뷰만 병렬화하고, 같은 파일을 여러 작업자가 수정하거나 DB·포트·업로드 경로를 공유하는 테스트는 병렬 실행하지 않는다.

## 참조 선택

- route·인증·권한·controller·DB·관리자 seed·업로드 작업에는 [API와 DB 계약](references/api-db.md)을 읽는다.
- 앱 초기화·환경변수·Redis session·scheduler·HTTP(S)·로깅·배포 작업에는 [런타임과 운영 경계](references/runtime-ops.md)를 읽는다.
- 두 영역이 모두 관련된 경우에만 두 문서를 모두 읽는다.

## 산출물

- 구현: 동기화된 소스·SQL·테스트와 검증 결과, 남은 라이브 확인 항목
- 분석: 원인, 근거 경로, 영향 범위, 재현·확인 조건
- 중단: 필요한 권한·스키마·외부 계약과 안전하게 진행할 수 없는 이유
