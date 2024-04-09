/********************************************************************************************************************
 * Test 다운로드 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { Test } from '@controllers';
import { ApiControllerExportRole, ApiJwtCookieAuthChecker } from '@middlewares';

const router = express.Router();

// Test 데이터 목록 다운로드
router.get('/data', ApiJwtCookieAuthChecker, ApiControllerExportRole(menu.test.list, Test.exportDataList));

export default router;
