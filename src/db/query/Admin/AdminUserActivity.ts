/********************************************************************************************************************
 * 어드민 사용자 활동 로그 Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { TAdminUser, TAdminUserActivity } from '@db_models';

const tableName: Knex.TableNames = 'admin_user_activity';
type tableName = typeof tableName;

export default class AdminUserActivity extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list<
    TResult = TAdminUserActivity &
      Pick<TAdminUser, 'email' | 'name'> & {
        parent_name: string;
      },
  >(req: MyRequest, userActivityTypeId: number, parentId: number): Knex.QueryBuilder<any, TResult[]> {
    const builder = this.getBuilder(req, 'aua')
      .select(
        'aua.id',
        'aua.admin_user_activity_type_id',
        'aua.parent_id',
        'aua.admin_user_id',
        'aua.activity_text_1',
        'aua.activity_text_2',
        'aua.memo',
        'aua.create_date',
        'aua.update_date'
      )
      // admin_user
      .join(db.AdminUser.getTableName('au'), 'au.id', 'aua.admin_user_id')
      .select('au.email', 'au.name')
      //
      .where('aua.admin_user_activity_type_id', userActivityTypeId)
      .orderBy('aua.id', 'desc');

    if (parentId) {
      builder.where('aua.parent_id', parentId);
    }

    switch (userActivityTypeId) {
      case 100:
        return builder
          .join(db.AdminGroup.getTableName('parent'), 'parent.id', 'aua.parent_id')
          .select('parent.name as parent_name');
      case 101:
        return builder
          .join(db.AdminUser.getTableName('parent'), 'parent.id', 'aua.parent_id')
          .select('parent.name as parent_name');
      default:
        return builder.select(db.raw(`'' as parent_name`));
    }
  }
}

export { AdminUserActivity };
