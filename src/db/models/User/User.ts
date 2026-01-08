/********************************************************************************************************************
 * 회원 Table
 * ******************************************************************************************************************/

import { Knex } from 'knex';
import { makeEnum } from '../@util';
import { type TableInsertData, type TableUpdateData } from '../@types';

/** 상태 */
const Status = { ON: '사용', OFF: '미사용', LOCK: '잠금' };
export type TUser$Status = keyof typeof Status;
export const TUser$Status = makeEnum('status', Status);

export interface TUser {
  /** Primary Key */
  id: number; // ID // AI, int
  /** Others */
  email: string; // 이메일 // max:100
  password: string; // 비밀번호 // max:500
  login_fail_count: number; // 로그인 실패 횟수 // int, default:0
  status: TUser$Status; // 상태 // default:ON
  create_date: Date; // 등록일자
  update_date: Date; // 수정일자
}

export type TUser$InsertData = TableInsertData<TUser, 'id', 'login_fail_count' | 'status'>;
export type TUser$UpdateData = TableUpdateData<TUser, 'id' | 'create_date', 'update_date'>;

export type { TUser as default };

declare module 'knex/types/tables' {
  interface Tables {
    user: Knex.CompositeTableType<TUser, TUser$InsertData, TUser$UpdateData>;
  }
}
