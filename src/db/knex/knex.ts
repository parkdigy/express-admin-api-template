import Knex from 'knex';

const knex = Knex({
  client: process.env.DB_CONNECTION,
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: process.env.DB_CHARSET || 'utf8',

    // MSSQL
    options: {
      useUTC: false, // MSSQL 일 경우 반드시 추가해야 UTC 시간으로 저장되지 않음
    },

    // MYSQL
    typeCast: function (field: { type: string; length: number }, next: () => string) {
      let value: unknown = next();

      switch (field.type) {
        // case 'DATE': // DATE 형을 'YYYY-MM-DD' 형식으로 변환
        //   if (value) {
        //     value = dayjs(value as Date).format('YYYY-MM-DD');
        //   }
        //   break;
        // case 'TIMESTAMP': // TIMESTAMP, DATETIME 형을 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
        // case 'DATETIME':
        //   if (value) {
        //     value = dayjs(value as Date).format('YYYY-MM-DD HH:mm:ss');
        //   }
        //   break;
        case 'TINY': // TINYINT(1) 형을 boolean 형식으로 변환
          if (field.length === 1) {
            value = value === null ? null : !!value;
          }
          break;
      }
      return value;
    },
  },
  pool: { min: 0, max: 7 },
});

export default knex;
