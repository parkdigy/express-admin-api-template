/********************************************************************************************************************
 * 어드민 그룹 Controller
 * ******************************************************************************************************************/

import { AdminGroupAddParam, AdminGroupEditParam } from './AdminGroup.types';
import { Param_Boolean, Param_Id_Integer_Required } from '@common_param';

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyRequest, res: MyResponse) {
    const { is_lock } = param(req, { is_lock: Param_Boolean() });

    let list = await db.AdminGroup.list(req, is_lock, true);

    if (!req.$$user?.is_super_admin) {
      list = list.filter((info) => info.id !== SUPER_ADMIN_GROUP_ID);
    }

    api.success(
      res,
      list.map((info) => ({ ...info, editable: info.id !== SUPER_ADMIN_GROUP_ID || !!req.$$user?.is_super_admin }))
    );
  },

  /********************************************************************************************************************
   * 정보
   * ******************************************************************************************************************/
  async info(req: MyRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());

    // 그룹 정보
    const info = await db.AdminGroup.find(req, { id });
    if (!info) throw paramError();

    // 그룹에 포함된 사용자 목록
    const users = (await db.AdminGroupUser.listOfGroup(req, id)).map((item) => item.admin_user_id);

    api.success(res, {
      info: { ...info, editable: info.id !== SUPER_ADMIN_GROUP_ID || !!req.$$user?.is_super_admin },
      users,
    });
  },

  /********************************************************************************************************************
   * 등록
   * ******************************************************************************************************************/
  async add(req: MyRequest, res: MyResponse) {
    const { name, is_privacy_access, users, menu } = param(req, AdminGroupAddParam);

    // Super Admin 이 아닌 경우, Super Admin 그룹 소속 사용자 등록 시 에러
    if (users && !req.$$user?.is_super_admin) {
      if (await db.AdminGroupUser.exists(req, { admin_user_id: users, admin_group_id: SUPER_ADMIN_GROUP_ID })) {
        throw api.newExceptionError('Super Admin 그룹에 소속된 사용자는 등록할 수 없습니다.');
      }
    }

    // 그룹명 중복 검사
    if (await db.AdminGroup.exists(req, { name })) {
      throw api.newExceptionError('이미 사용 중인 그룹명입니다.');
    }

    // Begin Transaction
    await db.trans.begin(req);

    // 그룹 등록
    const adminGroupId = (await db.AdminGroup.add(req, { name, is_privacy_access }))[0];

    // 사용자 등록
    if (users) {
      await db.AdminGroupUser.addUsers(req, adminGroupId, users);
    }

    // 메뉴 등록
    if (menu) {
      await db.AdminGroupMenu.addOrEditMenus(req, adminGroupId, JSON.parse(menu));
    }

    // Commit Transaction
    await db.trans.commit(req);

    api.successMsg(res, '그룹이 등록되었습니다.');
  },

  /********************************************************************************************************************
   * 수정
   * ******************************************************************************************************************/
  async edit(req: MyRequest, res: MyResponse) {
    const { id } = param(req, Param_Id_Integer_Required());
    const { name, is_privacy_access, users, menu } = param(req, AdminGroupEditParam);

    if (id === SUPER_ADMIN_GROUP_ID && !req.$$user?.is_super_admin) {
      throw api.newExceptionError('Super Admin 그룹은 수정할 수 없습니다.');
    }

    // Super Admin 이 아닌 경우, Super Admin 그룹 소속 사용자 등록 시 에러
    if (users && !req.$$user?.is_super_admin) {
      if (await db.AdminGroupUser.exists(req, { admin_user_id: users, admin_group_id: SUPER_ADMIN_GROUP_ID })) {
        throw api.newExceptionError('Super Admin 그룹에 소속된 사용자는 수정할 수 없습니다.');
      }
    }

    // 그룹 정보
    const groupInfo = await db.AdminGroup.find(req, { id });
    if (!groupInfo) throw paramError('id');
    if (groupInfo.is_lock) throw api.newExceptionError('사용제한 상태입니다. 수정할 수 없습니다.');

    // Begin Transaction
    await db.trans.begin(req);

    // 그룹 정보 수정
    const updateData: { name?: string; is_privacy_access?: boolean } = {};

    if (groupInfo.name !== name) {
      if (id === SUPER_ADMIN_GROUP_ID) throw api.newExceptionError('Super Admin 그룹명은 수정할 수 없습니다.');

      // 그룹명 중복 검사
      if (await db.AdminGroup.exists(req, { name })) {
        throw api.newExceptionError('이미 사용 중인 그룹명입니다.');
      }
      updateData.name = name;
    }

    if (Boolean(groupInfo.is_privacy_access) !== is_privacy_access) {
      updateData.is_privacy_access = is_privacy_access;
    }

    if (notEmpty(updateData)) {
      // 그룹 정보 수정
      if (!(await db.AdminGroup.edit(req, updateData, { id }))) {
        throw api.newExceptionError('그룹 정보 수정 중 오류가 발생했습니다.');
      }
    }

    // 그룹의 전체 사용자 삭제
    await db.AdminGroupUser.removeAllUserOfGroup(req, id);

    // 사용자 등록
    if (users) {
      await db.AdminGroupUser.addUsers(req, id, users);
    }

    // 메뉴 등록/수정
    if (menu != null) {
      await db.AdminGroupMenu.addOrEditMenus(req, id, JSON.parse(menu));
    }

    // Commit Transaction
    await db.trans.commit(req);

    api.successMsg(res, '그룹 정보가 수정되었습니다.');
  },
};
