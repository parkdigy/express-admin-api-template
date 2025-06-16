/********************************************************************************************************************
 * 어드민 그룹 Table
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { TableInsertData } from '../@types';
import { makeEnum } from '@db_models_util';

/** 구분 */
const Type = {
  TEST_EXPORT_LIST: 'Test List 액셀 다운로드',
  TEST_INFO: 'Test Info',
  TEST_EMAIL: 'Test Email',
  TEST_TEL: 'Test Tel',
  TEST_MOBILE: 'Test Mobile',
  TEST_BUSINESS_NO: 'Test Company Number',
  TEST_PERSONAL_NO: 'Test Personal Number',
} as const;
export type TAdminPrivacyAccessLog$Type = keyof typeof Type;
export const TAdminPrivacyAccessLog$Type = makeEnum('type', Type);

export interface TAdminPrivacyAccessLog {
  /** Primary Key */
  id: number; // ID // PK, AI, bigint
  /** Others */
  admin_user_id: number; // 어드민 사용자 ID // int
  type: TAdminPrivacyAccessLog$Type; // 로그 타입 // max:50
  reason: string; // 조회 사유 // max:100
  parent_id: number; // 참조 테이블 ID // bigint
  create_date: Date; // 등록일자
}

export type TAdminPrivacyAccessLog$InsertData = TableInsertData<TAdminPrivacyAccessLog, 'id'>;

export default TAdminPrivacyAccessLog;

declare module 'knex/types/tables' {
  interface Tables {
    admin_privacy_access_log: Knex.CompositeTableType<TAdminPrivacyAccessLog, TAdminPrivacyAccessLog$InsertData>;
  }
}
