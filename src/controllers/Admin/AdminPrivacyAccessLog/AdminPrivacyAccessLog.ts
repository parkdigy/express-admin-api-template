import { Param_Page_Limit } from '@common_param';
import { AdminPrivacyAccessLogListParams } from './AdminPrivacyAccessLog.types';

export default {
  /********************************************************************************************************************
   * 구분 목록
   * ******************************************************************************************************************/
  typeList(req: MyRequest, res: MyResponse) {
    api.success(res, db.AdminPrivacyAccessLog.Type.getNameList());
  },

  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.Error.Permission;

    const { page, limit } = param(req, Param_Page_Limit());
    const options = param(req, AdminPrivacyAccessLogListParams);

    if (!req.$$user.is_super_admin) {
      options.admin_user_id = req.$$user.id;
    }

    const { data, paging } = await db.AdminPrivacyAccessLog.list(req, options).paginate(page, limit);

    api.success(
      res,
      data.map((info) => ({ ...info, type_name: db.AdminPrivacyAccessLog.Type.getName(info.type) })),
      paging
    );
  },

  /********************************************************************************************************************
   * 목록 엑셀 다운로드
   * ******************************************************************************************************************/
  async exportList(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.Error.Permission;

    const options = param(req, AdminPrivacyAccessLogListParams);

    if (!req.$$user.is_super_admin) {
      options.admin_user_id = req.$$user.id;
    }

    const list = await db.AdminPrivacyAccessLog.list(req, options);

    excel.export(res, `개인정보조회로그_${dayjs().format('YYYYMMDD')}.xlsx`, list, [
      excel.newColumn('ID', 'id', 10, 'c'),
      excel.newColumn('조회 관리자', 30, 'c', (info) => `(${info.admin_user_id}) ${info.admin_user_name}`),
      excel.newColumn('구분', 50, 'l', (info) => db.AdminPrivacyAccessLog.Type.getName(info.type)),
      excel.newColumn('사유', 'reason', 50, 'l'),
      excel.newColumn('참조 ID', 20, 'c', (info) => (info.parent_id === 0 ? '' : info.parent_id)),
      excel.newColumn('조회일자', 'create_date', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
    ]);
  },
};
