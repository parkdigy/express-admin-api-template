declare module 'knex' {
  import tarn from 'tarn';
  import events from 'events';
  import stream from 'stream';

  import * as ResultTypes from 'knex/types/result';

  import { Tables } from 'knex/types/tables';

  import { ConnectionOptions } from 'tls';
  import { Stream } from 'stream';

  export interface Knex<TRecord extends {} = any, TResult = any[]>
    extends Knex.QueryInterface<TRecord, TResult>,
      events.EventEmitter {
    /******************************************************************************************************************/
    <TTable extends Knex.TableNames = any, TAlias extends string = any>(
      tableNameWithAlias: `${TTable} ${Lowercase<'as'>} ${TAlias}`,
      options?: TableOptions
    ): Knex.QueryBuilder<
      Knex.AliasTableType<TTable, TAlias>,
      DeferredKeySelection<Knex.ResolveTableType<Knex.TableType<TTable>>, never>[]
    >;
    /******************************************************************************************************************/

    <TTable extends Knex.TableNames>(
      tableName: TTable,
      options?: TableOptions
    ): Knex.QueryBuilder<
      Knex.AliasTableType<TTable>,
      DeferredKeySelection<Knex.ResolveTableType<Knex.TableType<TTable>>, never>[]
    >;

    <TRecord2 extends {} = TRecord, TResult2 = DeferredKeySelection<TRecord2, never>[]>(
      tableNameUnknown: Knex.TableDescriptor | Knex.AliasDict,
      options?: TableOptions
    ): Knex.QueryBuilder<TRecord2, TResult2>;

    VERSION: string;
    __knex__: string;

    raw: Knex.RawBuilder<TRecord>;

    transactionProvider(config?: Knex.TransactionConfig): Knex.TransactionProvider;
    transaction(config?: Knex.TransactionConfig): Promise<Knex.Transaction>;
    transaction(transactionScope?: null, config?: Knex.TransactionConfig): Promise<Knex.Transaction>;
    transaction<T>(
      transactionScope: (trx: Knex.Transaction) => Promise<T> | void,
      config?: Knex.TransactionConfig
    ): Promise<T>;
    initialize(config?: Knex.Config): void;
    destroy(callback: Function): void;
    destroy(): Promise<void>;

    batchInsert<TRecord2 extends {} = TRecord, TResult2 = number[]>(
      tableName: Knex.TableDescriptor,
      data: TRecord2 extends Knex.CompositeTableType<unknown>
        ? ReadonlyArray<Knex.ResolveTableType<TRecord2, 'insert'>>
        : ReadonlyArray<Knex.DbRecordArr<TRecord2>>,
      chunkSize?: number
    ): Knex.BatchInsertBuilder<TRecord2, TResult2>;

    schema: Knex.SchemaBuilder;
    queryBuilder<TRecord2 extends {} = TRecord, TResult2 = TResult>(): Knex.QueryBuilder<TRecord2, TResult2>;

    client: any;
    migrate: Knex.Migrator;
    seed: Knex.Seeder;
    fn: Knex.FunctionHelper;
    ref: Knex.RefBuilder;
    userParams: Record<string, any>;
    withUserParams(params: Record<string, any>): Knex;
    isTransaction?: boolean;
  }

  export function knex<TRecord extends {} = any, TResult = unknown[]>(
    config: Knex.Config | string
  ): Knex<TRecord, TResult>;

  export namespace knex {
    class QueryBuilder {
      static extend(
        methodName: string,
        fn: <TRecord extends {} = any, TResult extends {} = unknown[]>(
          this: Knex.QueryBuilder<TRecord, TResult>,
          ...args: any[]
        ) =>
          | Knex.QueryBuilder<TRecord, TResult>
          | Promise<Knex.QueryBuilder<TRecord | TResult> | DeferredKeySelection.Resolve<TResult>>
      ): void;
    }

    class TableBuilder {
      static extend<T = Knex.TableBuilder, B = Knex.TableBuilder>(
        methodName: string,
        fn: (this: T, ...args: any[]) => B
      ): void;
    }
    class ViewBuilder {
      static extend<T = Knex.ViewBuilder, B = Knex.ViewBuilder>(
        methodName: string,
        fn: (this: T, ...args: any[]) => B
      ): void;
    }
    class SchemaBuilder {
      static extend<T = Knex.SchemaBuilder, B = Knex.SchemaBuilder>(
        methodName: string,
        fn: (this: T, ...args: any[]) => B
      ): void;
    }
    class ColumnBuilder {
      static extend<T = Knex.ColumnBuilder, B = Knex.ColumnBuilder>(
        methodName: string,
        fn: (this: T, ...args: any[]) => B
      ): void;
    }

    export class KnexTimeoutError extends Error {}

    export const Client: typeof Knex.Client;
  }

  export namespace Knex {
    //
    // Utility Types
    //

    type Value =
      | string
      | number
      | boolean
      | null
      | Date
      | Array<string>
      | Array<number>
      | Array<Date>
      | Array<boolean>
      | Buffer
      | object
      | Knex.Raw;

    interface ValueDict extends Dict<Value | Knex.QueryBuilder> {}
    interface AliasDict extends Dict<string> {}

    type ColumnDescriptor<TRecord extends {}, TResult> =
      | string
      | Knex.Raw
      | Knex.QueryBuilder<TRecord, TResult>
      | Dict<string>;

    type InferrableColumnDescriptor<TRecord extends {}> = keyof TRecord | Knex.Ref<any, any> | Dict<keyof TRecord>;

    type TableDescriptor = string | Knex.Raw | Knex.QueryBuilder;

    type Lookup<TRegistry extends {}, TKey extends string, TDefault = never> = TKey extends keyof TRegistry
      ? TRegistry[TKey]
      : TDefault;

    type MaybeRawColumn<TColumn> = TColumn | Raw<TColumn>;

    type MaybeRawRecord<TRecord> = {
      [K in keyof TRecord]: MaybeRawColumn<TRecord[K]>;
    };

    type DbColumn<TColumn> = Readonly<MaybeRawColumn<TColumn>>;

    type DbRecord<TRecord> = Readonly<SafePartial<MaybeRawRecord<TRecord>>>;

    type DbRecordArr<TRecord> = Readonly<MaybeArray<DbRecord<TRecord>>>;

    export type CompositeTableType<TBase, TInsert = TBase, TUpdate = Partial<TInsert>, TUpsert = Partial<TInsert>> = {
      base: TBase;
      insert: TInsert;
      update: TUpdate;
      upsert: TUpsert;
    };

    type TableNames = keyof Tables;

    type TableInterfaceScope = keyof CompositeTableType<unknown>;

    type TableType<TTable extends keyof Tables> = Tables[TTable];

    type ResolveTableType<TCompositeTableType, TScope extends TableInterfaceScope = 'base'> =
      TCompositeTableType extends CompositeTableType<{}> ? TCompositeTableType[TScope] : TCompositeTableType;

    interface OnConflictQueryBuilder<TRecord extends {}, TResult> {
      ignore(): QueryBuilder<TRecord, TResult>;
      merge(mergeColumns?: (keyof TRecord)[]): QueryBuilder<TRecord, TResult>;
      merge(data?: Extract<DbRecord<ResolveTableType<TRecord, 'update'>>, object>): QueryBuilder<TRecord, TResult>;
    }

    //
    // QueryInterface
    //
    type ClearStatements =
      | 'with'
      | 'select'
      | 'columns'
      | 'hintComments'
      | 'where'
      | 'union'
      | 'using'
      | 'join'
      | 'group'
      | 'order'
      | 'having'
      | 'limit'
      | 'offset'
      | 'counter'
      | 'counters';

    interface QueryInterface<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      select: Select<TRecord, TResult, TAliasRecord>;
      as: As<TRecord, TResult, TAliasRecord>;
      columns: Select<TRecord, TResult, TAliasRecord>;
      column: Select<TRecord, TResult, TAliasRecord>;
      hintComment: HintComment<TRecord, TResult, TAliasRecord>;
      from: Table<TRecord, TResult, TAliasRecord>;
      fromRaw: Table<TRecord, TResult, TAliasRecord>;
      into: Table<TRecord, TResult, TAliasRecord>;
      table: Table<TRecord, TResult, TAliasRecord>;
      distinct: Distinct<TRecord, TResult, TAliasRecord>;
      distinctOn: DistinctOn<TRecord, TResult, TAliasRecord>;

      // Joins
      join: Join<TRecord, TResult, TAliasRecord>;
      joinRaw: JoinRaw<TRecord, TResult, TAliasRecord>;
      innerJoin: Join<TRecord, TResult, TAliasRecord>;
      leftJoin: Join<TRecord, TResult, TAliasRecord>;
      leftOuterJoin: Join<TRecord, TResult, TAliasRecord>;
      rightJoin: Join<TRecord, TResult, TAliasRecord>;
      rightOuterJoin: Join<TRecord, TResult, TAliasRecord>;
      outerJoin: Join<TRecord, TResult, TAliasRecord>;
      fullOuterJoin: Join<TRecord, TResult, TAliasRecord>;
      crossJoin: Join<TRecord, TResult, TAliasRecord>;

      // Json manipulation
      jsonExtract: JsonExtract<TRecord, TResult, TAliasRecord>;
      jsonSet: JsonSet<TRecord, TResult, TAliasRecord>;
      jsonInsert: JsonInsert<TRecord, TResult, TAliasRecord>;
      jsonRemove: JsonRemove<TRecord, TResult, TAliasRecord>;

      // Using
      using: Using<TRecord, TResult, TAliasRecord>;

      // Withs
      with: With<TRecord, TResult, TAliasRecord>;
      withMaterialized: With<TRecord, TResult, TAliasRecord>;
      withNotMaterialized: With<TRecord, TResult, TAliasRecord>;
      withRecursive: With<TRecord, TResult, TAliasRecord>;
      withRaw: WithRaw<TRecord, TResult, TAliasRecord>;
      withSchema: WithSchema<TRecord, TResult, TAliasRecord>;
      withWrapped: WithWrapped<TRecord, TResult, TAliasRecord>;

      // Wheres
      where: Where<TRecord, TResult, TAliasRecord>;
      andWhere: Where<TRecord, TResult, TAliasRecord>;
      orWhere: Where<TRecord, TResult, TAliasRecord>;
      whereNot: Where<TRecord, TResult, TAliasRecord>;
      andWhereNot: Where<TRecord, TResult, TAliasRecord>;
      orWhereNot: Where<TRecord, TResult, TAliasRecord>;
      whereRaw: WhereRaw<TRecord, TResult, TAliasRecord>;
      orWhereRaw: WhereRaw<TRecord, TResult, TAliasRecord>;
      andWhereRaw: WhereRaw<TRecord, TResult, TAliasRecord>;
      whereWrapped: WhereWrapped<TRecord, TResult, TAliasRecord>;
      havingWrapped: WhereWrapped<TRecord, TResult, TAliasRecord>;
      whereExists: WhereExists<TRecord, TResult, TAliasRecord>;
      orWhereExists: WhereExists<TRecord, TResult, TAliasRecord>;
      whereNotExists: WhereExists<TRecord, TResult, TAliasRecord>;
      orWhereNotExists: WhereExists<TRecord, TResult, TAliasRecord>;
      whereIn: WhereIn<TRecord, TResult, TAliasRecord>;
      orWhereIn: WhereIn<TRecord, TResult, TAliasRecord>;
      whereNotIn: WhereIn<TRecord, TResult, TAliasRecord>;
      orWhereNotIn: WhereIn<TRecord, TResult, TAliasRecord>;
      whereLike: Where<TRecord, TResult, TAliasRecord>;
      andWhereLike: Where<TRecord, TResult, TAliasRecord>;
      orWhereLike: Where<TRecord, TResult, TAliasRecord>;
      whereILike: Where<TRecord, TResult, TAliasRecord>;
      andWhereILike: Where<TRecord, TResult, TAliasRecord>;
      orWhereILike: Where<TRecord, TResult, TAliasRecord>;
      whereNull: WhereNull<TRecord, TResult, TAliasRecord>;
      orWhereNull: WhereNull<TRecord, TResult, TAliasRecord>;
      whereNotNull: WhereNull<TRecord, TResult, TAliasRecord>;
      orWhereNotNull: WhereNull<TRecord, TResult, TAliasRecord>;
      whereBetween: WhereBetween<TRecord, TResult, TAliasRecord>;
      orWhereBetween: WhereBetween<TRecord, TResult, TAliasRecord>;
      andWhereBetween: WhereBetween<TRecord, TResult, TAliasRecord>;
      whereNotBetween: WhereBetween<TRecord, TResult, TAliasRecord>;
      orWhereNotBetween: WhereBetween<TRecord, TResult, TAliasRecord>;
      andWhereNotBetween: WhereBetween<TRecord, TResult, TAliasRecord>;

      whereJsonObject: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      orWhereJsonObject: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      andWhereJsonObject: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      whereNotJsonObject: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      orWhereNotJsonObject: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      andWhereNotJsonObject: WhereJsonObject<TRecord, TResult, TAliasRecord>;

      whereJsonPath: WhereJsonPath<TRecord, TResult, TAliasRecord>;
      orWhereJsonPath: WhereJsonPath<TRecord, TResult, TAliasRecord>;
      andWhereJsonPath: WhereJsonPath<TRecord, TResult, TAliasRecord>;

      whereJsonSupersetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      orWhereJsonSupersetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      andWhereJsonSupersetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      whereJsonNotSupersetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      orWhereJsonNotSupersetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      andWhereJsonNotSupersetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;

      whereJsonSubsetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      orWhereJsonSubsetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      andWhereJsonSubsetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      whereJsonNotSubsetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      orWhereJsonNotSubsetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;
      andWhereJsonNotSubsetOf: WhereJsonObject<TRecord, TResult, TAliasRecord>;

      // Group by
      groupBy: GroupBy<TRecord, TResult, TAliasRecord>;
      groupByRaw: RawQueryBuilder<TRecord, TResult, TAliasRecord>;

      // Order by
      orderBy: OrderBy<TRecord, TResult, TAliasRecord>;
      orderByRaw: RawQueryBuilder<TRecord, TResult, TAliasRecord>;

      // Partition by
      partitionBy: PartitionBy<TRecord, TResult, TAliasRecord>;

      // Intersect
      intersect: Intersect<TRecord, TResult, TAliasRecord>;

      // Union
      union: Union<TRecord, TResult, TAliasRecord>;
      unionAll: Union<TRecord, TResult, TAliasRecord>;

      // Having
      having: Having<TRecord, TResult, TAliasRecord>;
      andHaving: Having<TRecord, TResult, TAliasRecord>;
      havingRaw: RawQueryBuilder<TRecord, TResult, TAliasRecord>;
      orHaving: Having<TRecord, TResult, TAliasRecord>;
      orHavingRaw: RawQueryBuilder<TRecord, TResult, TAliasRecord>;
      havingIn: HavingRange<TRecord, TResult, TAliasRecord>;
      orHavingNotBetween: HavingRange<TRecord, TResult, TAliasRecord>;
      havingNotBetween: HavingRange<TRecord, TResult, TAliasRecord>;
      orHavingBetween: HavingRange<TRecord, TResult, TAliasRecord>;
      havingBetween: HavingRange<TRecord, TResult, TAliasRecord>;
      havingNotIn: HavingRange<TRecord, TResult, TAliasRecord>;
      andHavingNotIn: HavingRange<TRecord, TResult, TAliasRecord>;
      orHavingNotIn: HavingRange<TRecord, TResult, TAliasRecord>;

      // Clear
      clearSelect(): QueryBuilder<
        TRecord,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        UnwrapArrayMember<TResult> extends DeferredKeySelection<infer TBase, infer TKeys, true, any, any, any, any>
          ? DeferredKeySelection<TBase, never>[]
          : TResult
      >;
      clearWhere(): QueryBuilder<TRecord, TResult, TAliasRecord>;
      clearGroup(): QueryBuilder<TRecord, TResult, TAliasRecord>;
      clearOrder(): QueryBuilder<TRecord, TResult, TAliasRecord>;
      clearHaving(): QueryBuilder<TRecord, TResult, TAliasRecord>;
      clearCounters(): QueryBuilder<TRecord, TResult, TAliasRecord>;
      clear(statement: ClearStatements): QueryBuilder<TRecord, TResult, TAliasRecord>;

      // Paging
      offset(
        offset: number,
        options?: boolean | Readonly<{ skipBinding?: boolean }>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      limit(
        limit: number,
        options?: string | Readonly<{ skipBinding?: boolean }>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      // Aggregation
      count: AsymmetricAggregation<TRecord, TResult, Lookup<ResultTypes.Registry, 'Count', number | string>>;
      countDistinct: AsymmetricAggregation<TRecord, TResult, Lookup<ResultTypes.Registry, 'Count', number | string>>;
      min: TypePreservingAggregation<TRecord, TResult, TAliasRecord>;
      max: TypePreservingAggregation<TRecord, TResult, TAliasRecord>;
      sum: TypePreservingAggregation<TRecord, TResult, TAliasRecord>;
      sumDistinct: TypePreservingAggregation<TRecord, TResult, TAliasRecord>;
      avg: TypePreservingAggregation<TRecord, TResult, TAliasRecord>;
      avgDistinct: TypePreservingAggregation<TRecord, TResult, TAliasRecord>;

      increment(columnName: keyof TRecord, amount?: number): QueryBuilder<TRecord, number>;
      increment(columnName: string, amount?: number): QueryBuilder<TRecord, number>;

      decrement(columnName: keyof TRecord, amount?: number): QueryBuilder<TRecord, number>;
      decrement(columnName: string, amount?: number): QueryBuilder<TRecord, number>;

      // Analytics
      rank: AnalyticFunction<TRecord, TResult>;
      denseRank: AnalyticFunction<TRecord, TResult>;
      rowNumber: AnalyticFunction<TRecord, TResult>;

      // Others
      first: Select<TRecord, DeferredKeySelection.AddUnionMember<UnwrapArrayMember<TResult>, undefined>>;

      pluck<K extends keyof TRecord>(column: K): QueryBuilder<TRecord, TRecord[K][], TAliasRecord>;
      pluck<TResult2 extends {}>(column: string): QueryBuilder<TRecord, TResult2, TAliasRecord>;

      insert(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'insert'> | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: '*',
        options?: DMLOptions
      ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      insert<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'insert'> | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      insert<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'insert'> | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      insert<TKey extends string, TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[]>(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'insert'> | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      insert<TKey extends string, TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[]>(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'insert'> | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      insert<TResult2 = number[]>(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'insert'> | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>
      ): QueryBuilder<TRecord, TResult2>;

      upsert(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'upsert'> | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: '*',
        options?: DMLOptions
      ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      upsert<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'upsert'> | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      upsert<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'upsert'> | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      upsert<TKey extends string, TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[]>(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'upsert'> | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      upsert<TKey extends string, TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[]>(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'upsert'> | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      upsert<TResult2 = number[]>(
        data: TRecord extends CompositeTableType<unknown>
          ? ResolveTableType<TRecord, 'upsert'> | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
          : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>
      ): QueryBuilder<TRecord, TResult2>;

      modify<TRecord2 extends {} = any, TResult2 extends {} = any>(
        callback: QueryCallbackWithArgs<TRecord, any>,
        ...args: any[]
      ): QueryBuilder<TRecord2, TResult2>;
      update<
        K1 extends StrKey<ResolveTableType<TRecord, 'update'>>,
        K2 extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, K2>[],
      >(
        columnName: K1,
        value: DbColumn<ResolveTableType<TRecord, 'update'>[K1]>,
        returning: K2,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update<
        K1 extends StrKey<ResolveTableType<TRecord, 'update'>>,
        K2 extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, K2>[],
      >(
        columnName: K1,
        value: DbColumn<ResolveTableType<TRecord, 'update'>[K1]>,
        returning: readonly K2[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update<K extends keyof TRecord>(columnName: K, value: DbColumn<TRecord[K]>): QueryBuilder<TRecord, number>;
      update<TResult2 = SafePartial<TRecord>[]>(
        columnName: string,
        value: Value,
        returning: string | readonly string[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update(
        data: DbRecordArr<TRecord>,
        returning: '*',
        options?: DMLOptions
      ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      update<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, 'update'> : DbRecordArr<TRecord>,
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, 'update'> : DbRecordArr<TRecord>,
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update<
        TKey extends string = string,
        TResult2 extends {}[] = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, 'update'> : DbRecordArr<TRecord>,
        returning: TKey | readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update<
        TKey extends string,
        TResult2 extends {}[] = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[],
      >(
        data: TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, 'update'> : DbRecordArr<TRecord>,
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      update<TResult2 = number>(
        data: TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, 'update'> : DbRecordArr<TRecord>
      ): QueryBuilder<TRecord, TResult2>;

      update<TResult2 = number>(columnName: string, value: Value): QueryBuilder<TRecord, TResult2>;

      returning(column: '*', options?: DMLOptions): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      returning<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        column: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      returning<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.SetSingle<
          DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>,
          false
        >[],
      >(
        columns: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      returning<TResult2 = SafePartial<TRecord>[]>(
        column: string | readonly (string | Raw)[] | Raw,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;

      onConflict<TKey extends StrKey<ResolveTableType<TRecord>>>(
        column: TKey
      ): OnConflictQueryBuilder<TRecord, TResult>;
      onConflict<TKey extends StrKey<ResolveTableType<TRecord>>>(
        columns: readonly TKey[]
      ): OnConflictQueryBuilder<TRecord, TResult>;

      onConflict(columns: string): OnConflictQueryBuilder<TRecord, TResult>;

      onConflict(columns: string[]): OnConflictQueryBuilder<TRecord, TResult>;

      onConflict(raw: Raw): OnConflictQueryBuilder<TRecord, TResult>;

      onConflict(): OnConflictQueryBuilder<TRecord, TResult>;

      del(returning: '*', options?: DMLOptions): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      del<
        TKey extends StrKey<TRecord>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[],
      >(
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      del<
        TKey extends StrKey<TRecord>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[],
      >(
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2[]>;
      del<TResult2 = SafePartial<TRecord>[]>(
        returning: string | readonly string[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      del<TResult2 = number>(): QueryBuilder<TRecord, TResult2>;

      delete(returning: '*', options?: DMLOptions): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      delete<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        returning: TKey,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      delete<
        TKey extends StrKey<TRecord>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, TRecord, TKey>[],
      >(
        returning: readonly TKey[],
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      delete<TResult2 = any>(
        returning: string | readonly (string | Raw)[] | Raw,
        options?: DMLOptions
      ): QueryBuilder<TRecord, TResult2>;
      delete<TResult2 = number>(): QueryBuilder<TRecord, TResult2>;

      truncate(): QueryBuilder<TRecord, void>;
    }

    // interface As<TRecord extends {}, TResult, TAliasRecord extends {} = {}> {
    //   (columnName: keyof TRecord): QueryBuilder<TRecord, TResult, TAliasRecord>;
    //   (columnName: string): QueryBuilder<TRecord, TResult, TAliasRecord>;
    // }

    type IntersectAliases<AliasUT> = UnionToIntersection<
      IncompatibleToAlt<
        AliasUT extends (infer I)[] ? (I extends Ref<any, infer TMapping> ? TMapping : I) : never,
        Dict,
        {}
      >
    > & {}; // filters out `null` and `undefined`

    interface JsonExtraction {
      column: string | Raw | QueryBuilder;
      path: string;
      alias?: string;
      singleValue?: boolean;
    }

    interface JsonExtract<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      (
        column: string | Raw | QueryBuilder,
        path: string,
        alias?: string,
        singleValue?: boolean
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (column: JsonExtraction[] | any[][], singleValue?: boolean): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface JsonSet<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      (
        column: string | Raw | QueryBuilder,
        path: string,
        value: any,
        alias?: string
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface JsonInsert<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      (
        column: string | Raw | QueryBuilder,
        path: string,
        value: any,
        alias?: string
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface JsonRemove<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      (column: string | Raw | QueryBuilder, path: string, alias?: string): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface HintComment<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      (hint: string): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (hints: readonly string[]): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Table<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}> {
      <
        TTable extends TableNames,
        TRecord2 extends {} = TableType<TTable>,
        TResult2 = DeferredKeySelection.ReplaceBase<TResult, ResolveTableType<TRecord2>>,
      >(
        tableName: TTable,
        options?: TableOptions
      ): QueryBuilder<TRecord2, TResult2, TAliasRecord>;
      <TRecord2 extends {} = {}, TResult2 = DeferredKeySelection.ReplaceBase<TResult, TRecord2>>(
        tableName: TableDescriptor | AliasDict,
        options?: TableOptions
      ): QueryBuilder<TRecord2, TResult2, TAliasRecord>;
      <TRecord2 extends {} = {}, TResult2 = DeferredKeySelection.ReplaceBase<TResult, TRecord2>>(
        callback: Function,
        options?: TableOptions
      ): QueryBuilder<TRecord2, TResult2, TAliasRecord>;
      <TRecord2 extends {} = {}, TResult2 = DeferredKeySelection.ReplaceBase<TResult, TRecord2>>(
        raw: Raw,
        options?: TableOptions
      ): QueryBuilder<TRecord2, TResult2, TAliasRecord>;
    }

    interface Distinct<TRecord extends {}, TResult = {}[], TAliasRecord extends {} = {}>
      extends ColumnNameQueryBuilder<TRecord, TResult, TAliasRecord> {}

    interface DistinctOn<TRecord extends {}, TResult = {}[], TAliasRecord extends {} = {}> {
      <ColNameUT extends keyof TRecord>(
        ...columnNames: readonly ColNameUT[]
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      <ColNameUT extends keyof TRecord>(
        columnNames: readonly ColNameUT[]
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (...columnNames: readonly string[]): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (columnNames: readonly string[]): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface JoinRaw<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (tableName: string, binding?: Value | Value[] | ValueDict): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface Using<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (tables: string[]): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface With<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}>
      extends WithRaw<TRecord, TResult, TAliasRecord>,
        WithWrapped<TRecord, TResult, TAliasRecord> {}

    interface WithRaw<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (alias: string, raw: Raw | QueryBuilder): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (alias: string, sql: string, bindings?: readonly Value[] | Object): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (alias: string, columnList: string[], raw: Raw | QueryBuilder): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (
        alias: string,
        columnList: string[],
        sql: string,
        bindings?: readonly Value[] | Object
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WithSchema<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (schema: string): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WithWrapped<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (alias: string, queryBuilder: QueryBuilder): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (alias: string, callback: (queryBuilder: QueryBuilder) => any): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (alias: string, columnList: string[], queryBuilder: QueryBuilder): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (
        alias: string,
        columnList: string[],
        callback: (queryBuilder: QueryBuilder) => any
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface Where<TRecord extends {} = any, TResult = unknown, TAliasRecord extends {} = {}>
      extends WhereRaw<TRecord, TResult, TAliasRecord>,
        WhereWrapped<TRecord, TResult, TAliasRecord>,
        WhereNull<TRecord, TResult, TAliasRecord> {
      (raw: Raw): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (callback: QueryCallback<TRecord, TResult>): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (object: DbRecord<ResolveTableType<TRecord>>): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (object: Readonly<Object>): QueryBuilder<TRecord, TResult, TAliasRecord>;

      <T extends keyof ResolveTableType<TRecord>>(
        columnName: T,
        value: DbColumn<ResolveTableType<TRecord>[T]> | null
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (columnName: string, value: Value | null): QueryBuilder<TRecord, TResult, TAliasRecord>;

      <T extends keyof ResolveTableType<TRecord>>(
        columnName: T,
        operator: ComparisonOperator,
        value: DbColumn<ResolveTableType<TRecord>[T]> | null
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (columnName: string, operator: string, value: Value | null): QueryBuilder<TRecord, TResult, TAliasRecord>;

      <T extends keyof ResolveTableType<TRecord>, TRecordInner extends {}, TResultInner>(
        columnName: T,
        operator: ComparisonOperator,
        value: QueryBuilder<TRecordInner, TResultInner>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      <TRecordInner extends {}, TResultInner>(
        columnName: string,
        operator: string,
        value: QueryBuilder<TRecordInner, TResultInner>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (left: Raw, operator: string, right: Value | null): QueryBuilder<TRecord, TResult, TAliasRecord>;

      <TRecordInner extends {}, TResultInner>(
        left: Raw,
        operator: string,
        right: QueryBuilder<TRecordInner, TResultInner>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereRaw<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}>
      extends RawQueryBuilder<TRecord, TResult> {
      (condition: boolean): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereWrapped<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (callback: QueryCallback<TRecord, TResult>): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereNull<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (columnName: keyof TRecord): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (columnName: string): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereBetween<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      <K extends keyof TRecord>(
        columnName: K,
        range: readonly [DbColumn<TRecord[K]>, DbColumn<TRecord[K]>]
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (columnName: string, range: readonly [Value, Value]): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereExists<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (callback: QueryCallback<TRecord, TResult>): QueryBuilder<TRecord, TResult, TAliasRecord>;
      <TRecordInner extends {}, TResultInner>(
        query: QueryBuilder<TRecordInner, TResultInner>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereJsonObject<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (columnName: keyof ResolveTableType<TRecord>, value: any): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereJsonPath<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (
        columnName: keyof ResolveTableType<TRecord>,
        jsonPath: string,
        operator: string,
        value: any
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface WhereIn<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      <K extends keyof ResolveTableType<TRecord>>(
        columnName: K,
        values: readonly DbColumn<ResolveTableType<TRecord>[K]>[] | QueryCallback
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (columnName: string, values: readonly Value[] | QueryCallback): QueryBuilder<TRecord, TResult, TAliasRecord>;
      <K extends keyof ResolveTableType<TRecord>>(
        columnNames: readonly K[],
        values: readonly (readonly DbColumn<ResolveTableType<TRecord>[K]>[])[] | QueryCallback
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (
        columnNames: readonly string[],
        values: readonly Value[][] | QueryCallback
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      <K extends keyof TRecord, TRecordInner extends {}, TResultInner>(
        columnName: K,
        values: QueryBuilder<TRecordInner, TRecord[K]>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      <TRecordInner extends {}, TResultInner>(
        columnName: string,
        values: Value[] | QueryBuilder<TRecordInner, TResultInner>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      <K extends keyof TRecord, TRecordInner extends {}, TResultInner>(
        columnNames: readonly K[],
        values: QueryBuilder<TRecordInner, TRecord[K]>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      <TRecordInner extends {}, TResultInner>(
        columnNames: readonly string[],
        values: QueryBuilder<TRecordInner, TResultInner>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    // Note: Attempting to unify AsymmetricAggregation & TypePreservingAggregation
    // by extracting out a common base interface will not work because order of overloads
    // is significant.

    interface AsymmetricAggregation<TRecord extends {} = any, TResult = unknown[], TValue = any> {
      <TOptions extends { as: string }, TResult2 = AggregationQueryResult<TResult, { [k in TOptions['as']]: TValue }>>(
        columnName: Readonly<keyof ResolveTableType<TRecord>>,
        options: Readonly<TOptions>
      ): QueryBuilder<TRecord, TResult2>;
      <TResult2 = AggregationQueryResult<TResult, Dict<TValue>>>(
        ...columnNames: readonly (keyof ResolveTableType<TRecord>)[]
      ): QueryBuilder<TRecord, TResult2>;
      <
        TAliases extends {} = Record<string, string | string[] | Knex.Raw>,
        TResult2 = AggregationQueryResult<TResult, { [k in keyof TAliases]?: TValue }>,
      >(
        aliases: TAliases
      ): QueryBuilder<TRecord, TResult2>;
      <TResult2 = AggregationQueryResult<TResult, Dict<TValue>>>(
        ...columnNames: ReadonlyArray<Readonly<Record<string, string | string[] | Knex.Raw>> | Knex.Raw | string>
      ): QueryBuilder<TRecord, TResult2>;
    }

    interface AnalyticFunction<TRecord extends {} = any, TResult = unknown[]> {
      <TAlias extends string, TResult2 = AggregationQueryResult<TResult, { [x in TAlias]: number }>>(
        alias: TAlias,
        raw: Raw | QueryCallback<TRecord, TResult>
      ): QueryBuilder<TRecord, TResult2>;
      <
        TAlias extends string,
        TKey extends keyof ResolveTableType<TRecord>,
        TResult2 = AggregationQueryResult<TResult, { [x in TAlias]: number }>,
      >(
        alias: TAlias,
        orderBy:
          | TKey
          | TKey[]
          | {
              column: TKey;
              order?: 'asc' | 'desc';
              nulls?: 'first' | 'last';
            },
        partitionBy?: TKey | TKey[] | { column: TKey; order?: 'asc' | 'desc' }
      ): QueryBuilder<TRecord, TResult2>;
    }

    interface GroupBy<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}>
      extends RawQueryBuilder<TRecord, TResult, TAliasRecord>,
        ColumnNameQueryBuilder<TRecord, TResult, TAliasRecord> {}

    interface OrderBy<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (
        columnName: keyof TRecord | QueryBuilder,
        order?: 'asc' | 'desc',
        nulls?: 'first' | 'last'
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (columnName: string | QueryBuilder, order?: string, nulls?: string): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (
        columnDefs: Array<
          | keyof TRecord
          | Readonly<{
              column: keyof TRecord | QueryBuilder;
              order?: 'asc' | 'desc';
              nulls?: 'first' | 'last';
            }>
        >
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (
        columnDefs: Array<
          | string
          | Readonly<{
              column: string | QueryBuilder;
              order?: string;
              nulls?: string;
            }>
        >
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface PartitionBy<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}>
      extends OrderBy<TRecord, TResult, TAliasRecord> {}

    interface Intersect<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      (
        callback: MaybeArray<QueryCallback | QueryBuilder<TRecord> | Raw>,
        wrap?: boolean
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (
        ...callbacks: readonly (QueryCallback | Raw | QueryBuilder<TRecord>)[]
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface Union<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}>
      extends Intersect<TRecord, TResult, TAliasRecord> {}

    interface Having<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}>
      extends WhereWrapped<TRecord, TResult, TAliasRecord> {
      <K extends keyof TRecord>(
        column: K,
        operator: ComparisonOperator,
        value: DbColumn<TRecord[K]>
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (
        column: string | Raw,
        operator: string,
        value: Value | QueryBuilder | null
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;

      (raw: Raw): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    interface HavingRange<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      <K extends keyof TRecord>(
        columnName: K,
        values: readonly DbColumn<TRecord[K]>[]
      ): QueryBuilder<TRecord, TResult, TAliasRecord>;
      (columnName: string, values: readonly Value[]): QueryBuilder<TRecord, TResult, TAliasRecord>;
    }

    // commons

    type RawBinding = Value | QueryBuilder;

    interface RawQueryBuilder<TRecord extends {} = any, TResult = unknown[], TAliasRecord extends {} = {}> {
      <TResult2 = TResult>(
        sql: string,
        bindings?: readonly RawBinding[] | ValueDict | RawBinding
      ): QueryBuilder<TRecord, TResult2, TAliasRecord>;
      <TResult2 = TResult>(raw: Raw<TResult2>): QueryBuilder<TRecord, TResult2, TAliasRecord>;
    }

    // Raw

    interface Raw<TResult = any> extends events.EventEmitter, ChainableInterface<ResolveResult<TResult>> {
      timeout(ms: number, options?: { cancel?: boolean }): Raw<TResult>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      wrap<TResult2 = TResult>(before: string, after: string): Raw<TResult>;
      toSQL(): Sql;
      queryContext(context: any): Raw<TResult>;
      queryContext(): any;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface RawBuilder<TRecord extends {} = any, TResult = any> {
      <TResult2 = TResult>(value: Value): Raw<TResult2>;
      <TResult2 = TResult>(sql: string, ...bindings: readonly RawBinding[]): Raw<TResult2>;
      <TResult2 = TResult>(sql: string, bindings: readonly RawBinding[] | ValueDict): Raw<TResult2>;
    }

    const RefMemberTag: unique symbol;

    interface Ref<TSrc extends string, TMapping extends {}> extends Raw<string> {
      // TypeScript can behave weirdly if type parameters are not
      // actually used in the members of type.
      //
      // See: https://github.com/knex/knex/issues/3932
      //
      // We simply need to propagate the type context so that we can extract
      // them later, but we just add a "phantom" property so that typescript
      // doesn't think that these parameters are unused
      //
      // Because unique symbol is used here, there is no way to actually
      // access this at runtime
      [RefMemberTag]: {
        src: TSrc;
        mapping: TMapping;
      };
      withSchema(schema: string): this;
      as<TAlias extends string>(alias: TAlias): Ref<TSrc, { [K in TAlias]: TSrc }>;
    }

    interface RefBuilder {
      <TSrc extends string>(src: TSrc): Ref<TSrc, { [K in TSrc]: TSrc }>;
    }

    interface BatchInsertBuilder<TRecord extends {} = any, TResult = number[]> extends Promise<ResolveResult<TResult>> {
      transacting(trx: Transaction): this;
      // see returning methods from QueryInterface
      returning(column: '*'): BatchInsertBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>;
      returning<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>[],
      >(
        column: TKey
      ): BatchInsertBuilder<TRecord, TResult2>;
      returning<
        TKey extends StrKey<ResolveTableType<TRecord>>,
        TResult2 = DeferredKeySelection.SetSingle<
          DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, ResolveTableType<TRecord>, TKey>,
          false
        >[],
      >(
        columns: readonly TKey[]
      ): BatchInsertBuilder<TRecord, TResult2>;
      // if data with specific type passed, exclude this method
      returning<TResult2 = SafePartial<TRecord>[]>(
        column: unknown extends TRecord ? string | readonly (string | Raw)[] | Raw : never
      ): BatchInsertBuilder<TRecord, TResult2>;
    }

    //
    // QueryBuilder
    //

    type QueryCallback<TRecord extends {} = any, TResult = unknown[]> = (
      this: QueryBuilder<TRecord, TResult>,
      builder: QueryBuilder<TRecord, TResult>
    ) => void;

    type QueryCallbackWithArgs<TRecord extends {} = any, TResult = unknown[]> = (
      this: QueryBuilder<TRecord, TResult>,
      builder: QueryBuilder<TRecord, TResult>,
      ...args: any[]
    ) => void;

    interface QueryBuilder<TRecord extends {} = any, TResult = any, TAliasRecord extends {} = {}>
      extends QueryInterface<TRecord, TResult, TAliasRecord>,
        ChainableInterface<ResolveResult<TResult>> {
      client: Client;
      or: QueryBuilder<TRecord, TResult>;
      not: QueryBuilder<TRecord, TResult>;
      and: QueryBuilder<TRecord, TResult>;

      // TODO: Promise?
      columnInfo(column: keyof DeferredKeySelection.Resolve<TRecord>): Promise<ColumnInfo>;
      columnInfo(): Promise<Record<keyof DeferredKeySelection.Resolve<TRecord>, ColumnInfo>>;

      forUpdate(...tableNames: string[]): QueryBuilder<TRecord, TResult>;
      forUpdate(tableNames: readonly string[]): QueryBuilder<TRecord, TResult>;

      forShare(...tableNames: string[]): QueryBuilder<TRecord, TResult>;
      forShare(tableNames: readonly string[]): QueryBuilder<TRecord, TResult>;

      forNoKeyUpdate(...tableNames: string[]): QueryBuilder<TRecord, TResult>;
      forNoKeyUpdate(tableNames: readonly string[]): QueryBuilder<TRecord, TResult>;

      forKeyShare(...tableNames: string[]): QueryBuilder<TRecord, TResult>;
      forKeyShare(tableNames: readonly string[]): QueryBuilder<TRecord, TResult>;

      skipLocked(): QueryBuilder<TRecord, TResult>;
      noWait(): QueryBuilder<TRecord, TResult>;

      toSQL(): Sql;

      on(event: string, callback: Function): QueryBuilder<TRecord, TResult>;

      queryContext(context: any): QueryBuilder<TRecord, TResult>;
      queryContext(): any;

      clone(): QueryBuilder<TRecord, TResult>;
      timeout(ms: number, options?: { cancel?: boolean }): QueryBuilder<TRecord, TResult>;
    }

    interface Sql {
      method: string;
      options: any;
      bindings: readonly Value[];
      sql: string;
      toNative(): SqlNative;
    }

    interface SqlNative {
      bindings: readonly Value[];
      sql: string;
    }

    //
    // Chainable interface
    //

    type ExposedPromiseKeys = 'then' | 'catch' | 'finally';

    interface StringTagSupport {
      readonly [Symbol.toStringTag]: string;
    }
    interface ChainableInterface<T = any>
      extends Pick<Promise<T>, keyof Promise<T> & ExposedPromiseKeys>,
        StringTagSupport {
      generateDdlCommands(): Promise<{
        pre: string[];
        sql: string[];
        check: string | null;
        post: string[];
      }>;
      toQuery(): string;
      options(options: Readonly<{ [key: string]: any }>): this;
      connection(connection: any): this;
      debug(enabled: boolean): this;
      transacting(trx: Transaction): this;
      stream(handler: (readable: stream.PassThrough) => any): Promise<any>;
      stream(options: Readonly<{ [key: string]: any }>, handler: (readable: stream.PassThrough) => any): Promise<any>;
      stream(options?: Readonly<{ [key: string]: any }>): stream.PassThrough & AsyncIterable<ArrayMember<T>>;
      pipe<T extends NodeJS.WritableStream>(
        writable: T,
        options?: Readonly<{ [key: string]: any }>
      ): stream.PassThrough;
      asCallback(callback: Function): Promise<T>;
    }

    // Not all of these are possible for all drivers, notably, sqlite doesn't support any of these
    type IsolationLevels = 'read uncommitted' | 'read committed' | 'snapshot' | 'repeatable read' | 'serializable';
    interface TransactionConfig {
      isolationLevel?: IsolationLevels;
      userParams?: Record<string, any>;
      doNotRejectOnRollback?: boolean;
      connection?: any;
    }

    interface Transaction<TRecord extends {} = any, TResult = any[]> extends Knex<TRecord, TResult> {
      executionPromise: Promise<TResult>;
      isCompleted: () => boolean;

      query<TRecord extends {} = any, TResult = void>(
        conn: any,
        sql: any,
        status: any,
        value: any
      ): QueryBuilder<TRecord, TResult>;
      savepoint<T = any>(transactionScope: (trx: Transaction) => any): Promise<T>;
      commit(value?: any): QueryBuilder<TRecord, TResult>;
      rollback(error?: any): QueryBuilder<TRecord, TResult>;
    }

    type TransactionProvider = () => Promise<Transaction>;

    //
    // Schema builder
    //

    interface SchemaBuilder extends ChainableInterface<void> {
      // Views
      createView(viewName: string, callback: (viewBuilder: ViewBuilder) => any): SchemaBuilder;
      createViewOrReplace(viewName: string, callback: (viewBuilder: ViewBuilder) => any): SchemaBuilder;
      createMaterializedView(viewName: string, callback: (viewBuilder: ViewBuilder) => any): SchemaBuilder;
      refreshMaterializedView(viewName: string, concurrently?: boolean): SchemaBuilder;
      dropView(viewName: string): SchemaBuilder;
      dropViewIfExists(viewName: string): SchemaBuilder;
      dropMaterializedView(viewName: string): SchemaBuilder;
      dropMaterializedViewIfExists(viewName: string): SchemaBuilder;
      renameView(oldViewName: string, newViewName: string): Promise<void>;
      view(viewName: string, callback: (viewBuilder: AlterViewBuilder) => any): Promise<void>;
      alterView(viewName: string, callback: (tableBuilder: AlterViewBuilder) => any): SchemaBuilder;

      // Tables
      createTable(tableName: string, callback: (tableBuilder: CreateTableBuilder) => any): SchemaBuilder;
      createTableIfNotExists(tableName: string, callback: (tableBuilder: CreateTableBuilder) => any): SchemaBuilder;
      createTableLike(
        tableName: string,
        tableNameLike: string,
        callback?: (tableBuilder: CreateTableBuilder) => any
      ): SchemaBuilder;
      alterTable(tableName: string, callback: (tableBuilder: CreateTableBuilder) => any): SchemaBuilder;
      renameTable(oldTableName: string, newTableName: string): Promise<void>;
      dropTable(tableName: string): SchemaBuilder;
      hasTable(tableName: string): Promise<boolean>;
      table(tableName: string, callback: (tableBuilder: AlterTableBuilder) => any): Promise<void>;
      dropTableIfExists(tableName: string): SchemaBuilder;

      // Schema
      createSchema(schemaName: string): SchemaBuilder;
      createSchemaIfNotExists(schemaName: string): SchemaBuilder;
      dropSchema(schemaName: string, cascade?: boolean): SchemaBuilder;
      dropSchemaIfExists(schemaName: string, cascade?: boolean): SchemaBuilder;
      withSchema(schemaName: string): SchemaBuilder;

      // Others
      hasColumn(tableName: string, columnName: string): Promise<boolean>;
      raw(statement: string): SchemaBuilder;
      queryContext(context: any): SchemaBuilder;
      toString(): string;
      toSQL(): Sql;
    }

    interface TableBuilder {
      increments(columnName?: string, options?: { primaryKey?: boolean }): ColumnBuilder;
      bigIncrements(columnName?: string, options?: { primaryKey?: boolean }): ColumnBuilder;
      dropColumn(columnName: string): TableBuilder;
      dropColumns(...columnNames: string[]): TableBuilder;
      renameColumn(from: string, to: string): TableBuilder;
      integer(columnName: string, length?: number): ColumnBuilder;
      tinyint(columnName: string, length?: number): ColumnBuilder;
      smallint(columnName: string): ColumnBuilder;
      mediumint(columnName: string): ColumnBuilder;
      bigint(columnName: string): ColumnBuilder;
      bigInteger(columnName: string): ColumnBuilder;
      text(columnName: string, textType?: string): ColumnBuilder;
      string(columnName: string, length?: number): ColumnBuilder;
      float(columnName: string, precision?: number, scale?: number): ColumnBuilder;
      double(columnName: string, precision?: number, scale?: number): ColumnBuilder;
      decimal(columnName: string, precision?: number | null, scale?: number): ColumnBuilder;
      boolean(columnName: string): ColumnBuilder;
      date(columnName: string): ColumnBuilder;
      dateTime(columnName: string, options?: Readonly<{ useTz?: boolean; precision?: number }>): ColumnBuilder;
      datetime(columnName: string, options?: Readonly<{ useTz?: boolean; precision?: number }>): ColumnBuilder;
      time(columnName: string): ColumnBuilder;
      timestamp(columnName: string, options?: Readonly<{ useTz?: boolean; precision?: number }>): ColumnBuilder;
      /** @deprecated */
      timestamp(columnName: string, withoutTz?: boolean, precision?: number): ColumnBuilder;
      timestamps(useTimestamps?: boolean, defaultToNow?: boolean, useCamelCase?: boolean): ColumnBuilder;
      timestamps(
        options?: Readonly<{
          useTimestamps?: boolean;
          defaultToNow?: boolean;
          useCamelCase?: boolean;
        }>
      ): void;
      geometry(columnName: string): ColumnBuilder;
      geography(columnName: string): ColumnBuilder;
      point(columnName: string): ColumnBuilder;
      binary(columnName: string, length?: number): ColumnBuilder;
      enum(columnName: string, values: readonly Value[] | null, options?: EnumOptions): ColumnBuilder;
      enu(columnName: string, values: readonly Value[] | null, options?: EnumOptions): ColumnBuilder;
      json(columnName: string): ColumnBuilder;
      jsonb(columnName: string): ColumnBuilder;
      uuid(columnName: string, options?: Readonly<{ useBinaryUuid?: boolean; primaryKey?: boolean }>): ColumnBuilder;
      comment(val: string): void;
      specificType(columnName: string, type: string): ColumnBuilder;
      primary(
        columnNames: readonly string[],
        options?: Readonly<{
          constraintName?: string;
          deferrable?: deferrableType;
        }>
      ): TableBuilder;
      /** @deprecated */
      primary(columnNames: readonly string[], constraintName?: string): TableBuilder;
      index(columnNames: string | readonly (string | Raw)[], indexName?: string, indexType?: string): TableBuilder;
      index(
        columnNames: string | readonly (string | Raw)[],
        indexName?: string,
        options?: Readonly<{
          indexType?: string;
          storageEngineIndexType?: storageEngineIndexType;
          predicate?: QueryBuilder;
        }>
      ): TableBuilder;
      setNullable(column: string): TableBuilder;
      dropNullable(column: string): TableBuilder;
      unique(
        columnNames: readonly (string | Raw)[],
        options?: Readonly<{
          indexName?: string;
          storageEngineIndexType?: string;
          deferrable?: deferrableType;
          useConstraint?: boolean;
        }>
      ): TableBuilder;
      /** @deprecated */
      unique(columnNames: readonly (string | Raw)[], indexName?: string): TableBuilder;
      foreign(column: string, foreignKeyName?: string): ForeignConstraintBuilder;
      foreign(columns: readonly string[], foreignKeyName?: string): MultikeyForeignConstraintBuilder;
      check(checkPredicate: string, bindings?: Record<string, any>, constraintName?: string): TableBuilder;
      dropForeign(columnNames: string | readonly string[], foreignKeyName?: string): TableBuilder;
      dropUnique(columnNames: readonly (string | Raw)[], indexName?: string): TableBuilder;
      dropPrimary(constraintName?: string): TableBuilder;
      dropIndex(columnNames: string | readonly (string | Raw)[], indexName?: string): TableBuilder;
      dropTimestamps(useCamelCase?: boolean): TableBuilder;
      dropChecks(checkConstraintNames: string | string[]): TableBuilder;
      queryContext(context: any): TableBuilder;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ViewBuilder<TRecord extends {} = any, TResult = any> {
      columns(columns: any): ViewBuilder;
      as(selectQuery: QueryBuilder): ViewBuilder;
      checkOption(): Promise<void>;
      localCheckOption(): Promise<void>;
      cascadedCheckOption(): Promise<void>;
      queryContext(context: any): ViewBuilder;
    }

    interface CreateTableBuilder extends TableBuilder {
      engine(val: string): CreateTableBuilder;
      charset(val: string): CreateTableBuilder;
      collate(val: string): CreateTableBuilder;
      inherits(val: string): CreateTableBuilder;
    }

    interface AlterTableBuilder extends TableBuilder {}

    interface AlterColumnView extends ViewBuilder {
      rename(newName: string): AlterColumnView;
      defaultTo(defaultValue: string): AlterColumnView;
    }

    interface AlterViewBuilder extends ViewBuilder {
      column(column: string): AlterColumnView;
    }

    type deferrableType = 'not deferrable' | 'immediate' | 'deferred';
    type storageEngineIndexType = 'hash' | 'btree';
    type lengthOperator = '>' | '<' | '<=' | '>=' | '!=' | '=';

    interface ColumnBuilder {
      index(indexName?: string): ColumnBuilder;
      primary(
        options?: Readonly<{
          constraintName?: string;
          deferrable?: deferrableType;
        }>
      ): ColumnBuilder;
      /** @deprecated */
      primary(constraintName?: string): ColumnBuilder;

      unique(options?: Readonly<{ indexName?: string; deferrable?: deferrableType }>): ColumnBuilder;
      /** @deprecated */
      unique(indexName?: string): ColumnBuilder;
      references(columnName: string): ReferencingColumnBuilder;
      defaultTo(value: Value | null, options?: DefaultToOptions): ColumnBuilder;
      unsigned(): ColumnBuilder;
      notNullable(): ColumnBuilder;
      nullable(): ColumnBuilder;
      comment(value: string): ColumnBuilder;
      alter(options?: Readonly<{ alterNullable?: boolean; alterType?: boolean }>): ColumnBuilder;
      queryContext(context: any): ColumnBuilder;
      after(columnName: string): ColumnBuilder;
      first(): ColumnBuilder;
      checkPositive(constraintName?: string): ColumnBuilder;
      checkNegative(constraintName?: string): ColumnBuilder;
      checkIn(values: string[], constraintName?: string): ColumnBuilder;
      checkNotIn(values: string[], constraintName?: string): ColumnBuilder;
      checkBetween(values: any[] | any[][], constraintName?: string): ColumnBuilder;
      checkLength(operator: lengthOperator, length: number, constraintName?: string): ColumnBuilder;
      checkRegex(regex: string, constraintName?: string): ColumnBuilder;
    }

    interface ForeignConstraintBuilder {
      references(columnName: string): ReferencingColumnBuilder;
    }

    interface MultikeyForeignConstraintBuilder {
      references(columnNames: readonly string[]): ReferencingColumnBuilder;
    }

    interface PostgreSqlColumnBuilder extends ColumnBuilder {
      index(indexName?: string, options?: Readonly<{ indexType?: string; predicate?: QueryBuilder }>): ColumnBuilder;
      index(indexName?: string, indexType?: string): ColumnBuilder;
    }

    interface SqlLiteColumnBuilder extends ColumnBuilder {
      index(indexName?: string, options?: Readonly<{ predicate?: QueryBuilder }>): ColumnBuilder;
    }

    interface MsSqlColumnBuilder extends ColumnBuilder {
      index(indexName?: string, options?: Readonly<{ predicate?: QueryBuilder }>): ColumnBuilder;
    }

    interface MySqlColumnBuilder extends ColumnBuilder {
      index(
        indexName?: string,
        options?: Readonly<{
          indexType?: string;
          storageEngineIndexType?: storageEngineIndexType;
        }>
      ): ColumnBuilder;
    }

    // patched ColumnBuilder methods to return ReferencingColumnBuilder with new methods
    // relies on ColumnBuilder returning only ColumnBuilder
    type ReferencingColumnBuilder = {
      [K in keyof ColumnBuilder]: (...args: Parameters<ColumnBuilder[K]>) => ReferencingColumnBuilder;
    } & {
      inTable(tableName: string): ReferencingColumnBuilder;
      deferrable(type: deferrableType): ReferencingColumnBuilder;
      withKeyName(keyName: string): ReferencingColumnBuilder;
      onDelete(command: string): ReferencingColumnBuilder;
      onUpdate(command: string): ReferencingColumnBuilder;
    };

    interface AlterColumnBuilder extends ColumnBuilder {}

    interface MySqlAlterColumnBuilder extends AlterColumnBuilder {
      first(): AlterColumnBuilder;
      after(columnName: string): AlterColumnBuilder;
    }

    //
    // Configurations
    //

    interface ColumnInfo {
      defaultValue: Value;
      type: string;
      maxLength: number;
      nullable: boolean;
    }

    interface Config<SV extends {} = any> {
      debug?: boolean;
      client?: string | typeof Client;
      dialect?: string;
      jsonbSupport?: boolean;
      version?: string;
      connection?: string | StaticConnectionConfig | ConnectionConfigProvider;
      pool?: PoolConfig;
      migrations?: MigratorConfig;
      postProcessResponse?: (result: any, queryContext: any) => any;
      wrapIdentifier?: (value: string, origImpl: (value: string) => string, queryContext: any) => string;
      seeds?: SeederConfig<SV>;
      acquireConnectionTimeout?: number;
      useNullAsDefault?: boolean;
      searchPath?: string | readonly string[];
      asyncStackTraces?: boolean;
      log?: Logger;
    }

    type StaticConnectionConfig =
      | ConnectionConfig
      | MariaSqlConnectionConfig
      | MySqlConnectionConfig
      | MySql2ConnectionConfig
      | MsSqlConnectionConfig
      | OracleDbConnectionConfig
      | PgConnectionConfig
      | RedshiftConnectionConfig
      | Sqlite3ConnectionConfig
      | SocketConnectionConfig;

    type ConnectionConfigProvider = SyncConnectionConfigProvider | AsyncConnectionConfigProvider;
    type SyncConnectionConfigProvider = () => StaticConnectionConfig;
    type AsyncConnectionConfigProvider = () => Promise<StaticConnectionConfig>;

    interface ConnectionConfig {
      host: string;
      user: string;
      password: string;
      database: string;
      domain?: string;
      instanceName?: string;
      debug?: boolean;
      requestTimeout?: number;
    }

    type MsSqlAuthenticationTypeOptions =
      | 'default'
      | 'ntlm'
      | 'azure-active-directory-password'
      | 'azure-active-directory-access-token'
      | 'azure-active-directory-msi-vm'
      | 'azure-active-directory-msi-app-service'
      | 'azure-active-directory-service-principal-secret';

    interface MsSqlDefaultAuthenticationConfig extends MsSqlConnectionConfigBase {
      type?: 'default' | never;
    }

    interface MsSqlAzureActiveDirectoryMsiAppServiceAuthenticationConfig extends MsSqlConnectionConfigBase {
      type: 'azure-active-directory-msi-app-service';
      /**
       * If you user want to connect to an Azure app service using a specific client account
       * they need to provide `clientId` asscoiate to their created idnetity.
       *
       * This is optional for retrieve token from azure web app service
       */
      clientId?: string;
      /**
       * A msi app service environment need to provide `msiEndpoint` for retriving the accesstoken.
       */
      msiEndpoint?: string;
      /**
       * A msi app service environment need to provide `msiSecret` for retriving the accesstoken.
       */
      msiSecret?: string;
    }

    interface MsSqlAzureActiveDirectoryMsiVmAuthenticationConfig extends MsSqlConnectionConfigBase {
      type: 'azure-active-directory-msi-vm';
      /**
       * If you user want to connect to an Azure app service using a specific client account
       * they need to provide `clientId` asscoiate to their created idnetity.
       *
       * This is optional for retrieve token from azure web app service
       */
      clientId?: string;
      /**
       * A user need to provide `msiEndpoint` for retriving the accesstoken.
       */
      msiEndpoint?: string;
    }

    interface MsSqlAzureActiveDirectoryAccessTokenAuthenticationConfig extends MsSqlConnectionConfigBase {
      type: 'azure-active-directory-access-token';
      /**
       * A user-provided access token
       */
      token: string;
    }
    interface MsSqlAzureActiveDirectoryPasswordAuthenticationConfig extends MsSqlConnectionConfigBase {
      type: 'azure-active-directory-password';
      /**
       * Optional parameter for specific Azure tenant ID
       */
      domain: string;
      userName: string;
      password: string;
    }

    interface MsSqlAzureActiveDirectoryServicePrincipalSecretConfig extends MsSqlConnectionConfigBase {
      type: 'azure-active-directory-service-principal-secret';
      /**
       * Application (`client`) ID from your registered Azure application
       */
      clientId: string;
      /**
       * The created `client secret` for this registered Azure application
       */
      clientSecret: string;
      /**
       * Directory (`tenant`) ID from your registered Azure application
       */
      tenantId: string;
    }

    interface MsSqlNtlmAuthenticationConfig extends MsSqlConnectionConfigBase {
      type: 'ntlm';
      /**
       * Once you set domain for ntlm authentication type, driver will connect to SQL Server using domain login.
       *
       * This is necessary for forming a connection using ntlm type
       */
      domain: string;
      userName: string;
      password: string;
    }

    type MsSqlConnectionConfig =
      | MsSqlDefaultAuthenticationConfig
      | MsSqlNtlmAuthenticationConfig
      | MsSqlAzureActiveDirectoryAccessTokenAuthenticationConfig
      | MsSqlAzureActiveDirectoryMsiAppServiceAuthenticationConfig
      | MsSqlAzureActiveDirectoryMsiVmAuthenticationConfig
      | MsSqlAzureActiveDirectoryPasswordAuthenticationConfig
      | MsSqlAzureActiveDirectoryServicePrincipalSecretConfig;

    // Config object for tedious: see http://tediousjs.github.io/tedious/api-connection.html
    interface MsSqlConnectionConfigBase {
      type?: MsSqlAuthenticationTypeOptions;

      driver?: string;
      userName?: string; // equivalent to knex "user"
      password?: string;
      server: string; // equivalent to knex "host"
      port?: number;
      domain?: string;
      database: string;
      connectionTimeout?: number;
      requestTimeout?: number;
      stream?: boolean;
      parseJSON?: boolean;
      expirationChecker?(): boolean;
      options?: Readonly<{
        encrypt?: boolean;
        instanceName?: string;
        useUTC?: boolean;
        tdsVersion?: string;
        appName?: string;
        abortTransactionOnError?: boolean;
        trustedConnection?: boolean;
        enableArithAbort?: boolean;
        isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE' | 'SNAPSHOT';
        maxRetriesOnTransientErrors?: number;
        multiSubnetFailover?: boolean;
        packetSize?: number;
        trustServerCertificate?: boolean;
        mapBinding?: (value: any) => { value: any; type: any } | undefined;
      }>;
      pool?: Readonly<{
        min?: number;
        max?: number;
        idleTimeoutMillis?: number;
        maxWaitingClients?: number;
        testOnBorrow?: boolean;
        acquireTimeoutMillis?: number;
        fifo?: boolean;
        priorityRange?: number;
        autostart?: boolean;
        evictionRunIntervalMillis?: number;
        numTestsPerRun?: number;
        softIdleTimeoutMillis?: number;
        Promise?: any;
      }>;
    }

    // Config object for mariasql: https://github.com/mscdex/node-mariasql#client-methods
    interface MariaSqlConnectionConfig {
      user?: string;
      password?: string;
      host?: string;
      port?: number;
      unixSocket?: string;
      protocol?: string;
      db?: string;
      keepQueries?: boolean;
      multiStatements?: boolean;
      connTimeout?: number;
      pingInterval?: number;
      secureAuth?: boolean;
      compress?: boolean;
      ssl?: boolean | MariaSslConfiguration;
      local_infile?: boolean;
      read_default_file?: string;
      read_default_group?: string;
      charset?: string;
      streamHWM?: number;
      expirationChecker?(): boolean;
    }

    interface MariaSslConfiguration {
      key?: string;
      cert?: string;
      ca?: string;
      capath?: string;
      cipher?: string;
      rejectUnauthorized?: boolean;
      expirationChecker?(): boolean;
    }

    // Config object for mysql: https://github.com/mysqljs/mysql#connection-options
    interface MySqlConnectionConfig {
      host?: string;
      port?: number;
      localAddress?: string;
      socketPath?: string;
      user?: string;
      password?: string;
      database?: string;
      charset?: string;
      timezone?: string;
      connectTimeout?: number;
      stringifyObjects?: boolean;
      insecureAuth?: boolean;
      typeCast?: any;
      queryFormat?: (query: string, values: any) => string;
      supportBigNumbers?: boolean;
      bigNumberStrings?: boolean;
      dateStrings?: boolean;
      debug?: boolean;
      trace?: boolean;
      multipleStatements?: boolean;
      flags?: string;
      ssl?: string | MariaSslConfiguration;
      decimalNumbers?: boolean;
      expirationChecker?(): boolean;
    }

    // Config object for mysql2: https://github.com/sidorares/node-mysql2/blob/master/lib/connection_config.js
    // Some options for connection pooling and MySQL server API are excluded.
    interface MySql2ConnectionConfig extends MySqlConnectionConfig {
      authPlugins?: {
        [pluginName: string]: (pluginMetadata: any) => (pluginData: any) => any;
      };
      authSwitchHandler?: (data: any, callback: () => void) => any;
      charsetNumber?: number;
      compress?: boolean;
      connectAttributes?: { [attrNames: string]: any };
      enableKeepAlive?: boolean;
      keepAliveInitialDelay?: number;
      maxPreparedStatements?: number;
      namedPlaceholders?: boolean;
      nestTables?: boolean | string;
      passwordSha1?: string;
      rowsAsArray?: boolean;
      stream?: boolean | ((opts: any) => Stream) | Stream;
      uri?: string;
    }

    interface OracleDbConnectionConfig {
      host: string;
      user: string;
      password?: string;
      database?: string;
      domain?: string;
      instanceName?: string;
      debug?: boolean;
      requestTimeout?: number;
      connectString?: string;
      expirationChecker?(): boolean;
    }

    // Config object for pg: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts
    interface PgConnectionConfig {
      user?: string;
      database?: string;
      password?: string | (() => string | Promise<string>);
      port?: number;
      host?: string;
      connectionString?: string;
      keepAlive?: boolean;
      stream?: stream.Duplex;
      statement_timeout?: false | number;
      parseInputDatesAsUTC?: boolean;
      ssl?: boolean | ConnectionOptions;
      query_timeout?: number;
      keepAliveInitialDelayMillis?: number;
      idle_in_transaction_session_timeout?: number;
      application_name?: string;
      connectionTimeoutMillis?: number;
      types?: PgCustomTypesConfig;
      options?: string;
    }

    type PgGetTypeParser = (oid: number, format: string) => any;

    interface PgCustomTypesConfig {
      getTypeParser: PgGetTypeParser;
    }

    type RedshiftConnectionConfig = PgConnectionConfig;

    /** Used with SQLite3 adapter */
    interface Sqlite3ConnectionConfig {
      filename: string;
      flags?: string[];
      debug?: boolean;
      expirationChecker?(): boolean;
    }

    interface SocketConnectionConfig {
      socketPath: string;
      user: string;
      password: string;
      database: string;
      debug?: boolean;
      expirationChecker?(): boolean;
    }

    interface PoolConfig {
      name?: string;
      afterCreate?: Function;
      min?: number;
      max?: number;
      refreshIdle?: boolean;
      idleTimeoutMillis?: number;
      reapIntervalMillis?: number;
      returnToHead?: boolean;
      priorityRange?: number;
      log?: (message: string, logLevel: string) => void;

      // tarn configs
      propagateCreateError?: boolean;
      createRetryIntervalMillis?: number;
      createTimeoutMillis?: number;
      destroyTimeoutMillis?: number;
      acquireTimeoutMillis?: number;
    }

    type LogFn = (message: any) => void;

    interface Logger {
      warn?: LogFn;
      error?: LogFn;
      debug?: LogFn;
      inspectionDepth?: number;
      enableColors?: boolean;
      deprecate?: (method: string, alternative: string) => void;
    }

    interface Migration {
      up: (knex: Knex) => PromiseLike<any>;
      down?: (knex: Knex) => PromiseLike<any>;
    }

    interface MigrationSource<TMigrationSpec> {
      getMigrations(loadExtensions: readonly string[]): Promise<TMigrationSpec[]>;
      getMigrationName(migration: TMigrationSpec): string;
      getMigration(migration: TMigrationSpec): Promise<Migration>;
    }

    interface MigratorConfig {
      database?: string;
      directory?: string | readonly string[];
      extension?: string;
      stub?: string;
      tableName?: string;
      schemaName?: string;
      disableTransactions?: boolean;
      disableMigrationsListValidation?: boolean;
      sortDirsSeparately?: boolean;
      loadExtensions?: readonly string[];
      migrationSource?: MigrationSource<unknown>;
      name?: string;
    }

    interface Migrator {
      make(name: string, config?: MigratorConfig): Promise<string>;
      latest(config?: MigratorConfig): Promise<any>;
      rollback(config?: MigratorConfig, all?: boolean): Promise<any>;
      status(config?: MigratorConfig): Promise<number>;
      currentVersion(config?: MigratorConfig): Promise<string>;
      list(config?: MigratorConfig): Promise<any>;
      up(config?: MigratorConfig): Promise<any>;
      down(config?: MigratorConfig): Promise<any>;
      forceFreeMigrationsLock(config?: MigratorConfig): Promise<any>;
    }

    interface Seed {
      seed: (knex: Knex) => PromiseLike<void>;
    }

    interface SeedSource<TSeedSpec> {
      getSeeds(config: SeederConfig): Promise<TSeedSpec[]>;
      getSeed(seed: TSeedSpec): Promise<Seed>;
    }

    interface SeederConfig<V extends {} = any> {
      extension?: string;
      directory?: string | readonly string[];
      loadExtensions?: readonly string[];
      specific?: string;
      timestampFilenamePrefix?: boolean;
      recursive?: boolean;
      sortDirsSeparately?: boolean;
      stub?: string;
      variables?: V;
      seedSource?: SeedSource<unknown>;
    }

    class Seeder {
      constructor(knex: Knex);
      setConfig(config: SeederConfig): SeederConfig;
      run(config?: SeederConfig): Promise<[string[]]>;
      make(name: string, config?: SeederConfig): Promise<string>;
    }

    interface FunctionHelper {
      now(precision?: number): Raw;
      uuidToBin(uuid: string, ordered?: boolean): Buffer;
      binToUuid(bin: Buffer, ordered?: boolean): string;
    }

    interface EnumOptions {
      useNative: boolean;
      existingType?: boolean;
      schemaName?: string;
      enumName: string;
    }

    interface DefaultToOptions {
      // only supported by mssql driver
      constraintName?: string;
    }

    class Client extends events.EventEmitter {
      constructor(config: Config);
      config: Config;
      dialect: string;
      driverName: string;
      connectionSettings: object;

      acquireRawConnection(): Promise<any>;
      destroyRawConnection(connection: any): Promise<void>;
      validateConnection(connection: any): Promise<boolean>;
      logger: Logger;
      version?: string;
      connectionConfigProvider: any;
      connectionConfigExpirationChecker: null | (() => boolean);
      valueForUndefined: any;
      formatter(builder: any): any;
      queryBuilder(): QueryBuilder;
      queryCompiler(builder: any): any;
      schemaBuilder(): SchemaBuilder;
      schemaCompiler(builder: SchemaBuilder): any;
      tableBuilder(type: any, tableName: any, tableNameLike: any, fn: any): TableBuilder;
      tableCompiler(tableBuilder: any): any;
      columnBuilder(tableBuilder: any, type: any, args: any): ColumnBuilder;
      columnCompiler(tableBuilder: any, columnBuilder: any): any;
      runner(builder: any): any;
      transaction(container: any, config: any, outerTx: any): Transaction;
      raw(...args: any[]): any;
      ref(...args: any[]): Ref<any, any>;
      query(connection: any, obj: any): any;
      stream(connection: any, obj: any, stream: any, options: any): any;
      prepBindings(bindings: any): any;
      positionBindings(sql: any): any;
      postProcessResponse(resp: any, queryContext: any): any;
      wrapIdentifier(value: any, queryContext: any): any;
      customWrapIdentifier(value: any, origImpl: any, queryContext: any): any;
      wrapIdentifierImpl(value: any): string;
      initializeDriver(): void;
      driver: any;
      poolDefaults(): { min: number; max: number; propagateCreateError: boolean };
      getPoolSettings(poolConfig: any): any;
      initializePool(config?: {}): void;
      pool: tarn.Pool<any> | undefined;
      acquireConnection(): any;
      releaseConnection(connection: any): any;
      destroy(callback: any): any;
      database(): any;
      canCancelQuery: boolean;
      assertCanCancelQuery(): void;
      cancelQuery(): void;
    }
  }

  export default knex;
}
