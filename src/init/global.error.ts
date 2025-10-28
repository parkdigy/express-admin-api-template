import api, { ApiError } from '../common/api';

declare global {
  /**
   * 파라메터 정보가 유효하지 않음 Error 객체를 반환합니다.
   * @param name 파라메터 이름
   * @returns 에러 객체
   */
  function paramError(name?: string): ApiError;

  /**
   * 오류를 출력합니다.
   * @Param req MyRequest 객체
   * @param err Error 객체
   */
  function printError(req: MyRequest, err: Error): void;
}

/********************************************************************************************************************
 * parseError
 * ******************************************************************************************************************/
globalThis.paramError = (name?: string) => {
  if (name != null) {
    return api.newError(api.Error.Parameter, { text: `'${name}' 파라메터 정보가 유효하지 않습니다.` });
  } else {
    return api.Error.Parameter;
  }
};

/********************************************************************************************************************
 * printError
 * ******************************************************************************************************************/
globalThis.printError = (req: MyRequest, err: Error) => {
  // 개발 환경일 경우에만 출력
  ll('!!!ERROR!!! >>>>>>>>>>>>>>>>>>>>>>>>>>');
  ll(req.method, `${req.baseUrl}${req.path}`);
  const data = {
    ...req.params,
    ...req.query,
    ...req.body,
  };
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string' && data[key].length > 1000) {
      data[key] = `${data[key].substring(0, 1000)}... (length: ${data[key].length})`;
    }
  });
  ll(data);

  if (err.stack) {
    ll(err.stack.substring(0, 200), err.stack.length > 200 ? '...' : '');
  }
  ll('<<<<<<<<<<<<<<<<<<<<<<<<<< !!!ERROR!!!');
};

export {};
