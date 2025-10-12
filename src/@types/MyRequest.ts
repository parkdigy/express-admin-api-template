import { Request } from 'express';
import { Knex } from 'knex';

export interface MyRequestUser {
  id: number;
  email: string;
  admin_group_id: number;
  is_super_admin: boolean;
  must_password_change: boolean;
  is_privacy_access: boolean;
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
