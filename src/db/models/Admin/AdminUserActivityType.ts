/********************************************************************************************************************
 * 어드민 사용자 활동 로그 구분 Table
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { TableInsertData, TableUpdateData } from '../@types';

export interface TAdminUserActivityType {
  /** Primary Key */
  id: number; // ID // int
  /** Others */
  name: string; // 이름 // max:50
}

export type TAdminUserActivityType$InsertData = TableInsertData<TAdminUserActivityType>;
export type TAdminUserActivityType$UpdateData = TableUpdateData<TAdminUserActivityType, 'id'>;

export default TAdminUserActivityType;

declare module 'knex/types/tables' {
  interface Tables {
    admin_user_activity_type: Knex.CompositeTableType<
      TAdminUserActivityType,
      TAdminUserActivityType$InsertData,
      TAdminUserActivityType$UpdateData
    >;
  }
}
