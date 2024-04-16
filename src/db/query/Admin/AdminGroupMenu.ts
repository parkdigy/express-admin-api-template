/********************************************************************************************************************
 * 어드민 그룹 메뉴 Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';

const tableName: Knex.TableNames = 'admin_group_menu';
type tableName = typeof tableName;

interface MenuItem {
  [key: string]: { new: boolean };
}
type Menus = { [key: string]: MenuItem };

export default class AdminGroupMenu extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 등록/수정
   ********************************************************************************************************************/
  async addOrEditMenus(req: MyRequest, adminGroupId: number, menus: Menus) {
    for (const adminMenuId of Object.keys(menus)) {
      const menuRoles = menus[adminMenuId];

      for (const role of Object.keys(menuRoles)) {
        const newValue = menuRoles[role].new;

        const rwe: Dict<boolean> = {};
        rwe[role] = newValue;

        if (await this.exists(req, { admin_group_id: adminGroupId, admin_menu_id: adminMenuId })) {
          await this.edit(req, rwe, { admin_group_id: adminGroupId, admin_menu_id: adminMenuId });
        } else {
          await this.add(req, {
            admin_group_id: adminGroupId,
            admin_menu_id: adminMenuId,
            ...rwe,
          });
        }
      }
    }
  }
}

export { AdminGroupMenu };
