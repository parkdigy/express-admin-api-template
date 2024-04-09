/********************************************************************************************************************
 * 어드민 사용자 메뉴 Controller
 * ******************************************************************************************************************/

import { MyRequest, MyResponse } from '@types';
import { Param_Integer } from '@common_param';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.newExceptionError();

    const { admin_group_id, is_super_admin } = req.$$user;

    const list = await db.AdminMenu.listOfSession(req, is_super_admin, admin_group_id);

    api.success(res, list);
  },

  /********************************************************************************************************************
   * 그룹 수정용 목록
   * ******************************************************************************************************************/
  async listForGroupEdit(req: MyRequest, res: MyResponse) {
    const { admin_group_id } = param(req, { admin_group_id: Param_Integer() });

    const list = await db.AdminMenu.listForGroupEdit(req, admin_group_id);

    api.success(res, list);
  },
};
