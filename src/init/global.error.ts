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
   * @param err 오류 값
   */
  function printError(req: MyRequest, err: unknown): void;
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
globalThis.printError = (req: MyRequest, err: unknown) => {
  ll('!!!ERROR!!! >>>>>>>>>>>>>>>>>>>>>>>>>>');
  ll(req.method, `${req.baseUrl}${req.path}`);
  const data = util.sanitize.sanitizeForLog({ ...req.params, ...req.query, ...req.body }, 1000);
  ll(data);

  if (err instanceof Error) {
    ll(util.sanitize.sanitizeLogText(err.stack || `${err.name}: ${err.message}`, 1000));
  } else {
    ll(util.sanitize.sanitizeForLog(err, 1000));
  }
  ll('<<<<<<<<<<<<<<<<<<<<<<<<<< !!!ERROR!!!');
};

export {};
