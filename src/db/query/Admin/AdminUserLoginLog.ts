/********************************************************************************************************************
 * 어드민 사용자 로그인 로그 Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';

const tableName: Knex.TableNames = 'admin_user_login_log';
type tableName = typeof tableName;

export const AdminUserLoginLogKeywordOption = ['all', 'email', 'ip', 'location'] as const;
export type AdminUserLoginLogKeywordOption = (typeof AdminUserLoginLogKeywordOption)[number];

export default class AdminUserLoginLog extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list(
    req: MyRequest,
    userId: number,
    isSuperAdmin: boolean,
    loginDateFrom: Date,
    loginDateTo: Date,
    keywordOption?: AdminUserLoginLogKeywordOption,
    keyword?: string
  ) {
    const builder = this.getBuilder(req, 'll')
      .select('ll.id', 'll.admin_user_id', 'll.ip_address', 'll.ip_country', 'll.ip_city', 'll.create_date')
      // admin_user
      .join(db.AdminUser.getTableName('au'), 'au.id', 'll.admin_user_id')
      .select('au.email', 'au.name')
      //
      .where('ll.create_date', '>=', util.date.beginTime(loginDateFrom))
      .where('ll.create_date', '<=', util.date.endTime(loginDateTo))
      .orderBy('ll.create_date', 'desc');

    if (!isSuperAdmin) {
      builder.where('au.id', userId);
    }

    if (keyword && keywordOption) {
      builder.where(function () {
        if (['all', 'email'].includes(keywordOption)) {
          this.orWhereIn(
            'll.admin_user_id',
            db.AdminUser.getBuilder(req).select('id').where('email', 'like', `%${keyword}%`)
          );
        }
        if (['all', 'ip'].includes(keywordOption)) {
          this.orWhere('ll.ip_address', keyword);
        }
        if (['all', 'location'].includes(keywordOption)) {
          this.orWhere('ll.ip_country', keyword).orWhere('ip_city', keyword);
        }
      });
    }

    return builder;
  }
}

export { AdminUserLoginLog };
