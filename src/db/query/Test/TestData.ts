/********************************************************************************************************************
 * 회원 Query Class
 * ******************************************************************************************************************/

import { MyRequest } from '@types';
import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { TTestData$Status } from '@db_models';

const tableName: Knex.TableNames = 'test_data';
type tableName = typeof tableName;

export default class User extends MySqlQuery<tableName> {
  Status = TTestData$Status;

  constructor() {
    super(tableName);
  }

  list(req: MyRequest, options: { keyword?: string; status?: TTestData$Status }) {
    const builder = this.getBuilder(req).select('*').orderBy('id', 'desc');

    if (options.keyword) {
      builder.where(function (q) {
        q.orWhere('text', 'like', `%${options.keyword}%`).orWhere('email', 'like', `%${options.keyword}%`);
      });
    }
    if (options.status) {
      builder.where('status', options.status);
    }

    return builder;
  }

  info(req: MyRequest, id: number) {
    return this.getBuilder(req).select('*').where('id', id).first();
  }
}
