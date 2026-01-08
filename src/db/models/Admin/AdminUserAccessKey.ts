/********************************************************************************************************************
 * 어드민 사용자 접근 KEY Table
 * - 화면, Export 접근 KEY 를 관리
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { type TableInsertData, type TableUpdateData } from '../@types';
import type { AdminUserAccessKeyType } from '@const';

export interface TAdminUserAccessKey {
  /** Primary Key */
  id: string; // ID // max:200
  /** Others */
  type: AdminUserAccessKeyType; // 구분
  title: string; // 이름 : max:100
}

export type TAdminUserAccessKey$InsertData = TableInsertData<TAdminUserAccessKey>;
export type TAdminUserAccessKey$UpdateData = TableUpdateData<TAdminUserAccessKey, 'id'>;

export type { TAdminUserAccessKey as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_user_access_key: Knex.CompositeTableType<
      TAdminUserAccessKey,
      TAdminUserAccessKey$InsertData,
      TAdminUserAccessKey$UpdateData
    >;
  }
}
