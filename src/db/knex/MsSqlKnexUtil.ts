import { Knex } from 'knex';
import { type TableRecord } from '@types';
import knex from './knex';

export default {
  /********************************************************************************************************************
   * getTable
   * ******************************************************************************************************************/
  getTable<
    TTable extends Knex.TableNames,
    Alias extends string | undefined = undefined,
    TRecord extends {} = TableRecord<TTable, Alias>,
    TResult extends {} = Knex.TableType<TTable>,
  >(req: MyRequest, tableName: TTable, alias?: Alias, withNoLock?: boolean): Knex.QueryBuilder<TRecord, TResult> {
    if (req == null) {
      throw new Error('db.getQuery() 호출 시, request 를 반드시 지정해야 합니다.');
    }

    const finalTableName = alias ? `[${tableName}] as [${alias}]` : `[${tableName}]`;

    const builder = knex<TRecord, TResult>(withNoLock ? db.raw(`${finalTableName} WITH(NOLOCK)`) : finalTableName);

    const trx = this.trans.getTrx(req);
    if (trx) {
      builder.transacting(trx);
    }

    return builder;
  },

  /********************************************************************************************************************
   * raw
   * ******************************************************************************************************************/
  raw<TResult = any>(sql: string, ...bindings: readonly Knex.RawBinding[]): Knex.Raw<TResult> {
    return knex.raw<TResult>(sql, ...bindings);
  },

  /********************************************************************************************************************
   * trans
   * ******************************************************************************************************************/
  trans: {
    /** begin */
    async begin(request: MyRequest): Promise<void> {
      if (request == null) {
        throw new Error('db.trans.begin() : request 를 지정해야 합니다.');
      }
      request.$$dbTransMsSql = request.$$dbTransMsSql || [];
      request.$$dbTransMsSql.push(await knex.transaction());
    },
    /** commit */
    async commit(request: MyRequest): Promise<void> {
      if (request == null) {
        throw new Error('db.trans.commit() : request 를 지정해야 합니다.');
      }
      if (request.$$dbTransMsSql != null && request.$$dbTransMsSql.length > 0) {
        const trx = request.$$dbTransMsSql.pop();
        if (trx) {
          if (!trx.isCompleted()) {
            await trx.commit();
          }
        }
      }
    },
    /** commitAll */
    async commitAll(request: MyRequest): Promise<void> {
      if (request == null) {
        throw new Error('db.trans.commitAll() : request 를 지정해야 합니다.');
      }
      while (request.$$dbTransMsSql && request.$$dbTransMsSql.length > 0) {
        const trx = request.$$dbTransMsSql.pop();
        if (trx) {
          if (!trx.isCompleted()) {
            await trx.commit();
          }
        }
      }
    },
    /** rollback */
    async rollback(request: MyRequest): Promise<void> {
      if (request == null) {
        throw new Error('db.trans.rollback() : request 를 지정해야 합니다.');
      }
      if (request.$$dbTransMsSql != null && request.$$dbTransMsSql.length > 0) {
        const trx = request.$$dbTransMsSql.pop();
        if (trx) {
          if (!trx.isCompleted()) {
            await trx.rollback();
          }
        }
      }
    },
    /** rollbackAll */
    async rollbackAll(request: MyRequest): Promise<void> {
      if (request == null) {
        throw new Error('db.trans.rollbackAll() : request 를 지정해야 합니다.');
      }
      while (request.$$dbTransMsSql && request.$$dbTransMsSql.length > 0) {
        const trx = request.$$dbTransMsSql.pop();
        if (trx) {
          if (!trx.isCompleted()) {
            await trx.rollback();
          }
        }
      }
    },
    /** getTrx */
    getTrx(request: MyRequest): Knex.Transaction | undefined {
      if (request == null) {
        throw new Error('db.trans.getTrx() : request 를 지정해야 합니다.');
      }
      if (request.$$dbTransMsSql && request.$$dbTransMsSql.length > 0) {
        return request.$$dbTransMsSql[request.$$dbTransMsSql.length - 1];
      }
    },
  },
};
