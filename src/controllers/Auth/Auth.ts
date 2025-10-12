/********************************************************************************************************************
 * 관리자 인증 Controller
 * ******************************************************************************************************************/

import { Param_Email_Required, Param_Password_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 로그인 정보
   * ******************************************************************************************************************/
  getInfo(req: MyAuthRequest, res: MyResponse) {
    api.success(res, {
      email: req.$$user.email,
      is_super: req.$$user.is_super_admin,
    });
  },

  /********************************************************************************************************************
   * 로그인
   * ******************************************************************************************************************/
  async signIn(req: MyAuthRequest, res: MyResponse) {
    const { email, password } = param(req, { email: Param_Email_Required(), password: Param_Password_Required() });

    const userInfo = await db.AdminUser.infoForSignIn(req, email);
    if (!userInfo) throw api.newExceptionError('이메일 또는 비밀번호가 일치하지 않습니다.');
    if (userInfo.is_lock) throw api.newExceptionError('계정이 잠금 상태입니다.');

    if (!util.password.check(password, userInfo.password)) {
      const failCount = userInfo.login_fail_count + 1;
      if (failCount >= 5) {
        await db.AdminUser.edit(
          req,
          { login_fail_count: failCount, is_lock: true, update_date: now() },
          { id: userInfo.id }
        );

        throw api.newExceptionError('계정이 잠금 상태입니다.');
      } else {
        await db.AdminUser.edit(req, { update_date: now(), login_fail_count: failCount }, { id: userInfo.id });

        throw api.newExceptionError({
          text: '비밀번호가 일치하지 않습니다. :lockCount회 연속 실패 시 계정이 차단됩니다. 현재 :failCount회 실패 상태입니다.',
          html: '비밀번호가 일치하지 않습니다.<br/><b>:lockCount회</b> 연속 실패 시 계정이 차단됩니다.<br/>현재 <b>:failCount회</b> 실패 상태입니다.',
          replace: { lockCount: 5, failCount },
        });
      }
    }

    if (userInfo.login_fail_count > 0) {
      await db.AdminUser.edit(req, { login_fail_count: 0, update_date: now() }, { id: userInfo.id });
    }

    const ipAddress = req.$$remoteIpAddress || '';
    const ipInfo = notEmpty(ipAddress) ? await util.ip.info(ipAddress) : undefined;
    let ipCountry, ipCity;
    if (ipInfo) {
      ipCountry = ipInfo.country || 'Unknown';
      ipCity = ipInfo.city || 'Unknown';
    } else {
      ipCountry = 'Unknown';
      ipCity = 'Unknown';
    }

    await db.AdminUserLoginLog.add(req, {
      admin_user_id: userInfo.id,
      ip_address: ipAddress,
      ip_country: ipCountry,
      ip_city: ipCity,
      create_date: now(),
    });

    jwt.saveAccessToken(req, res, userInfo.id);

    api.success(
      res,
      {
        email: userInfo.email,
      },
      undefined,
      userInfo.must_password_change ? '/admin/password' : undefined
    );
  },

  /********************************************************************************************************************
   * 로그아웃
   * ******************************************************************************************************************/
  signOut(req: MyAuthRequest, res: MyResponse) {
    jwt.clearAccessToken(res);

    api.success(res);
  },
};
