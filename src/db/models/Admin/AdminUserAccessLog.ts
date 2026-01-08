/********************************************************************************************************************
 * 어드민 사용자 사용 로그 Table
 * - 사용자가 어떤 화면 및 Export 에 접근했는지 기록
 ********************************************************************************************************************/

import { Knex } from 'knex';
import type TAdminUser from './AdminUser';
import type TAdminUserAccessKey from './AdminUserAccessKey';
import { type TableInsertData } from '../@types';

export interface TAdminUserAccessLog {
  /** Primary Key */
  id: number; // ID // AI, bigint
  /** Others */
  admin_user_id: TAdminUser['id']; // 회원 ID
  admin_user_access_key_id: TAdminUserAccessKey['id']; // 접근 KEY ID // max:200
  url: string; // 접근 URL // max:255
  create_date: Date; // 등록일자
}

export type TAdminUserAccessLog$InsertData = TableInsertData<TAdminUserAccessLog, 'id'>;

export type { TAdminUserAccessLog as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_user_access_log: Knex.CompositeTableType<TAdminUserAccessLog, TAdminUserAccessLog$InsertData, never>;
  }
}
