declare module 'knex/types/result' {
  interface Registry {
    Count: number; // count, countDistinct 의 결과 타입을 number 로 지정
  }
}
