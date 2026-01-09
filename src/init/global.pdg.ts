import type {
  ValueOf as _ValueOf,
  Dict as _Dict,
  Arr as _Arr,
  IsObject as _IsObject,
  IsArray as _IsArray,
  ObjectMerge as _ObjectMerge,
  ArrayMerge as _ArrayMerge,
  PartialPick as _PartialPick,
  PartialOmit as _PartialOmit,
  RequiredPick as _RequiredPick,
  RequiredOmit as _RequiredOmit,
} from '@pdg/types';
import {
  empty as _empty,
  notEmpty as _notEmpty,
  equal as _equal,
  contains as _contains,
  ifEmpty as _ifEmpty,
  ifNotEmpty as _ifNotEmpty,
  ifNull as _ifNull,
  ifNotNull as _ifNotNull,
  ifUndefined as _ifUndefined,
  ifNotUndefined as _ifNotUndefined,
  ifNullOrUndefined as _ifNullOrUndefined,
  ifNotNullAndUndefined as _ifNotNullAndUndefined,
} from '@pdg/compare';
import { now as _now, nowJs as _nowJs, nowTime as _nowTime } from '@pdg/date-time';
import { lv as _lv, vl as _vl, copy as _copy, makeConst as _makeConst } from '@pdg/data';

declare global {
  /** types */
  type ValueOf<T> = _ValueOf<T>;
  type Dict<T = unknown> = _Dict<T>;
  type Arr<T = unknown> = _Arr<T>;
  type IsObject<T> = _IsObject<T>;
  type IsArray<T> = _IsArray<T>;
  type ObjectMerge<T> = _ObjectMerge<T>;
  type ArrayMerge<A extends any[]> = _ArrayMerge<A>;
  type PartialPick<T, K extends keyof T> = _PartialPick<T, K>;
  type PartialOmit<T, K extends keyof T> = _PartialOmit<T, K>;
  type RequiredPick<T, K extends keyof T> = _RequiredPick<T, K>;
  type RequiredOmit<T, K extends keyof T> = _RequiredOmit<T, K>;

  /** compare */
  var empty: typeof _empty;
  var notEmpty: typeof _notEmpty;
  var equal: typeof _equal;
  var contains: typeof _contains;
  var ifEmpty: typeof _ifEmpty;
  var ifNotEmpty: typeof _ifNotEmpty;
  var ifNull: typeof _ifNull;
  var ifNotNull: typeof _ifNotNull;
  var ifUndefined: typeof _ifUndefined;
  var ifNotUndefined: typeof _ifNotUndefined;
  var ifNullOrUndefined: typeof _ifNullOrUndefined;
  var ifNotNullAndUndefined: typeof _ifNotNullAndUndefined;

  /** date */
  var now: typeof _now;
  var nowJs: typeof _nowJs;
  var nowTime: typeof _nowTime;

  /** data */
  var lv: typeof _lv;
  var vl: typeof _vl;
  var copy: typeof _copy;
  var makeConst: typeof _makeConst;
}

/** compare */
globalThis.empty = _empty;
globalThis.notEmpty = _notEmpty;
globalThis.equal = _equal;
globalThis.contains = _contains;
globalThis.ifEmpty = _ifEmpty;
globalThis.ifNotEmpty = _ifNotEmpty;
globalThis.ifNull = _ifNull;
globalThis.ifNotNull = _ifNotNull;
globalThis.ifUndefined = _ifUndefined;
globalThis.ifNotUndefined = _ifNotUndefined;
globalThis.ifNullOrUndefined = _ifNullOrUndefined;
globalThis.ifNotNullAndUndefined = _ifNotNullAndUndefined;

/** date */
globalThis.now = _now;
globalThis.nowJs = _nowJs;
globalThis.nowTime = _nowTime;

/** data */
globalThis.lv = _lv;
globalThis.vl = _vl;
globalThis.copy = _copy;
globalThis.makeConst = _makeConst;

export {};
