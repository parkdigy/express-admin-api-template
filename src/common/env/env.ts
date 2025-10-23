/********************************************************************************************************************
 * ENV 모듈
 * ******************************************************************************************************************/

import { Env } from './env.types';

const appEnv = process.env.APP_ENV;
const isLocal = process.env.APP_ENV === 'local';
const isDevelopment = process.env.APP_ENV === 'development';
const isStaging = process.env.APP_ENV === 'staging';
const isProduction = process.env.APP_ENV === 'production';
const title = process.env.APP_NAME;

const env: Env = {
  $$routerCount: 0,
  env: appEnv,
  isLocal,
  isDevelopment,
  isStaging,
  isProduction,
  title,
};

export default env;
