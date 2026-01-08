import { type Request } from 'express';
import { Knex } from 'knex';

export interface MyRequestUser {
  id: number;
  email: string;
}

interface MyRequestCommon extends Request {
  $$remoteIpAddress?: string;
  $$dbTransMySql?: Knex.Transaction[];
  $$dbTransMsSql?: Knex.Transaction[];
}

export interface MyRequest extends MyRequestCommon {
  $$user?: MyRequestUser;
}

export interface MyAuthRequest extends MyRequestCommon {
  $$user: MyRequestUser;
}
