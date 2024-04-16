import {
  MyRequest as _MyRequest,
  MyResponse as _MyResponse,
} from '@types';

declare global {
  type MyRequest = _MyRequest;
  type MyResponse = _MyResponse;
}

export {};
