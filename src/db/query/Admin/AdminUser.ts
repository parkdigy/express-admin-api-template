/********************************************************************************************************************
 * 어드민 사용자 Query Class
 ********************************************************************************************************************/

import { MyRequest } from '@types';
import { MySqlQuery } from '../@common';
import { Knex } from 'knex';

const tableName: Knex.TableNames = 'admin_user';
type tableName = typeof tableName;

export const AdminUserListKeywordOption = ['id', 'email', 'name'] as const;
export type AdminUserListKeywordOption = (typeof AdminUserListKeywordOption)[number];

export default class AdminUser extends MySqlQuery<tableName> {
  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list(
    req: MyRequest,
    options: {
      keyword_option?: AdminUserListKeywordOption;
      keyword?: string;
      is_lock?: boolean;
      admin_group_id?: number;
    }
  ) {
    const builder = this.getBuilder(req, 'au')
      .select(
        'au.id',
        'au.email',
        'au.name',
        'au.tel',
        'au.is_lock',
        'au.login_fail_count',
        'au.must_password_change',
        'au.create_date'
      )
      // admin_group_user
      .leftJoin(db.AdminGroupUser.getTableName('agu'), 'agu.admin_user_id', 'au.id')
      .select('agu.admin_group_id')
      // admin_group
      .leftJoin(db.AdminGroup.getTableName('ag'), 'ag.id', 'agu.admin_group_id')
      .select('ag.name as group_name')
      //
      .where('au.id', '>', 100)
      .orderBy('au.is_lock')
      .orderBy('au.id', 'desc');

    if (options.is_lock != null) {
      builder.where('au.is_lock', options.is_lock);
    }
    if (options.admin_group_id) {
      builder.where('agu.admin_group_id', options.admin_group_id);
    }
    if (options.keyword) {
      switch (options.keyword_option) {
        case 'id':
          builder.where('au.id', options.keyword);
          break;
        case 'email':
          builder.where('au.email', 'like', `%${options.keyword}%`);
          break;
        case 'name':
          builder.where('au.name', 'like', `%${options.keyword}%`);
          break;
      }
    }

    return builder;
  }

  /********************************************************************************************************************
   * 전체 목록
   ********************************************************************************************************************/
  allList(req: MyRequest, isLock?: boolean) {
    const builder = this.getBuilder(req, 'au')
      .select('au.id', 'au.name', 'au.email')
      // admin_group_user
      .leftJoin(db.AdminGroupUser.getTableName('agu'), 'agu.admin_user_id', 'au.id')
      .select('agu.admin_group_id')
      // admin_group
      .leftJoin(db.AdminGroup.getTableName('ag'), 'ag.id', 'agu.admin_group_id')
      .select('ag.name as group_name')
      //
      .where('au.id', '>', 100)
      .orderBy('au.email');

    if (isLock != null) {
      builder.where('au.is_lock', isLock);
    }

    return builder;
  }

  /********************************************************************************************************************
   * 정보
   ********************************************************************************************************************/
  info(req: MyRequest, id: number) {
    return (
      this.getBuilder(req, 'au')
        .select('au.id', 'au.email', 'au.name', 'au.tel', 'au.must_password_change')
        // admin_group_user
        .leftJoin(db.AdminGroupUser.getTableName('agu'), 'agu.admin_user_id', 'au.id')
        .select('agu.admin_group_id')
        //
        .where('id', id)
        .first()
    );
  }

  /********************************************************************************************************************
   * 로그인 처리를 위한 정보
   ********************************************************************************************************************/
  infoForSignIn(req: MyRequest, email: string) {
    return this.getBuilder(req)
      .where('email', email)
      .select('id', 'email', 'password', 'is_lock', 'login_fail_count', 'must_password_change')
      .first();
  }

  /********************************************************************************************************************
   * 로그인 정보
   ********************************************************************************************************************/
  infoForSession(req: MyRequest, id: number) {
    return (
      this.getBuilder(req, 'au')
        .select('au.id', 'au.email', 'au.must_password_change')
        // admin_group_user
        .leftJoin(db.AdminGroupUser.getTableName('agu'), 'agu.admin_user_id', 'au.id')
        .select(
          db.raw<{ admin_group_id: number; is_super_admin: boolean }>(`
            case
              when agu.admin_group_id is null then 0
              else agu.admin_group_id
            end as admin_group_id,
            agu.admin_group_id = 1 as is_super_admin
          `)
        )
        // admin_group
        .leftJoin(db.AdminGroup.getTableName('ag'), 'ag.id', 'agu.admin_group_id')
        .select(
          db.raw<{ is_privacy_access: boolean }>(`
            case
              when agu.admin_group_id = 1 then true
              else ag.is_privacy_access
            end as is_privacy_access
          `)
        )
        //
        .where('au.id', id)
        .first()
    );
  }

  /********************************************************************************************************************
   * 비밀번호 변경
   ********************************************************************************************************************/
  passwordChange(req: MyRequest, id: number, password: string, mustPasswordChange: boolean) {
    return this.getBuilder(req).where('id', id).update({
      password,
      must_password_change: mustPasswordChange,
      update_date: now(),
    });
  }

  /********************************************************************************************************************
   * 사용 잠금
   ********************************************************************************************************************/
  lock(req: MyRequest, id: number) {
    return this.getBuilder(req).where('id', id).update({
      is_lock: true,
      update_date: now(),
    });
  }

  /********************************************************************************************************************
   * 사용 잠금 해제
   ********************************************************************************************************************/
  unlock(req: MyRequest, id: number) {
    return this.getBuilder(req).where('id', id).update({
      is_lock: false,
      login_fail_count: 0,
      update_date: now(),
    });
  }
}

export { AdminUser };
