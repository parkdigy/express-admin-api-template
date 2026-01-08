/********************************************************************************************************************
 * 어드민 그룹 Table
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { type TableInsertData } from '../@types';
import type { AdminPrivacyAccessLogType } from '@const';

export interface TAdminPrivacyAccessLog {
  /** Primary Key */
  id: number; // ID // PK, AI, bigint
  /** Others */
  admin_user_id: number; // 어드민 사용자 ID // int
  type: AdminPrivacyAccessLogType; // 로그 타입 // max:50
  reason: string; // 조회 사유 // max:100
  parent_id: number; // 참조 테이블 ID // bigint
  create_date: Date; // 등록일자
}

export type TAdminPrivacyAccessLog$InsertData = TableInsertData<TAdminPrivacyAccessLog, 'id'>;

export type { TAdminPrivacyAccessLog as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_privacy_access_log: Knex.CompositeTableType<TAdminPrivacyAccessLog, TAdminPrivacyAccessLog$InsertData>;
  }
}
