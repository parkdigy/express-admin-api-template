/********************************************************************************************************************
 * MS-SQL Query Class
 * ******************************************************************************************************************/

import { TableRecord } from '@types';
import { DeferredKeySelection, Knex, StrKey, UnwrapArrayMember } from 'knex';
import { MsSqlKnexUtil } from '../../knex';
import ResolveTableType = Knex.ResolveTableType;

export default class MsSqlQuery<
  TTable extends Knex.TableNames,
  TRecord extends {} = Knex.ResolveTableType<Knex.TableType<TTable>>,
  TInsertRecord extends {} = Knex.ResolveTableType<Knex.TableType<TTable>, 'insert'>,
  TUpdateRecord extends {} = Knex.ResolveTableType<Knex.TableType<TTable>, 'update'>,
  TWhereColumnNameValues extends { [key: string]: any } = { [K in keyof TRecord]+?: TRecord[K] | TRecord[K][] },
> {
  util: typeof MsSqlKnexUtil;
  tableName: Knex.TableNames;

  constructor(tableName: Knex.TableNames, util?: typeof MsSqlKnexUtil) {
    this.tableName = tableName;
    this.util = util || MsSqlKnexUtil;
  }

  /********************************************************************************************************************
   * _getBuilder, getBuilderWithNoLock
   * ******************************************************************************************************************/
  _getBuilder<
    Alias extends string | undefined = undefined,
    TRecord2 extends {} = TableRecord<TTable, Alias>,
    TResult2 extends {} = Knex.TableType<TTable>[],
  >(req: MyRequest, alias?: Alias): Knex.QueryBuilder<TRecord2, TResult2> {
    if (req == null) {
      throw new Error('getBuilder() : request 를 지정해야합니다.');
    }

    return this.util.getTable(req, this.tableName, alias, false);
  }

  getBuilderWithNoLock<
    Alias extends string | undefined = undefined,
    TRecord2 extends {} = TableRecord<TTable, Alias>,
    TResult2 extends {} = Knex.TableType<TTable>[],
  >(req: MyRequest, alias?: Alias): Knex.QueryBuilder<TRecord2, TResult2> {
    if (req == null) {
      throw new Error('getBuilder() : request 를 지정해야합니다.');
    }

    return this.util.getTable(req, this.tableName, alias, true);
  }

  /********************************************************************************************************************
   * _getTableName, getTableNameWithNoLock
   * ******************************************************************************************************************/
  _getTableName<TAlias extends Knex.TableNames | string | undefined = TTable>(
    alias?: TAlias
  ): `${TTable} as ${TAlias}` {
    return (alias ? `[${this.tableName}] as [${alias}]` : `[${this.tableName}] as [${this.tableName}]`) as any;
  }

  getTableNameWithNoLock<TAlias extends Knex.TableNames | string | undefined = TTable>(
    alias?: TAlias
  ): `${TTable} as ${TAlias}` {
    return db.raw(
      `${alias ? `[${this.tableName}] as [${alias}]` : `[${this.tableName}] as [${this.tableName}]`} WITH(NOLOCK)`
    ) as any;
  }

  /********************************************************************************************************************
   * applyWhere
   * ******************************************************************************************************************/
  applyWhere(builder: Knex.QueryBuilder, whereColumnValues: TWhereColumnNameValues, negative?: boolean) {
    if (notEmpty(whereColumnValues)) {
      Object.keys(whereColumnValues).forEach((key) => {
        const value = whereColumnValues[key];
        if (value === null) {
          negative ? builder.whereNotNull(key) : builder.whereNull(key);
        } else if (
          typeof value === 'object' &&
          typeof value.toSQL === 'function' &&
          (value.toSQL().method === 'raw' || value.toSQL().method === 'Raw')
        ) {
          builder.whereRaw(db.raw(`${key} ?`, [value]));
        } else if (Array.isArray(value)) {
          negative ? builder.whereNotIn(key, value) : builder.whereIn(key, value);
        } else {
          negative ? builder.where(key, '!=', value as Knex.Value) : builder.where(key, value);
        }
      });
    }
  }

  /********************************************************************************************************************
   * _find, findWithNoLock
   * ******************************************************************************************************************/
  _find<
    SelectColumns extends Extract<keyof TRecord, string>[] | undefined = undefined,
    SelectColumnsKeys extends string | never = SelectColumns extends undefined
      ? never
      : UnwrapArrayMember<SelectColumns>,
    TResult = Knex.QueryBuilder<
      TRecord,
      DeferredKeySelection<
        TRecord,
        SelectColumnsKeys,
        SelectColumns extends undefined ? false : true,
        {},
        false,
        {},
        undefined
      >,
      {}
    >,
  >(req: MyRequest, whereColumnValues: TWhereColumnNameValues, selectColumns?: SelectColumns): TResult {
    const builder = this._getBuilder(req).first();

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);

    if (selectColumns) {
      builder.select(...(selectColumns as any));
    }

    return builder as TResult;
  }

  findWithNoLock<
    SelectColumns extends Extract<keyof TRecord, string>[] | undefined = undefined,
    SelectColumnsKeys extends string | never = SelectColumns extends undefined
      ? never
      : UnwrapArrayMember<SelectColumns>,
    TResult = Knex.QueryBuilder<
      TRecord,
      DeferredKeySelection<
        TRecord,
        SelectColumnsKeys,
        SelectColumns extends undefined ? false : true,
        {},
        false,
        {},
        undefined
      >,
      {}
    >,
  >(req: MyRequest, whereColumnValues: TWhereColumnNameValues, selectColumns?: SelectColumns): TResult {
    const builder = this.getBuilderWithNoLock(req).first();

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);

    if (selectColumns) {
      builder.select(...(selectColumns as any));
    }

    return builder as TResult;
  }

  /********************************************************************************************************************
   * _exists, existsWithNoLock
   * ******************************************************************************************************************/
  async _exists(
    req: MyRequest,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ): Promise<boolean> {
    const builder = this._getBuilder(req).select(this.util.raw('1')).limit(1).first();

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);
    if (negativeWhereColumnValues) this.applyWhere(builder, negativeWhereColumnValues, true);

    return (await builder) != null;
  }

  async existsWithNoLock(
    req: MyRequest,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ): Promise<boolean> {
    const builder = this.getBuilderWithNoLock(req).select(this.util.raw('1')).limit(1).first();

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);
    if (negativeWhereColumnValues) this.applyWhere(builder, negativeWhereColumnValues, true);

    return (await builder) != null;
  }

  /********************************************************************************************************************
   * _notExists, notExistsWithNoLock
   * ******************************************************************************************************************/
  async _notExists(
    req: MyRequest,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ): Promise<boolean> {
    return !(await this._exists(req, whereColumnValues, negativeWhereColumnValues));
  }

  async notExistsWithNoLock(
    req: MyRequest,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ): Promise<boolean> {
    return !(await this.existsWithNoLock(req, whereColumnValues, negativeWhereColumnValues));
  }

  /********************************************************************************************************************
   * add
   * ******************************************************************************************************************/
  add<TKey extends StrKey<ResolveTableType<TRecord>>, Returning extends TKey | TKey[]>(
    req: MyRequest,
    data: TInsertRecord | readonly TInsertRecord[],
    returning?: Returning
  ) {
    if (Array.isArray(returning)) {
      return this._getBuilder(req).insert(data as any, returning);
    } else if (returning) {
      return this._getBuilder(req).insert(data as any, returning);
    } else {
      return this._getBuilder(req).insert(data as any);
    }
  }

  /********************************************************************************************************************
   * addWithCreateDate
   * ******************************************************************************************************************/
  addWithCreateDate<TKey extends StrKey<ResolveTableType<TRecord>>, Returning extends TKey | TKey[]>(
    req: MyRequest,
    data: Omit<TInsertRecord, 'create_date'> | readonly Omit<TInsertRecord, 'create_date'>[],
    returning?: Returning
  ) {
    const finalData = Array.isArray(data)
      ? data.map((d) => ({ ...d, create_date: now() }))
      : { ...data, create_date: now() };
    if (Array.isArray(returning)) {
      return this._getBuilder(req).insert(finalData as any, returning);
    } else if (returning) {
      return this._getBuilder(req).insert(finalData as any, returning);
    } else {
      return this._getBuilder(req).insert(finalData as any);
    }
  }

  /********************************************************************************************************************
   * addWithCreateUpdateDate
   * ******************************************************************************************************************/
  addWithCreateUpdateDate<TKey extends StrKey<ResolveTableType<TRecord>>, Returning extends TKey | TKey[]>(
    req: MyRequest,
    data:
      | Omit<TInsertRecord, 'create_date' | 'update_date'>
      | readonly Omit<TInsertRecord, 'create_date' | 'update_date'>[],
    returning?: Returning
  ) {
    const finalData = Array.isArray(data)
      ? data.map((d) => ({ ...d, create_date: now(), update_date: now() }))
      : { ...data, create_date: now() };
    if (Array.isArray(returning)) {
      return this._getBuilder(req).insert(finalData as any, returning);
    } else if (returning) {
      return this._getBuilder(req).insert(finalData as any, returning);
    } else {
      return this._getBuilder(req).insert(finalData as any);
    }
  }

  /********************************************************************************************************************
   * edit
   * ******************************************************************************************************************/
  edit(
    req: MyRequest,
    data: TUpdateRecord,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ) {
    if (empty(data)) return null;
    if (empty(whereColumnValues) && empty(negativeWhereColumnValues)) return null;

    const builder = this._getBuilder(req).update(data as any);

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);
    if (negativeWhereColumnValues) this.applyWhere(builder, negativeWhereColumnValues, true);

    return builder;
  }

  /********************************************************************************************************************
   * edit
   * ******************************************************************************************************************/
  editWithUpdateDate(
    req: MyRequest,
    data: Omit<TUpdateRecord, 'update_date'>,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ) {
    if (empty(data)) return null;
    if (empty(whereColumnValues) && empty(negativeWhereColumnValues)) return null;

    const builder = this._getBuilder(req).update({ ...data, update_date: now() } as any);

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);
    if (negativeWhereColumnValues) this.applyWhere(builder, negativeWhereColumnValues, true);

    return builder;
  }

  /********************************************************************************************************************
   * remove
   * ******************************************************************************************************************/
  remove(
    req: MyRequest,
    whereColumnValues: TWhereColumnNameValues,
    negativeWhereColumnValues?: TWhereColumnNameValues
  ) {
    if (empty(whereColumnValues) && empty(negativeWhereColumnValues)) return null;

    const builder = this._getBuilder(req).delete();

    if (whereColumnValues) this.applyWhere(builder, whereColumnValues);
    if (negativeWhereColumnValues) this.applyWhere(builder, negativeWhereColumnValues, true);

    return builder;
  }
}
