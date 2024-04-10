/********************************************************************************************************************
 * 내 정보 Controller
 * ******************************************************************************************************************/

import { MyRequest, MyResponse } from '@types';
import { Param_Password_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 비밀번호 변경
   * ******************************************************************************************************************/
  async passwordChange(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.Error.Permission;

    const { id: userId, must_password_change: mustPasswordChange } = req.$$user;

    const { new_password } = param(req, { new_password: Param_Password_Required() });

    await db.AdminUser.edit(
      req,
      {
        password: util.password.hash(new_password),
        must_password_change: false,
        update_date: now(),
      },
      { id: userId }
    );

    api.successMsg(res, '비밀번호가 변경되었습니다.', undefined, mustPasswordChange ? '/' : undefined);
  },

  /********************************************************************************************************************
   * API 호출 권한 등록
   * ******************************************************************************************************************/
  async apiCallPermission(req: MyRequest, res: MyResponse) {
    const { password } = param(req, { password: Param_Password_Required() });

    const info = await db.AdminUser.getBuilder(req).where('id', req.$$user?.id).select('password').first();
    if (!info) throw api.newExceptionError();

    if (!util.password.check(password, info.password)) {
      throw api.newExceptionError('비밀번호가 일치하지 않습니다.');
    }

    req.session.$$apiCallPermissionTime = now().getTime();

    api.success(res);
  },
};
