/********************************************************************************************************************
 * camelCase
 * ******************************************************************************************************************/

function camelCase<T extends string>(str: T): CamelCase<T> {
  const result = str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) as CamelCase<T>;
  return (result.charAt(0).toUpperCase() + result.slice(1)) as CamelCase<T>;
}

/********************************************************************************************************************
 * Types
 * ******************************************************************************************************************/

type CamelCase<S extends PropertyKey> = S extends string
  ? S extends `${infer T}_${infer U}`
    ? `${Capitalize<Lowercase<T>>}${CamelCase<U>}`
    : Capitalize<Lowercase<S>>
  : S;

type TItem = readonly [string, any];
type TItemWithAlias = readonly [string | number, any, any];
type TItems = readonly TItem[] | readonly TItemWithAlias[];

type ItemToNameListItem<Name extends string, T extends TItems> = {
  [K in Name]: T[0];
} & {
  name: T[1];
};

type ItemsToNameListUnionArray<Name extends string, Items extends TItems> = {
  [K in keyof Items]: Items[K] extends TItem | TItemWithAlias ? ItemToNameListItem<Name, Items[K]> : never;
}[number][];

type MakeFinalItems<Items extends TItems> = {
  [K in keyof Items]: Items[K] extends TItemWithAlias
    ? Items[K]
    : [Items[K][0], Items[K][1], Items[K][0] extends string ? CamelCase<Items[K][0]> : never];
}[number][];

/********************************************************************************************************************
 * __makeConst
 * ******************************************************************************************************************/

export function __makeConst<
  const Name extends string,
  const Value extends string | number,
  const ValueName extends string,
  const Alias extends string,
  const Items extends readonly (readonly [Value, ValueName, Alias])[],
  List = Items[number][0][],
  NameList = ItemsToNameListUnionArray<Name, Items>,
>(name: Name, items: Items) {
  const aliasValueMap = items.reduce(
    (acc, [value, , alias]) => {
      acc[alias] = value;
      return acc;
    },
    {} as Record<Alias, Value>
  ) as {
    [K in Items[number][2]]: Extract<Items[number] & [Value, ValueName, K], [Value, ValueName, K]>[0];
  };

  const valueNameMap = items.reduce(
    (acc, [value, valueName]) => {
      acc[value] = valueName;
      return acc;
    },
    {} as Record<Value, ValueName>
  ) as {
    [K in Items[number][0]]: Extract<Items[number] & [K, ValueName, Alias], [K, ValueName, Alias]>[1];
  };

  const list = Object.values(aliasValueMap);

  const nameList = items.map((item) => ({ [name]: item[0], name: item[1] }));

  return {
    ...aliasValueMap,

    getList(copy = false): List {
      return (copy ? [...list] : list) as List;
    },

    getNameList(): NameList {
      return nameList.map((item) => ({ ...item })) as any;
    },

    getName<T extends keyof typeof valueNameMap>(value: T) {
      return valueNameMap[value];
    },
  };
}

/********************************************************************************************************************
 * _makeConst
 * ******************************************************************************************************************/

function _makeConst<
  const Name extends string,
  const StringValue extends string,
  const NumberValue extends number,
  const ValueName extends string,
  const Alias extends string | undefined,
  const Items extends
    | readonly (readonly [StringValue, ValueName])[]
    | readonly (readonly [StringValue | NumberValue, ValueName, Alias])[],
  const FinalItems extends MakeFinalItems<Items>,
>(name: Name, items: Items) {
  const finalItems = items.map((item) => {
    if (item.length === 2) {
      return [item[0], item[1], camelCase(item[0])];
    } else {
      return item;
    }
  }) as FinalItems;

  return __makeConst(name, finalItems);
}

/********************************************************************************************************************
 * declare global
 * ******************************************************************************************************************/

declare global {
  var makeConst: typeof _makeConst;

  type MakeConst<T> = ValueOf<{ [K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K] }>;
}

globalThis.makeConst = _makeConst;

export {};
