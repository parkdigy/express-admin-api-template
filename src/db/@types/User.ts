import { type MakeType, makeType } from '@db_common';

/********************************************************************************************************************
 * 회원 상태
 * ******************************************************************************************************************/

export const UserStatus = makeType('status', [
  ['ON', '사용'],
  ['OFF', '미사용'],
  ['LOCK', '잠금'],
]);
export type UserStatus = MakeType<typeof UserStatus>;
