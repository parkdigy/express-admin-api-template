/********************************************************************************************************************
 * 어드민 메뉴 Query Class
 ********************************************************************************************************************/

import { MyRequest, TableRecord } from '@types';
import { MySqlQuery } from '../@common';
import { Knex } from 'knex';

const tableName: Knex.TableNames = 'admin_menu';
type tableName = typeof tableName;

export type AdminMenuItem = TableRecord<'admin_menu'> &
  Pick<TableRecord<'admin_group_menu'>, 'read' | 'write' | 'export'> & {
    items?: AdminMenuItem[];
  };

/** 메뉴 목록을 메뉴 트리로 만들기 */
function makeMenus(list: AdminMenuItem[]) {
  const menus: AdminMenuItem[] = [];
  list.forEach((item) => {
    item.items = [];
    if (item.depth === 1) {
      menus.push(item);
    } else {
      menus.find((menu) => {
        if (menu.id === item.parent_id) {
          menu.items?.push(item);
          return true;
        }
      });
    }
  });
  return menus.filter((info) => !(empty(info.uri) && info.items?.length === 0));
}

export default class AdminMenu extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list(req: MyRequest) {
    return this.getBuilder(req)
      .select('id', 'name', 'depth', 'parent_id', 'uri', 'is_super_admin_menu', 'is_all_user_menu', 'icon')
      .orderBy('depth')
      .orderBy('seq');
  }

  /********************************************************************************************************************
   * 정보
   ********************************************************************************************************************/
  info(req: MyRequest, id: string) {
    return this.find(req, { id }).select(
      'id',
      'name',
      'depth',
      'parent_id',
      'uri',
      'is_super_admin_menu',
      'is_all_user_menu',
      'icon'
    );
  }

  /********************************************************************************************************************
   * 로그인 관리자 메뉴 목록
   ********************************************************************************************************************/
  async listOfSession(req: MyRequest, isSuperAdmin: boolean, adminGroupId: number) {
    const builder = this.getBuilder(req, 'am').select('am.*').orderBy('am.depth').orderBy('am.seq');

    if (!isSuperAdmin) {
      builder.where('am.is_super_admin_menu', false);
    }

    if (isSuperAdmin) {
      builder.select(db.raw('1 as `read`, 1 as `write`, 1 as `export`'));
    } else {
      builder
        .leftJoin(db.AdminGroupMenu.getTableName('agm'), function () {
          this.on('agm.admin_menu_id', 'am.id')
            .andOn('agm.admin_group_id', db.raw(`${adminGroupId}`))
            .andOn('agm.read', db.raw('1'));
        })
        .select('agm.read', 'agm.write', 'agm.export');
    }

    const list = ((await builder) as AdminMenuItem[]).filter(
      (info) => (info.depth === 1 && empty(info.uri)) || info.is_all_user_menu || info.read
    );

    return makeMenus(
      list.map((info) => ({
        ...info,
        read: Boolean(info.read),
        write: Boolean(info.write),
        export: Boolean(info.export),
      }))
    );
  }

  /********************************************************************************************************************
   * 그룹 수정용 목록
   ********************************************************************************************************************/
  async listForGroupEdit(req: MyRequest, adminGroupId?: number) {
    const builder = this.getBuilder(req, 'am')
      .select('am.*')
      .where('am.is_super_admin_menu', false)
      .where('am.is_all_user_menu', false)
      .orderBy('am.depth')
      .orderBy('am.seq');

    if (adminGroupId != null) {
      builder
        .leftJoin(db.AdminGroupMenu.getTableName('agm'), function () {
          this.on('agm.admin_menu_id', 'am.id').andOnVal('agm.admin_group_id', adminGroupId);
        })
        .select('agm.read', 'agm.write', 'agm.export');
    }

    return makeMenus((await builder) as AdminMenuItem[]);
  }

  /********************************************************************************************************************
   * 다음 seq 얻기
   ********************************************************************************************************************/
  async getNextSeq(req: MyRequest, parentId?: string) {
    if (parentId) {
      const info = await this.getBuilder(req)
        .select(db.raw<{ max_seq: number | null }>('max(seq) as max_seq'))
        .where('parent_id', parentId)
        .first();
      return (info?.max_seq || 0) + 10;
    } else {
      const info = await this.getBuilder(req)
        .select(db.raw<{ max_seq: number | null }>('max(seq) as max_seq'))
        .where('depth', 1)
        .first();
      return (info?.max_seq || 0) + 10;
    }
  }
}

export { AdminMenu };
