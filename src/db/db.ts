import { MySqlKnexUtil } from './knex';
import * as query from './query';

const db = {
  ...MySqlKnexUtil,

  /** Admin */
  AdminGroup: new query.AdminGroup(),
  AdminGroupMenu: new query.AdminGroupMenu(),
  AdminGroupUser: new query.AdminGroupUser(),
  AdminMenu: new query.AdminMenu(),
  AdminUser: new query.AdminUser(),
  AdminUserAccessKey: new query.AdminUserAccessKey(),
  AdminUserAccessLog: new query.AdminUserAccessLog(),
  AdminUserActivity: new query.AdminUserActivity(),
  AdminUserLoginLog: new query.AdminUserLoginLog(),
  AdminPrivacyAccessLog: new query.AdminPrivacyAccessLog(),

  /** User */
  User: new query.User(),

  /** Test */
  TestData: new query.TestData(),
};

export default db;
