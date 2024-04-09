/********************************************************************************************************************
 * 어드민 그룹 사용자 Table
 * - 어드민 그룹에 속한 사용자를 관리
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { TAdminUser } from './AdminUser';
import TAdminGroup from './AdminGroup';
import { TableInsertData } from '../@types';

export interface TAdminGroupUser {
  /** Primary Keys */
  admin_group_id: TAdminGroup['id']; // 그룹 ID
  admin_user_id: TAdminUser['id']; // 회원 ID
}

export type TAdminGroupUser$InsertData = TableInsertData<TAdminGroupUser>;

export default TAdminGroupUser;

declare module 'knex/types/tables' {
  interface Tables {
    admin_group_user: Knex.CompositeTableType<TAdminGroupUser, TAdminGroupUser$InsertData, never>;
  }
}
