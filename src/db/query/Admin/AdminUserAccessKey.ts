/********************************************************************************************************************
 * 어드민 사용자 접근 KEY Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { AdminUserAccessKeyType } from '@const';

const tableName: Knex.TableNames = 'admin_user_access_key';
type tableName = typeof tableName;

export default class AdminUserAccessKey extends MySqlQuery<tableName> {
  Type = AdminUserAccessKeyType;

  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 등록/수정
   ********************************************************************************************************************/
  async addEdit(req: MyRequest, id: string, type: AdminUserAccessKeyType, title: string) {
    if (await this.exists(req, { id })) {
      return this.edit(req, { type, title }, { id });
    } else {
      return this.add(req, { id, type, title });
    }
  }
}

export { AdminUserAccessKey };
