/********************************************************************************************************************
 * 로그 기록 미들웨어
 * - password 가 포함된 데이터는 ... 으로 기록
 * - 데이터가 너무 길 경우 500자로 제한
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';
import logging from '@common_logging';

const $logging = process.env.LOGGING === 'true';

export default function (loggingData = false) {
  return (req: MyRequest, res: MyResponse, next: NextFunction) => {
    if ($logging) {
      try {
        const logText = `${req.$$remoteIpAddress} ${req.method} ${util.url.join(req.baseUrl, req.url)}`;
        if (loggingData) {
          const data = { ...req.params, ...req.query, ...req.body };
          for (const key in data) {
            if (notEmpty(data[key])) {
              if (key.includes('password')) {
                data[key] = '...';
              }
              if (typeof data[key] === 'string' && data[key].length > 500) {
                data[key] = data[key].substring(0, 500);
              }
            }
          }

          logging.info(logText, data);
        } else {
          logging.info(logText);
        }
      } catch (err) {
        ll(err);
      }
    }

    next();
  };
}
