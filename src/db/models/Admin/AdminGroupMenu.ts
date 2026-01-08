/********************************************************************************************************************
 * 어드민 그룹 메뉴 Table
 * - 어드민 그룹에 속한 메뉴를 관리
 *********************************************************************************************************************/

import { Knex } from 'knex';
import { type TAdminGroup } from './AdminGroup';
import type TAdminMenu from './AdminMenu';
import { type TableInsertData, type TableUpdateData } from '../@types';

export interface TAdminGroupMenu {
  /** Primary Keys */
  admin_group_id: TAdminGroup['id']; // 그룹 ID
  admin_menu_id: TAdminMenu['id']; // 메뉴 ID
  /** Others */
  read: boolean; // 읽기 권한 여부 // default :false
  write: boolean; // 쓰기 권한 여부 // default :false
  export: boolean; // 다운로드 권한 여부 // default :false
}

export type TAdminGroupMenu$InsertData = TableInsertData<TAdminGroupMenu, never, 'read' | 'write' | 'export'>;
export type TAdminGroupMenu$UpdateData = TableUpdateData<TAdminGroupMenu, 'admin_group_id' | 'admin_menu_id'>;

export type { TAdminGroupMenu as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_group_menu: Knex.CompositeTableType<TAdminGroupMenu, TAdminGroupMenu$InsertData, TAdminGroupMenu$UpdateData>;
  }
}
