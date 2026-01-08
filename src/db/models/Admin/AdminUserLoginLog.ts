/********************************************************************************************************************
 * 어드민 사용자 로그인 로그 Table
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { type TableInsertData } from '../@types';
import type TAdminUser from './AdminUser';

export interface TAdminUserLoginLog {
  /** Primary Key */
  id: number; // ID // AI, int
  /** Others */
  admin_user_id: TAdminUser['id']; // 회원 ID
  ip_address: string; // IP 주소 // max:20
  ip_country: string; // IP 국가 // max:50
  ip_city: string; // IP 도시 // max:50
  create_date: Date; // 등록일자
}

export type TAdminUserLoginLog$InsertData = TableInsertData<TAdminUserLoginLog, 'id'>;

export type { TAdminUserLoginLog as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_user_login_log: Knex.CompositeTableType<TAdminUserLoginLog, TAdminUserLoginLog$InsertData, never>;
  }
}
