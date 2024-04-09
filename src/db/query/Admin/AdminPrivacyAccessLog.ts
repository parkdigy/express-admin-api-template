/********************************************************************************************************************
 * 어드민 사용자 접근 KEY Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { TAdminPrivacyAccessLog$Type } from '@db';
import { MyRequest } from '@types';

const tableName: Knex.TableNames = 'admin_privacy_access_log';
type tableName = typeof tableName;

export default class AdminPrivacyAccessLog extends MySqlQuery<tableName> {
  Type = TAdminPrivacyAccessLog$Type;

  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  list(
    req: MyRequest,
    options: {
      search_date_from: Date;
      search_date_to: Date;
      type?: TAdminPrivacyAccessLog$Type;
      admin_user_id?: number;
    }
  ) {
    const builder = this.getBuilder(req, 'apal')
      .select('apal.id', 'apal.admin_user_id', 'apal.type', 'apal.reason', 'apal.parent_id', 'apal.create_date')
      .join(db.AdminUser.getTableName('au'), 'au.id', 'apal.admin_user_id')
      .select('au.name as admin_user_name')
      .where('apal.create_date', '>=', options.search_date_from)
      .where('apal.create_date', '<=', options.search_date_to)
      .orderBy('apal.create_date', 'desc');

    if (options.type) {
      builder.where('apal.type', options.type);
    }
    if (options.admin_user_id) {
      builder.where('apal.admin_user_id', options.admin_user_id);
    }

    return builder;
  }
}

export { AdminPrivacyAccessLog };
