import { Param_Enum_Required, Param_Integer_Required, Param_String_Required } from '@common_param';

export default {
  async info(req: MyAuthRequest, res: MyResponse) {
    if (!req.$$user.is_privacy_access) throw api.newExceptionError('개인정보 조회 권한이 없습니다.');

    const { type, parent_id, reason } = param(req, {
      type: Param_Enum_Required(db.AdminPrivacyAccessLog.Type.getList()),
      parent_id: Param_Integer_Required(),
      reason: Param_String_Required(),
    });

    let value: string;

    switch (type) {
      case db.AdminPrivacyAccessLog.Type.TestEmail:
      case db.AdminPrivacyAccessLog.Type.TestTel:
      case db.AdminPrivacyAccessLog.Type.TestMobile:
      case db.AdminPrivacyAccessLog.Type.TestBusinessNo:
      case db.AdminPrivacyAccessLog.Type.TestPersonalNo:
        {
          const info = await db.TestData.find(req, { id: parent_id }).select(
            'email',
            'tel',
            'mobile',
            'company_num',
            'personal_num'
          );
          if (!info) throw api.newExceptionError('정보를 찾을 수 없습니다.');

          value =
            type === db.AdminPrivacyAccessLog.Type.TestEmail
              ? info.email
              : type === db.AdminPrivacyAccessLog.Type.TestTel
                ? info.tel
                : type === db.AdminPrivacyAccessLog.Type.TestMobile
                  ? info.mobile
                  : type === db.AdminPrivacyAccessLog.Type.TestBusinessNo
                    ? info.company_num
                    : type === db.AdminPrivacyAccessLog.Type.TestPersonalNo
                      ? info.personal_num
                      : '';
        }
        break;
      default:
        throw paramError('type');
    }

    await db.AdminPrivacyAccessLog.add(req, {
      admin_user_id: req.$$user.id,
      type,
      parent_id,
      reason,
      create_date: now(),
    });

    api.success(res, { value });
  },
};
