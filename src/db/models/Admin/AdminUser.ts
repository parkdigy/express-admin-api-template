/********************************************************************************************************************
 * 어드민 사용자 Table
 ********************************************************************************************************************/

import { Knex } from 'knex';
import { type TableInsertData, type TableUpdateData } from '../@types';

export interface TAdminUser {
  /** Primary Key */
  id: number; // ID // AI, int
  /** Others */
  name: string; // 이름 // max:50
  email: string; // 이메일 // max:50
  password: string; // 비밀번호 // max:255
  tel: string; // 전화번호 // max:20
  must_password_change: boolean; // 접속 시 비밀번호 강제 변경 여부 // default:true
  is_lock: boolean; // 잠금 여부 // default:false
  login_fail_count: number; // 로그인 실패 횟수 // default:0
  remember_token: string | null; // max:100
  create_date: Date; // 등록일자
  update_date: Date; // 수정일자
}

export type TAdminUser$InsertData = TableInsertData<
  TAdminUser,
  'id' | 'must_password_change' | 'is_lock' | 'login_fail_count' | 'remember_token'
>;
export type TAdminUser$UpdateData = TableUpdateData<TAdminUser, 'id' | 'email', 'update_date'>;

export type { TAdminUser as default };

declare module 'knex/types/tables' {
  interface Tables {
    admin_user: Knex.CompositeTableType<TAdminUser, TAdminUser$InsertData, TAdminUser$UpdateData>;
  }
}
