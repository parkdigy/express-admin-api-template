/********************************************************************************************************************
 * API Multer Export 권한 검사 미들웨어
 * - 메뉴의 Write 권한이 있는지 검사
 * ******************************************************************************************************************/

import ApiMenuRoleChecker from './ApiMenuRoleChecker';
import { MyController } from '@types';
import { RequestHandler } from 'express';
import ApiMulterController from './ApiMulterController';

export default function (
  menus: string | string[],
  multer: RequestHandler,
  controller: MyController,
  logging = true,
  loggingData = false
): any[] {
  return [
    ApiMenuRoleChecker(menus, menu.Role.Export),
    ApiMulterController(multer, controller, false, logging, loggingData),
  ];
}
