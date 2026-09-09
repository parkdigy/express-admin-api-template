/********************************************************************************************************************
 * 기본 Controller 미들웨어
 * - 세션 인증 검사 실행 (선택)
 * - Starter 실행
 * - 오류가 없으면, Transaction Commit 실행
 * - 오류가 있으면, Transaction Rollback 실행
 * - Finisher 실행
 * ******************************************************************************************************************/

import Starter from './Starter';
import Finisher from './Finisher';
import SessionAuthChecker from './JwtCookieAuthChecker';
import { type MyAuthController, type MyController } from '@types';
import { type NextFunction, type RequestHandler } from 'express';

export default function (
  controller: MyController | MyAuthController,
  sessionAuthCheck = false,
  afterStartMiddlewares: RequestHandler[] = [],
  beforeFinishMiddlewares: RequestHandler[] = []
) {
  const result = [
    Starter,
    ...afterStartMiddlewares,
    async (req: MyRequest | MyAuthRequest, res: MyResponse, next: NextFunction) => {
      try {
        await controller(req as any, res);
        await db.trans.commitAll(req);
      } catch (err) {
        try {
          await db.trans.rollbackAll(req);
        } catch (rollbackError) {
          printError(req, rollbackError);
        }
        printError(req, err);

        if (!res.headersSent) {
          res.status(500).send({
            result: {
              c: -1,
              m: '요청 처리 중 오류가 발생했습니다.',
            },
          });
        }
      }

      next();
    },
    ...beforeFinishMiddlewares,
    Finisher,
  ];

  if (sessionAuthCheck) {
    result.unshift(SessionAuthChecker);
  }

  return result;
}
