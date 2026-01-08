/********************************************************************************************************************
 * 회원 Query Class
 * ******************************************************************************************************************/

import { MySqlQuery } from '../@common';
import { Knex } from 'knex';
import { TestDataStatus } from '@const';

const tableName: Knex.TableNames = 'test_data';
type tableName = typeof tableName;

export default class User extends MySqlQuery<tableName> {
  Status = TestDataStatus;

  constructor() {
    super(tableName);
  }

  list(req: MyRequest, options: { keyword?: string; status?: TestDataStatus }) {
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
