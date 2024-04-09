/********************************************************************************************************************
 * Test 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { Test } from '@controllers';
import { ApiControllerReadRole, ApiControllerWriteRole, ApiJwtCookieAuthChecker } from '@middlewares';

const router = express.Router();

// 데이터 상태 목록
router.get('/data/status', ApiJwtCookieAuthChecker, ApiControllerReadRole(menu.test.list, Test.dataStatusList));
// 데이터 목록
router.get('/data', ApiJwtCookieAuthChecker, ApiControllerReadRole(menu.test.list, Test.dataList));
// 데이터 등록
router.post('/data', ApiJwtCookieAuthChecker, ApiControllerWriteRole(menu.test.list, Test.dataAdd));
// 데이터 정보
router.get('/data/:id', ApiJwtCookieAuthChecker, ApiControllerReadRole(menu.test.list, Test.dataInfo));
// 데이터 수정
router.patch('/data/:id', ApiJwtCookieAuthChecker, ApiControllerWriteRole(menu.test.list, Test.dataEdit));
// 데이터 삭제
router.delete('/data/:id', ApiJwtCookieAuthChecker, ApiControllerWriteRole(menu.test.list, Test.dataRemove));

export default router;
