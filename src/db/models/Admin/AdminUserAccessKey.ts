/********************************************************************************************************************
 * 어드민 사용자 접근 KEY Table
 * - 화면, Export 접근 KEY 를 관리
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { makeEnum } from '../@util';
import { TableInsertData, TableUpdateData } from '../@types';

/** 구분 */
const Type = { VIEW: '화면', EXPORT: 'Export' } as const;
export type TAdminUserAccessKey$Type = keyof typeof Type;
export const TAdminUserAccessKey$Type = makeEnum('type', Type);

export interface TAdminUserAccessKey {
  /** Primary Key */
  id: string; // ID // max:200
  /** Others */
  type: TAdminUserAccessKey$Type; // 구분
  title: string; // 이름 : max:100
}

export type TAdminUserAccessKey$InsertData = TableInsertData<TAdminUserAccessKey>;
export type TAdminUserAccessKey$UpdateData = TableUpdateData<TAdminUserAccessKey, 'id'>;

export default TAdminUserAccessKey;

declare module 'knex/types/tables' {
  interface Tables {
    admin_user_access_key: Knex.CompositeTableType<
      TAdminUserAccessKey,
      TAdminUserAccessKey$InsertData,
      TAdminUserAccessKey$UpdateData
    >;
  }
}
