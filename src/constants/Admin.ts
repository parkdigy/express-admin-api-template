/********************************************************************************************************************
 * 개인정보 조회 구분
 * ******************************************************************************************************************/

export const AdminPrivacyAccessLogType = makeConst('type', [
  ['TEST_EXPORT_LIST', 'Test List 액셀 다운로드'],
  ['TEST_INFO', 'Test Info'],
  ['TEST_EMAIL', 'Test Email'],
  ['TEST_TEL', 'Test Tel'],
  ['TEST_MOBILE', 'Test Mobile'],
  ['TEST_BUSINESS_NO', 'Test Company Number'],
  ['TEST_PERSONAL_NO', 'Test Personal Number'],
]);

export type AdminPrivacyAccessLogType = MakeConst<typeof AdminPrivacyAccessLogType>;

/********************************************************************************************************************
 * 관리자 접근 KEY 구분
 * ******************************************************************************************************************/

export const AdminUserAccessKeyType = makeConst('type', [
  ['VIEW', '화면'],
  ['EXPORT', 'Export'],
]);

export type AdminUserAccessKeyType = MakeConst<typeof AdminUserAccessKeyType>;
