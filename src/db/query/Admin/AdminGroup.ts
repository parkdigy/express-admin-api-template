/********************************************************************************************************************
 * 어드민 그룹 Query Class
 ********************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';

const tableName: Knex.TableNames = 'admin_group';
type tableName = typeof tableName;

export default class AdminGroup extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list(req: MyRequest, isLock?: boolean, userCount = false) {
    const builder = this.getBuilder(req, 'ag').select('ag.*').orderBy('ag.is_lock').orderBy('ag.id');

    if (isLock) {
      builder.where('ag.is_lock', isLock);
    }

    if (userCount) {
      builder.select(
        db.AdminGroupUser.getBuilder(req).where('admin_group_id', db.raw('ag.id')).count().as('user_count')
      );
    }

    return builder;
  }
}

export { AdminGroup };
