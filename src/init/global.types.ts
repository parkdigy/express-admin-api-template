import { MyRequest as _MyRequest, MyAuthRequest as _MyAuthRequest, MyResponse as _MyResponse } from '@types';

declare global {
  type MyRequest = _MyRequest;
  type MyAuthRequest = _MyAuthRequest;
  type MyResponse = _MyResponse;
}

export {};
