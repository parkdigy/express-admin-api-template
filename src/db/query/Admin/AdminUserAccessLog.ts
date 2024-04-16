/********************************************************************************************************************
 * 어드민 사용자 사용 로그 Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { TAdminUserAccessKey } from '@db_models';

const tableName: Knex.TableNames = 'admin_user_access_log';
type tableName = typeof tableName;

export const AdminUserAccessLogKeywordOption = ['user_id', 'email'] as const;
export type AdminUserAccessLogKeywordOption = (typeof AdminUserAccessLogKeywordOption)[number];

export default class AdminUserAccessLog extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list(
    req: MyRequest,
    searchDateFrom: Date,
    searchDateTo: Date,
    keywordOption?: AdminUserAccessLogKeywordOption,
    keyword?: string,
    type?: TAdminUserAccessKey['type']
  ) {
    const builder = this.getBuilder(req, 'al')
      .select('al.id', 'al.admin_user_id', 'al.admin_user_access_key_id', 'al.url', 'al.create_date')
      // admin_user
      .join(db.AdminUser.getTableName('au'), 'au.id', 'al.admin_user_id')
      .select('au.email')
      // admin_user_access_key
      .join(db.AdminUserAccessKey.getTableName('ak'), 'ak.id', 'al.admin_user_access_key_id')
      .select('ak.type', 'ak.title')
      //
      .where('al.create_date', '>=', util.date.beginTime(searchDateFrom))
      .where('al.create_date', '<=', util.date.endTime(searchDateTo))
      .orderBy('al.create_date', 'desc');

    if (keyword != null) {
      switch (keywordOption) {
        case 'user_id':
          builder.where('au.id', keyword);
          break;
        case 'email':
          builder.whereIn(
            'al.admin_user_id',
            db.AdminUser.getBuilder(req).select('id').where('email', 'like', `%${keyword}%`)
          );
          break;
      }
    }
    if (type != null) {
      builder.where('ak.type', type);
    }

    return builder;
  }
}

export { AdminUserAccessLog };
