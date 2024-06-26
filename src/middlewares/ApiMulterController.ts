/********************************************************************************************************************
 * 기본 API Multer Controller 미들웨어
 * - 로깅 기록 (선택)
 * - Starter 실행
 * - 오류가 없으면, Transaction Commit 실행
 * - 오류가 있으면, Transaction Rollback 실행
 * - Finisher 실행
 * ******************************************************************************************************************/

import { MyController } from '@types';
import { RequestHandler } from 'express';
import { MulterRemover } from './Multer';
import ApiController from './ApiController';

export default function (
  multer: RequestHandler,
  controller: MyController,
  callPermissionCheck = false,
  logging = true,
  loggingData = false
) {
  return ApiController(controller, callPermissionCheck, logging, loggingData, [multer], [MulterRemover]);
}
