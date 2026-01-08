/********************************************************************************************************************
 * 어드민 사용자 활동 로그 Table
 * - 사용자가 어떤 활동을 했는지 기록
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { type TableInsertData, type TableUpdateData } from '../@types';
import type TAdminUserActivityType from './AdminUserActivityType';
import type TAdminUser from './AdminUser';

export interface TAdminUserActivity {
  /** Primary Key */
  id: number; // ID // AI, bigint
  /** Others */
  admin_user_activity_type_id: TAdminUserActivityType['id']; // 활동 로그 구분 ID
  parent_id: string | null; // 부모 ID // max:50
  admin_user_id: TAdminUser['id']; // 회원 ID
  activity_text_1: string | null; // 활동 내용 1 // text
  activity_text_2: string | null; // 활동 내용 2 // text
  memo: string | null; // 메모 // text
  create_date: Date; // 등록일자
  update_date: Date; // 수정일자
}

export type TAdminUserActivity$InsertData = TableInsertData<
  TAdminUserActivity,
  'id',
  'parent_id' | 'activity_text_1' | 'activity_text_2' | 'memo'
>;
export type TAdminUserActivity$UpdateData = TableUpdateData<TAdminUserActivity, 'id' | 'create_date', 'update_date'>;

export type { TAdminUserActivity as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_user_activity: Knex.CompositeTableType<
      TAdminUserActivity,
      TAdminUserActivity$InsertData,
      TAdminUserActivity$UpdateData
    >;
  }
}
