/********************************************************************************************************************
 * Parameter 모듈
 * - express request 객체에서 Parameter 를 추출하고 검증
 * ******************************************************************************************************************/

import { ParamOption, ParamOptionDataType } from './param.types';
import dayjs from 'dayjs';
import {
  beginTime,
  endTime,
  telNoAutoDash,
  companyNoAutoDash,
  personalNoAutoDash,
  isPersonalNo,
  isCompanyNo,
  isEmail,
  isUrl,
  isTelNo,
  isMobileNo,
  isNumericOnlyText,
} from '@pdg/util';

function isValueEmpty(value: any) {
  return ['', null, undefined].includes(value);
}

export default function param<
  T extends Readonly<Dict<Dict>>[],
  TMerge = ArrayMerge<T>,
  Result = {
    [K in keyof TMerge]: ParamOptionDataType<TMerge[K]>;
  },
>(req: MyRequest, ...params: T): Result {
  const data = {
    ...req.params,
    ...req.query,
    ...req.body,
  };

  const paramValue: Record<string, any> = {};

  params.forEach((paramItem) => {
    Object.keys(paramItem).map((name) => {
      const {
        type,
        required,
        validValues,
        defaultValue,
        dash,
        allowInnerUrl,
        noTrim,
        arrayValueSeparator,
        arrayItemType,
        dateFormat,
        dateType,
      } = paramItem[name] as unknown as ParamOption;
      let value = data[name];

      if (!noTrim && value != null && typeof value === 'string' && type !== 'password') {
        value = value.trim();
      }

      if (required && empty(value)) {
        throw paramError(name);
      }

      if (defaultValue != null && empty(value)) {
        value = defaultValue;
      }

      switch (type) {
        case 'string':
        case 'password':
          value = value == null || value == '' ? defaultValue : value.toString();
          break;
        case 'integer':
        case 'page':
        case 'limit':
          if (!isValueEmpty(value)) {
            if (typeof value === 'string') value = value === '' ? defaultValue : Number(value);
            if (Number.isNaN(value) || !Number.isInteger(value)) throw paramError(name);
          } else {
            value = defaultValue;
          }

          if (['page', 'limit'].includes(type) && value <= 0) {
            throw paramError(name);
          }
          break;
        case 'number':
          if (!isValueEmpty(value)) {
            if (typeof value === 'string') value = value === '' ? defaultValue : Number(value);
            if (Number.isNaN(value)) throw paramError(name);
          } else {
            value = defaultValue;
          }
          break;
        case 'boolean':
          if (!isValueEmpty(value)) {
            value = typeof value === 'string' ? !['', '0', 'false'].includes(value) : !!value;
          } else {
            value = defaultValue;
          }
          break;
        case 'number_boolean':
          if (!isValueEmpty(value)) {
            value = (typeof value === 'string' && ['', '0', 'false'].includes(value)) || value === 0 ? 0 : 1;
          } else {
            value = defaultValue;
          }
          break;
        case 'date':
          if (!isValueEmpty(value)) {
            try {
              value = dayjs(value, dateFormat ? { format: dateFormat } : undefined).toDate();
            } catch (err) {
              throw paramError(name);
            }
          } else {
            value = defaultValue;
          }

          if (notEmpty(value) && dateType) {
            switch (dateType) {
              case 'from':
                value = beginTime(value);
                break;
              case 'to':
                value = endTime(value);
                break;
            }
          }
          break;
        case 'email':
          if (!isValueEmpty(value)) {
            if (!isEmail(value)) throw paramError(name);
          } else {
            value = defaultValue;
          }
          break;
        case 'url':
          if (value != null && value !== '') {
            if (!isUrl(value, !!allowInnerUrl)) throw paramError(name);
            if (!allowInnerUrl && !value.includes('://')) {
              value = `http://${value}`;
            }
          } else {
            value = defaultValue;
          }
          break;
        case 'tel':
        case 'mobile':
          if (!isValueEmpty(value)) {
            switch (type) {
              case 'tel':
                if (!isTelNo(value)) throw paramError(name);
                break;
              case 'mobile':
                if (!isMobileNo(value)) throw paramError(name);
                break;
            }
          } else {
            value = defaultValue;
          }
          if (value) {
            if (dash) {
              value = telNoAutoDash(value);
            } else {
              value = value.replace(/-/g, '');
            }
          }
          break;
        case 'company_num':
          if (!isValueEmpty(value)) {
            if (!isCompanyNo(value)) throw paramError(name);
          } else {
            value = defaultValue;
          }
          if (value) {
            value = dash ? companyNoAutoDash(value) : value.replace(/-/g, '');
          }
          break;
        case 'personal_num':
          if (!isValueEmpty(value)) {
            if (!isPersonalNo(value)) throw paramError(name);
          } else {
            value = defaultValue;
          }

          if (value) {
            value = dash ? personalNoAutoDash(value) : value.replace(/-/g, '');
          }
          break;
        case 'enum':
          if (isValueEmpty(value)) {
            value = defaultValue;
          }
          break;
        case 'array':
          if (!isValueEmpty(value)) {
            if (!Array.isArray(value)) {
              value = value.toString().split(arrayValueSeparator || ',');
            }

            switch (arrayItemType) {
              case 'string':
                value = value.map((vv: string | number) => vv.toString());
                break;
              case 'number':
                value = value.map((vv: string | number) => {
                  if (typeof vv === 'string') {
                    if (isNumericOnlyText(vv)) {
                      return Number(vv);
                    } else {
                      throw paramError(name);
                    }
                  } else {
                    return vv;
                  }
                });
                break;
            }
          } else {
            value = defaultValue;
          }
          break;
        case 'enum_array':
          if (!isValueEmpty(value)) {
            if (!Array.isArray(value)) {
              value = value.toString().split(arrayValueSeparator || ',');
            }

            if (validValues) {
              value = value.map((v: string) => validValues.find((vv) => vv.toString() === v.toString()) || v);
            }
          } else {
            value = defaultValue;
          }
          break;
        case 'object_array':
          if (!isValueEmpty(value)) {
            if (!Array.isArray(value)) {
              throw paramError(name);
            }
          } else {
            value = defaultValue;
          }
          break;
        case 'object':
          if (!isValueEmpty(value)) {
            if (typeof value !== 'object') {
              throw paramError(name);
            }
          } else {
            value = defaultValue;
          }
          break;
      }

      if (value != null && notEmpty(value) && validValues && Array.isArray(validValues)) {
        switch (type) {
          case 'string':
          case 'integer':
          case 'number':
          case 'page':
          case 'limit':
          case 'email':
          case 'url':
          case 'tel':
          case 'mobile':
          case 'company_num':
          case 'personal_num':
          case 'enum':
          case 'object':
            {
              const valueString = value.toString();
              if (
                empty(
                  validValues.find((val) => {
                    return val.toString() === valueString;
                  })
                )
              ) {
                throw paramError(name);
              }
            }
            break;
          case 'array':
          case 'object_array':
          case 'enum_array':
            if (
              value.find((val: any) => {
                const valString = val.toString();
                return !validValues.find((v) => {
                  return v.toString() === valString;
                });
              }) !== undefined
            ) {
              throw paramError(name);
            }
            break;
        }
      }

      paramValue[name] = value;
    });
  });

  return paramValue as Result;
}
