import { MyRequest, MyResponse } from '@types';
import { Param_Boolean, Param_Id_Integer_Required, Param_Page_Limit, Param_String } from '@common_param';
import { TestDataAddEditParams, TestDataListParams } from '@controllers';
import { companyNoAutoDash, personalNoAutoDash, telNoAutoDash } from '@pdg/util';

export default {
  /********************************************************************************************************************
   * 데이터 상태 목록
   * ******************************************************************************************************************/
  dataStatusList(req: MyRequest, res: MyResponse) {
    api.success(res, db.TestData.Status.getNameList());
  },

  /********************************************************************************************************************
   * 데이터 목록
   * ******************************************************************************************************************/
  async dataList(req: MyRequest, res: MyResponse) {
    const { page, limit } = param(req, Param_Page_Limit());
    const options = param(req, TestDataListParams);

    const { data, paging } = await db.TestData.list(req, options).paginate(page, limit);

    const finalData = data.map((info) => ({
      ...info,
      email: util.masking.email(info.email),
      tel: util.masking.tel(info.tel),
      mobile: util.masking.tel(info.mobile),
      company_num: util.masking.companyNo(info.company_num),
      personal_num: util.masking.personalNo(info.personal_num),
      text_array: JSON.parse(info.text_array),
      status_name: db.TestData.Status.getName(info.status),
    }));

    api.success(res, finalData, paging);
  },

  /********************************************************************************************************************
   * 데이터 목록 엑셀 다운로드
   * ******************************************************************************************************************/
  async exportDataList(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.Error.Permission;

    const options = param(req, TestDataListParams);
    const { privacy_access, privacy_access_reason } = param(req, {
      privacy_access: Param_Boolean(),
      privacy_access_reason: Param_String(),
    });

    if (privacy_access) {
      if (empty(privacy_access_reason)) throw paramError('privacy_access_reason');
      await db.AdminPrivacyAccessLog.add(req, {
        admin_user_id: req.$$user.id,
        type: db.AdminPrivacyAccessLog.Type.TestExportList,
        reason: privacy_access_reason,
        parent_id: 0,
        create_date: now(),
      });
    }

    const list = await db.TestData.list(req, options);

    const finalList = list.map((info) =>
      privacy_access
        ? info
        : {
            ...info,
            email: util.masking.email(info.email),
            tel: util.masking.tel(info.tel),
            mobile: util.masking.tel(info.mobile),
            company_num: util.masking.companyNo(info.company_num),
            personal_num: util.masking.personalNo(info.personal_num),
          }
    );

    excel.export(res, `TestData_${dayjs().format('YYYYMMDD')}.xlsx`, finalList, [
      excel.newColumn('ID', 'id', 10, 'c'),
      excel.newColumn('Text', 'text', 40, 'l'),
      excel.newColumn('Text Array', 'text_array', 40, 'l', (v) => JSON.parse(v).join(', ')),
      excel.newColumn('Email', 'email', 30, 'l'),
      excel.newColumn('Url', 'url', 30, 'l'),
      excel.newColumn('Mobile', 'mobile', 20, 'c', (v) => telNoAutoDash(v)),
      excel.newColumn('Company Num', 'company_num', 20, 'c', (v) => companyNoAutoDash(v)),
      excel.newColumn('Personal Num', 'personal_num', 20, 'c', (v) => personalNoAutoDash(v)),
      excel.newColumn('Int', 'num_int', 15, 'r'),
      excel.newColumn('Float', 'num_float', 15, 'r'),
      excel.newColumn('Bool', 'bool', 8, 'c', (v) => (v ? 'Y' : 'N')),
      excel.newColumn('Date', 'date', 12, 'c', (v) => dayjs(v).format('YYYY-MM-DD')),
      excel.newColumn('Datetime', 'datetime', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
      excel.newColumn('Status', 'status', 8, 'c', (v) => db.TestData.Status.getName(v)),
      excel.newColumn('Create Date', 'create_date', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
      excel.newColumn('Update Date', 'update_date', 20, 'c', (v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')),
    ]);
  },

  /********************************************************************************************************************
   * 데이터 정보
   * ******************************************************************************************************************/
  async dataInfo(req: MyRequest, res: MyResponse) {
    if (!req.$$user) throw api.Error.Permission;

    const { id } = param(req, Param_Id_Integer_Required());
    const { privacy_access, privacy_access_reason } = param(req, {
      privacy_access: Param_Boolean(),
      privacy_access_reason: Param_String(),
    });

    if (privacy_access) {
      if (empty(privacy_access_reason)) throw paramError('privacy_access_reason');
      await db.AdminPrivacyAccessLog.add(req, {
        admin_user_id: req.$$user.id,
        type: db.AdminPrivacyAccessLog.Type.TestInfo,
        reason: privacy_access_reason,
        parent_id: id,
        create_date: now(),
      });
    }

    const info = await db.TestData.info(req, id);
    if (!info) throw paramError('id');

    const finalInfo = privacy_access
      ? {
          ...info,
          text_array: JSON.parse(info.text_array),
          status_name: db.TestData.Status.getName(info.status),
        }
      : {
          ...info,
          email: util.masking.email(info.email),
          tel: util.masking.tel(info.tel),
          mobile: util.masking.tel(info.mobile),
          company_num: util.masking.companyNo(info.company_num),
          personal_num: util.masking.personalNo(info.personal_num),
          text_array: JSON.parse(info.text_array),
          status_name: db.TestData.Status.getName(info.status),
        };

    api.success(res, finalInfo);
  },

  /********************************************************************************************************************
   * 데이터 등록
   * ******************************************************************************************************************/
  async dataAdd(req: MyRequest, res: MyResponse) {
    const { text_array, ...params } = param(req, TestDataAddEditParams);

    // 이메일 중복 체크
    if (await db.TestData.exists(req, { email: params.email }))
      throw api.newExceptionError('이미 등록된 이메일입니다.');

    await db.TestData.add(req, {
      ...params,
      text_array: JSON.stringify(text_array),
      create_date: now(),
      update_date: now(),
    });

    api.successMsg(res, '등록되었습니다.');
  },

  /********************************************************************************************************************
   * 데이터 수정
   * ******************************************************************************************************************/
  async dataEdit(req: MyRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());
    const { text_array, ...params } = param(req, TestDataAddEditParams);

    if (await db.TestData.notExists(req, { id })) throw paramError('id');

    // 이메일 중복 체크
    if (await db.TestData.exists(req, { email: params.email }, { id }))
      throw api.newExceptionError('이미 등록된 이메일입니다.');

    await db.TestData.edit(req, { ...params, text_array: JSON.stringify(text_array), update_date: now() }, { id });

    api.successMsg(res, '수정되었습니다.');
  },

  /********************************************************************************************************************
   * 데이터 삭제
   * ******************************************************************************************************************/
  async dataRemove(req: MyRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    if (await db.TestData.notExists(req, { id })) throw paramError('id');

    await db.TestData.remove(req, { id });

    api.successMsg(res, '삭제되었습니다.');
  },
};
