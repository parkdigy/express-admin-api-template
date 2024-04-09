/********************************************************************************************************************
 * 어드민 그룹 Table
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { TableInsertData, TableUpdateData } from '../@types';

export interface TAdminGroup {
  /** Primary Key */
  id: number; // ID // PK, int
  /** Others */
  name: string; // 그룹명 // max:50
  is_lock: boolean; // 잠금여부 // default:false
  is_privacy_access: boolean; // 개인정보 조회 가능 여부 // default:false
}

export type TAdminGroup$InsertData = TableInsertData<TAdminGroup, 'id', 'is_lock' | 'is_privacy_access'>;
export type TAdminGroup$UpdateData = TableUpdateData<TAdminGroup, 'id'>;

export default TAdminGroup;

declare module 'knex/types/tables' {
  interface Tables {
    admin_group: Knex.CompositeTableType<TAdminGroup, TAdminGroup$InsertData, TAdminGroup$UpdateData>;
  }
}
