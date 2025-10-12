/********************************************************************************************************************
 * 어드민 사용자 사용 로그 Controller
 * ******************************************************************************************************************/
import { AdminUserAccessLogListParam } from './AdminUserAccessLog.types';
import { Param_Id_String_Required, Param_Page_Limit, Param_String_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyAuthRequest, res: MyResponse) {
    const { page, limit } = param(req, Param_Page_Limit());
    const { keyword_option, keyword, type, search_date_from, search_date_to } = param(req, AdminUserAccessLogListParam);

    const { data, paging } = await db.AdminUserAccessLog.list(
      req,
      search_date_from,
      search_date_to,
      keyword_option,
      keyword,
      type
    ).paginate(page, limit);

    api.success(res, data, paging);
  },

  /********************************************************************************************************************
   * 목록 엑셀 다운로드
   * ******************************************************************************************************************/
  async exportList(req: MyAuthRequest, res: MyResponse) {
    const { keyword_option, keyword, type, search_date_from, search_date_to } = param(req, AdminUserAccessLogListParam);

    const list = await db.AdminUserAccessLog.list(req, search_date_from, search_date_to, keyword_option, keyword, type);

    excel.export(res, `접근_통계_${dayjs().format('YYYYMMDD')}.xlsx`, list, [
      excel.newColumn('이메일', 'email', 20, 'l'),
      excel.newColumn('구분', 'type', 10, 'c', (v) => db.AdminUserAccessKey.Type.getName(v)),
      excel.newColumn('화면', 'title', 40, 'l'),
      excel.newColumn('URL', 'url', 50, 'l'),
      excel.newColumn('접근시간', 'create_date', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
    ]);
  },

  /********************************************************************************************************************
   * 등록
   * ******************************************************************************************************************/
  async add(req: MyAuthRequest, res: MyResponse) {
    const { id, url } = param(req, Param_Id_String_Required(), { url: Param_String_Required() });

    let result: 'NOTFOUND' | 'SUCCESS' | 'PASSWORD_RESET' = 'NOTFOUND';
    if (req.$$user.must_password_change) {
      if (url === '/admin/password') {
        result = 'SUCCESS';
      } else {
        result = 'PASSWORD_RESET';
      }
    } else {
      if (id.split('/')[0] === '_template') {
        result = 'SUCCESS';
      } else {
        if (await db.AdminUserAccessKey.exists(req, { id })) {
          if (process.env.APP_ENV !== 'local') {
            await db.AdminUserAccessLog.addWithCreateDate(req, {
              admin_user_id: req.$$user.id,
              admin_user_access_key_id: id,
              url,
            });
          }

          result = 'SUCCESS';
        }
      }
    }

    let redirect = undefined;

    switch (result) {
      case 'NOTFOUND':
        redirect = '/dashboard';
        break;
      case 'PASSWORD_RESET':
        redirect = '/admin/password';
        break;
    }

    api.success(res, result, undefined, redirect);
  },
};
