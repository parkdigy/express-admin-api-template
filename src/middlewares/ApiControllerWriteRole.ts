/********************************************************************************************************************
 * API Write 권한 검사 미들웨어
 * - 메뉴의 Write 권한이 있는지 검사
 * ******************************************************************************************************************/

import ApiMenuRoleChecker from './ApiMenuRoleChecker';
import ApiController from './ApiController';
import { MyController } from '@types';
import { RequestHandler } from 'express';

export default function (
  menus: string | string[],
  controller: MyController,
  logging = true,
  loggingData = false,
  afterStartMiddlewares: RequestHandler[] = [],
  beforeFinishMiddlewares: RequestHandler[] = []
): any[] {
  return [
    ApiMenuRoleChecker(menus, menu.Role.Write),
    ApiController(controller, true, logging, loggingData, afterStartMiddlewares, beforeFinishMiddlewares),
  ];
}
