/********************************************************************************************************************
 * 어드민 메뉴 Table
 * - 아이콘 : https://mui.com/material-ui/material-icons/
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { type TableInsertData, type TableUpdateData } from '../@types';

export interface TAdminMenu {
  /** Primary Key */
  id: string; // ID // max:100
  /** Others */
  name: string; // 메뉴명 // max:50
  depth: number; // 메뉴 깊이 // int
  parent_id: string | null; // 부모 메뉴 ID // max:100
  uri: string | null; // URI // max:100
  is_super_admin_menu: boolean; // Super 어드민만 접근 가능 여부 // default:false
  is_all_user_menu: boolean; // 모든 사용자 접근 가능 여부 // default:false
  icon: string | null; // 아이콘 // max:50
  seq: number; // 노출순서
}

export type TAdminMenu$InsertData = TableInsertData<
  TAdminMenu,
  never,
  'parent_id' | 'uri' | 'is_super_admin_menu' | 'is_all_user_menu' | 'icon'
>;
export type TAdminMenu$UpdateData = TableUpdateData<TAdminMenu>;

export type { TAdminMenu as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_menu: Knex.CompositeTableType<TAdminMenu, TAdminMenu$InsertData, TAdminMenu$UpdateData>;
  }
}
