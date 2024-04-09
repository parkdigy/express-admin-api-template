/********************************************************************************************************************
 * 회원 Table
 * ******************************************************************************************************************/

import { Knex } from 'knex';
import { makeEnum } from '../@util';
import { TableInsertData, TableUpdateData } from '../@types';

/** 상태 */
const Status = { ON: '사용', OFF: '미사용' };
export type TTestData$Status = keyof typeof Status;
export const TTestData$Status = makeEnum('status', Status);

export interface TTestData {
  /** Primary Key */
  id: number; // ID // AI, int
  /** Others */
  text: string; // 텍스트 // varchar(100)
  email: string; // 이메일 // UQ, varchar(100)
  tel: string; // 전화번호 // varchar(15)
  mobile: string; // 휴대폰번호 // varchar(15)
  url: string; // URL // varchar(500)
  company_num: string; // 사업자번호 // varchar(10)
  personal_num: string; // 주민등록번호 // varchar(13)
  num_int: number; // 숫자 // int
  num_float: number; // 소수 // decimal(10,2)
  bool: boolean; // 불리언 // tinyint(1)
  date: Date; // 날짜 // date
  datetime: Date; // 날짜시간 // datetime
  text_array: string; // 텍스트 배열 // json
  status: TTestData$Status; // 상태
  create_date: Date; // 등록일자
  update_date: Date; // 수정일자
}

export type TTestData$InsertData = TableInsertData<TTestData, 'id'>;
export type TTestData$UpdateData = TableUpdateData<TTestData, 'id' | 'create_date', 'update_date'>;

export default TTestData;

declare module 'knex/types/tables' {
  interface Tables {
    test_data: Knex.CompositeTableType<TTestData, TTestData$InsertData, TTestData$UpdateData>;
  }
}

// 데이터 생성 스크립트
// setTimeout(async () => {
//   try {
//     const randomRange = (min: number, max: number) => {
//       return Math.floor(Math.random() * (max - min + 1)) + min;
//     };
//
//     const randomNumber = (length: number) => {
//       return Math.random()
//         .toString()
//         .slice(2, 2 + length);
//     };
//
//     const randomText = (length: number, useSpace = false, useUpperCase = false) => {
//       const characters =
//         useSpace && useUpperCase
//           ? 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789'
//           : useSpace
//             ? 'abcdefghijklmnopqrstuvwxyz 0123456789'
//             : useUpperCase
//               ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789'
//               : 'abcdefghijklmnopqrstuvwxyz0123456789';
//       const charactersLength = characters.length;
//       return new Array(length)
//         .fill(0)
//         .map(() => characters.charAt(Math.floor(Math.random() * charactersLength)))
//         .join('');
//     };
//
//     for (let i = 0; i < 374; i += 1) {
//       ll(i);
//
//       await db.TestData.add({} as any, {
//         text: randomText(randomRange(10, 30), true, true).trim(),
//         email: `${randomText(randomRange(4, 8))}@${randomText(randomRange(5, 10))}.com`,
//         tel: `02${randomNumber(randomRange(3, 4))}${randomNumber(4)}`,
//         mobile: `010${randomNumber(4)}${randomNumber(4)}`,
//         url: `https://${randomText(randomRange(3, 10))}.com`,
//         company_num: `${randomNumber(3)}${randomNumber(2)}${randomNumber(5)}`,
//         personal_num: `${randomNumber(6)}${randomNumber(7)}`,
//         num_int: randomRange(0, 9999999),
//         num_float: Number(`${randomRange(0, 9999999)}.${randomRange(1, 99)}`),
//         bool: Math.random() > 0.5,
//         date: new Date(2024, randomRange(0, 11), randomRange(1, 28)),
//         datetime: new Date(2024, randomRange(0, 11), randomRange(1, 28), randomRange(0, 23), randomRange(0, 59)),
//         text_array: JSON.stringify(new Array(randomRange(1, 5)).fill(0).map(() => randomText(randomRange(3, 10)))),
//         status: Math.random() > 0.5 ? 'ON' : 'OFF',
//         create_date: now(),
//         update_date: now(),
//       });
//     }
//
//     ll('done');
//   } catch (e) {
//     console.error(e);
//   }
// }, 1000);
