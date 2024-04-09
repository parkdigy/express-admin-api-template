/********************************************************************************************************************
 * 회원 Query Class
 * ******************************************************************************************************************/

import { MyRequest } from '@types';
import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { TUser$Status } from '@db_models';

const tableName: Knex.TableNames = 'user';
type tableName = typeof tableName;

export default class User extends MySqlQuery<tableName> {
  Status = TUser$Status;

  constructor() {
    super(tableName);
  }

  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  list(req: MyRequest) {
    return this.getBuilder(req).select('id', 'email', 'create_date');
  }

  /********************************************************************************************************************
   * 로그인을 위한 정보
   * ******************************************************************************************************************/
  infoForSignIn(req: MyRequest, email: string) {
    return this.getBuilder(req).select('id', 'password', 'email').where('email', email).first();
  }

  /********************************************************************************************************************
   * 로그인 정보
   * ******************************************************************************************************************/
  infoForSession(req: MyRequest, id: number) {
    return this.getBuilder(req).select('id', 'email').where('id', id).first();
  }
}
