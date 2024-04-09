/********************************************************************************************************************
 * 어드민 사용자 로그인 로그 Controller
 * ******************************************************************************************************************/

import { MyRequest, MyResponse } from '@types';
import { AdminUserLoginLogListParam } from './AdminUserLoginLog.types';
import { Param_Page_Limit } from '@common_param';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.newExceptionError();

    const { page, limit } = param(req, Param_Page_Limit());

    const { keyword_option, keyword, login_date_from, login_date_to } = param(req, AdminUserLoginLogListParam);

    const { data, paging } = await db.AdminUserLoginLog.list(
      req,
      req.$$user.id,
      true,
      login_date_from,
      login_date_to,
      keyword_option,
      keyword
    ).paginate(page, limit);

    return api.success(res, data, paging);
  },

  /********************************************************************************************************************
   * 목록 엑셀 다운로드
   * ******************************************************************************************************************/
  async exportList(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.newExceptionError();

    const { keyword_option, keyword, login_date_from, login_date_to } = param(req, AdminUserLoginLogListParam);

    const list = await db.AdminUserLoginLog.list(
      req,
      req.$$user.id,
      true,
      login_date_from,
      login_date_to,
      keyword_option,
      keyword
    );

    excel.export(res, `로그인_로그_${dayjs().format('YYYYMMDD')}.xlsx`, list, [
      excel.newColumn('이메일', 'email', 30, 'l'),
      excel.newColumn('이름', 'name', 20, 'c'),
      excel.newColumn('로그인시간', 'create_date', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
      excel.newColumn('IP', 'ip_address', 20, 'c'),
      excel.newColumn('Location', 30, 'c', (info) =>
        info.ip_country === 'Unknown' ? info.ip_country : `${info.ip_city}, ${info.ip_country}`
      ),
    ]);
  },
};
