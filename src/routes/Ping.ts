/********************************************************************************************************************
 * Ping 라우터
 * ******************************************************************************************************************/
import express from 'express';
import { ApiController } from '@middlewares';
import { MyRequest, MyResponse } from '@types';

const router = express.Router();

// pong
router.get(
  '/',
  ApiController((req: MyRequest, res: MyResponse) => res.send('pong'))
);

export default router;
