/********************************************************************************************************************
 * 어드민 그룹 사용자 Query Class
 ********************************************************************************************************************/

import { MyRequest } from '@types';
import { MySqlQuery } from '../@common';
import { Knex } from 'knex';

const tableName: Knex.TableNames = 'admin_group_user';
type tableName = typeof tableName;

export default class AdminGroupUser extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  listOfGroup(req: MyRequest, adminGroupId: number) {
    return this.getBuilder(req).where('admin_group_id', adminGroupId).select('admin_user_id');
  }

  /********************************************************************************************************************
   * 사용자 등록
   ********************************************************************************************************************/
  async addUsers(req: MyRequest, adminGroupId: number, adminUserIds: number[]) {
    for (const adminUserId of adminUserIds) {
      await this.removeUser(req, adminUserId);
      await this.add(req, { admin_group_id: adminGroupId, admin_user_id: adminUserId });
    }
  }

  /********************************************************************************************************************
   * 그룹 ID 수정
   ********************************************************************************************************************/
  editAdminGroupId(req: MyRequest, adminUserId: number, adminGroupId: number) {
    return this.getBuilder(req).where('admin_user_id', adminUserId).update({
      admin_group_id: adminGroupId,
    });
  }

  /********************************************************************************************************************
   * 사용자 삭제
   ********************************************************************************************************************/
  removeUser(req: MyRequest, adminUserId: number) {
    return this.getBuilder(req).where('admin_user_id', adminUserId).del();
  }

  /********************************************************************************************************************
   * 그룹의 모든 사용자 삭제
   ********************************************************************************************************************/
  removeAllUserOfGroup(req: MyRequest, adminGroupId: number) {
    return this.getBuilder(req).where('admin_group_id', adminGroupId).del();
  }
}

export { AdminGroupUser };
