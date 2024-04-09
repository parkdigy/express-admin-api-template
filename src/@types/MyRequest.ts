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

export interface MyRequest extends Request {
  $$remoteIpAddress?: string;
  $$dbTransMySql?: Knex.Transaction[];
  $$dbTransMsSql?: Knex.Transaction[];
  $$user?: MyRequestUser;
}
