/********************************************************************************************************************
 * Excel 모듈
 * ******************************************************************************************************************/

import xlsx from 'sheetjs-style';
import {
  ExcelBorder,
  ExcelBorderStyle,
  ExcelStyle,
  ExcelColor,
  ExcelColumnOption,
  ExcelFill,
  ExcelFont,
  ExcelColumnOptionAlign,
  ExcelColumnOnValueReturn,
} from './excel.types';

/** 기본 Border 스타일 */
const $defaultBorderStyle: ExcelStyle = {
  border: {
    top: { style: 'thin', color: { rgb: 'ff000000' } },
    bottom: { style: 'thin', color: { rgb: 'ff000000' } },
    left: { style: 'thin', color: { rgb: 'ff000000' } },
    right: { style: 'thin', color: { rgb: 'ff000000' } },
  },
};

/** 기본 Header 스타일 */
const $defaultHeaderStyle: ExcelStyle = {
  font: { bold: true },
  fill: { fgColor: { rgb: 'ffbfbfbf' } },
  alignment: { horizontal: 'center' },
};

/** 기본 합계 스타일 */
const $defaultSumStyle: ExcelStyle = {
  font: { bold: true },
  fill: { fgColor: { rgb: 'efefef' } },
};

/** 기본 Column 설정 */
const $defaultColumnOptions: Partial<ExcelColumnOption<any, any>> = {
  width: 20,
  align: 'l',
};

/** Column 클래스 */
class Column<T, Name extends keyof T | undefined> {
  $options: ExcelColumnOption<T, Name>;

  constructor(options: ExcelColumnOption<T, Name>) {
    this.$options = { ...$defaultColumnOptions, ...(options || {}) } as ExcelColumnOption<T, Name>;
  }

  getOptions(): ExcelColumnOption<T, Name> {
    return this.$options;
  }
}

/** 새로운 Column 생성 */
function newColumn<T, Name extends keyof T>(
  title: string,
  name: Name,
  width?: number,
  align?: ExcelColumnOptionAlign,
  onValue?: (value: T[Name], info: T) => ExcelColumnOnValueReturn,
  options?: Omit<ExcelColumnOption<T, Name>, 'title' | 'name' | 'width' | 'align' | 'onValue'>,
  onCellOptions?: (
    info: T
  ) => Omit<ExcelColumnOption<T, Name>, 'title' | 'name' | 'width' | 'align' | 'onValue'> | void | undefined | false
): Column<T, Name>;
function newColumn<T>(
  title: string,
  width?: number,
  align?: ExcelColumnOptionAlign,
  onValue?: (info: T) => ExcelColumnOnValueReturn,
  options?: Omit<
    ExcelColumnOption<T, undefined>,
    'title' | 'name' | 'width' | 'align' | 'headerStyle' | 'sum' | 'sumStyle' | 'onValue' | 'onOptions'
  >,
  onCellOptions?: (
    info: T
  ) =>
    | Omit<
        ExcelColumnOption<T, undefined>,
        'title' | 'name' | 'width' | 'align' | 'headerStyle' | 'sum' | 'sumStyle' | 'onValue' | 'onOptions'
      >
    | void
    | undefined
    | false
): Column<T, undefined>;
function newColumn<T, Name extends keyof T | undefined>(option: ExcelColumnOption<T, Name>): Column<T, Name>;
function newColumn<T, Name extends keyof T | undefined>(
  titleOrOption: any,
  nameOrWidth?: any,
  widthOrAlign?: any,
  alignOrOnValue?: any,
  onValueOrOptions?: any,
  optionsOrOnCellOptions?: any,
  onCellOptions?: (
    info: T
  ) =>
    | Omit<
        ExcelColumnOption<T, Name>,
        'title' | 'name' | 'width' | 'align' | 'headerStyle' | 'sum' | 'sumStyle' | 'onValue' | 'onOptions'
      >
    | void
    | undefined
    | false
) {
  if (typeof titleOrOption === 'string') {
    if (typeof nameOrWidth === 'string') {
      if (typeof optionsOrOnCellOptions === 'function') {
        return new Column<T, Name>({
          title: titleOrOption,
          name: nameOrWidth as Name,
          width: widthOrAlign,
          align: alignOrOnValue,
          onValue: onValueOrOptions,
          onCellOptions: optionsOrOnCellOptions,
        });
      } else {
        return new Column<T, Name>({
          title: titleOrOption,
          name: nameOrWidth as Name,
          width: widthOrAlign,
          align: alignOrOnValue,
          onValue: onValueOrOptions,
          onCellOptions,
          ...optionsOrOnCellOptions,
        });
      }
    } else {
      if (typeof onValueOrOptions === 'function') {
        return new Column<T, Name>({
          title: titleOrOption,
          width: nameOrWidth,
          align: widthOrAlign,
          onValue: alignOrOnValue,
          onCellOptions: onValueOrOptions,
        });
      } else {
        return new Column<T, Name>({
          title: titleOrOption,
          width: nameOrWidth,
          align: widthOrAlign,
          onValue: alignOrOnValue,
          onCellOptions,
          ...onValueOrOptions,
        });
      }
    }
  } else {
    return new Column<T, Name>(titleOrOption);
  }
}

const excel = {
  $defaultBorderStyle,
  $defaultHeaderStyle,
  $defaultSumStyle,

  newColumn,

  /********************************************************************************************************************
   * 기본 Header 스타일 반환
   * ******************************************************************************************************************/
  getDefaultHeaderStyle() {
    return this.$defaultHeaderStyle;
  },

  /********************************************************************************************************************
   * 기본 Header 스타일 설정
   * ******************************************************************************************************************/
  setDefaultHeaderStyle(defaultHeaderStyle: ExcelStyle) {
    this.$defaultHeaderStyle = defaultHeaderStyle;
  },

  /********************************************************************************************************************
   * 기본 Border 스타일 반환
   * ******************************************************************************************************************/
  getDefaultBorderStyle() {
    return this.$defaultBorderStyle;
  },

  /********************************************************************************************************************
   * 기본 Border 스타일 설정
   * ******************************************************************************************************************/
  setDefaultBorderStyle(defaultBorderStyle: ExcelStyle) {
    this.$defaultBorderStyle = defaultBorderStyle;
  },

  /********************************************************************************************************************
   * 기본 합계 스타일 반환
   * ******************************************************************************************************************/
  getDefaultSumStyle() {
    return this.$defaultSumStyle;
  },

  /********************************************************************************************************************
   * 기본 합계 스타일 설정
   * ******************************************************************************************************************/
  setDefaultSumStyle(defaultSumStyle: ExcelStyle) {
    this.$defaultSumStyle = defaultSumStyle;
  },

  /********************************************************************************************************************
   * 엑셀 Column Index 변환
   * ******************************************************************************************************************/
  getColumnIndex(column: string) {
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;
    for (let i = 0, j = column.length - 1; i < column.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(column[i]) + 1);
    }
    return result - 1;
  },

  /********************************************************************************************************************
   * Align 변환
   * ******************************************************************************************************************/
  getAlign(align: ExcelColumnOptionAlign) {
    switch (align) {
      case 'l':
        return 'left';
      case 'c':
        return 'center';
      case 'r':
        return 'right';
      default:
        return align;
    }
  },

  /********************************************************************************************************************
   * 엑셀 다운로드
   * @param res MyResponse
   * @param fileName 파일명
   * @param rawData 데이터
   * @param columns Column 정보
   * ******************************************************************************************************************/
  export<T, Name extends keyof T | undefined>(
    res: MyResponse,
    fileName: string,
    rawData: T[],
    columns: (Column<T, Name> | false | null | undefined | (Column<T, Name> | false | null | undefined)[])[]
  ) {
    const data: any[] = [];
    const header: ExcelColumnOption<T, Name>['title'][] = [];
    const width: ExcelColumnOption<T, Name>['width'][] = [];
    const align: ExcelColumnOption<T, Name>['align'][] = [];
    const format: ExcelColumnOption<T, Name>['format'][] = [];
    const colHeaderStyle: ExcelColumnOption<T, Name>['headerStyle'][] = [];
    const colDataStyle: ExcelColumnOption<T, Name>['dataStyle'][] = [];
    const sum: ExcelColumnOption<T, Name>['sum'][] = [];
    const colSumStyle: ExcelColumnOption<T, Name>['sumStyle'][] = [];

    const finalColumns: Column<T, Name>[] = [];
    for (const column of columns) {
      if (column) {
        if (Array.isArray(column)) {
          column.forEach((subColumn) => subColumn && finalColumns.push(subColumn));
        } else {
          finalColumns.push(column);
        }
      }
    }

    const names = finalColumns.map((c) => c.getOptions().name);
    const dataOptions: Record<
      string,
      Omit<ExcelColumnOption<T, Name>, 'title' | 'name' | 'width' | 'align' | 'onValue'>
    >[] = [];

    rawData.forEach((d, dataIndex) => {
      dataOptions.push({});
      data.push(
        names.map((name, idx) => {
          if (name === undefined) {
            const onOptions = finalColumns[idx]?.getOptions()?.onCellOptions as (
              info: T
            ) => ExcelColumnOption<T, undefined>;
            if (onOptions) {
              dataOptions[dataIndex][idx.toString()] = onOptions(d);
            }

            const onValue = finalColumns[idx]?.getOptions()?.onValue as (info: T) => ExcelColumnOnValueReturn;
            if (onValue) {
              return onValue(d);
            } else {
              return undefined;
            }
          } else {
            const onOptions = finalColumns[idx]?.getOptions()?.onCellOptions as (info: T) => ExcelColumnOption<T, Name>;
            if (onOptions) {
              dataOptions[dataIndex][idx.toString()] = onOptions(d);
            }

            const onValue = finalColumns[idx]?.getOptions()?.onValue as (
              value: any,
              info: T
            ) => ExcelColumnOnValueReturn;
            if (onValue) {
              return onValue(d[name], d);
            } else {
              return d[name];
            }
          }
        })
      );
    });

    let sumExists = false;

    finalColumns.forEach((c) => {
      const options = c.getOptions();

      header.push(options.title);
      width.push(options.width);
      align.push(options.align);
      format.push(options.format);
      colHeaderStyle.push(options.headerStyle);
      colDataStyle.push(options.dataStyle);
      sum.push(options.sum);
      colSumStyle.push(options.sumStyle);

      if (options.sum !== undefined) {
        sumExists = true;
      }
    });

    const defaultBorderStyle = this.getDefaultBorderStyle();
    const defaultHeaderStyle = {
      ...defaultBorderStyle,
      ...this.getDefaultHeaderStyle(),
    };
    const defaultSumStyle = {
      ...defaultBorderStyle,
      ...this.getDefaultSumStyle(),
    };

    let headerData: string[][] | null = null;
    let headerRows = 0;
    if (header) {
      headerData = (Array.isArray(header[0]) ? header : [header]) as string[][];
      headerRows = headerData.length;
    }

    data.forEach((item) => {
      for (const key in item) {
        if (item[key] == null) {
          item[key] = '';
        }
      }
    });

    let finalData;
    if (headerData) {
      finalData = [...headerData, ...data];
    } else {
      finalData = data;
    }

    const ws = xlsx.utils.aoa_to_sheet(finalData);

    if (width) {
      ws['!cols'] = width.map((w) => ({ width: w }));
    }

    let sumRow = -1;
    if (sumExists && data.length > 0) {
      const refs = ws['!ref']?.split(':');

      if (refs) {
        const lastRowIndex =
          refs.length > 1 ? parseInt(refs[1].replace(/^\D+/g, '')) : parseInt(refs[0].replace(/^\D+/g, ''));
        const col = refs.length > 1 ? refs[1].replace(/[^A-Za-z]/g, '') : refs[0].replace(/[^A-Za-z]/g, '');
        sumRow = lastRowIndex + 1;
        ws['!ref'] = `${refs[0]}:${col}${sumRow}`;

        const range = xlsx.utils.decode_range(`A${sumRow}:${col}${sumRow}`);
        for (let c = range.s.c; c <= range.e.c; c += 1) {
          const col = xlsx.utils.encode_col(c);
          const cell = `${col}${sumRow}`;
          if (typeof sum[c] === 'string') {
            ws[cell] = { t: 's', v: sum[c] };
          } else if (typeof sum[c] === 'boolean' && sum[c]) {
            ws[cell] = { f: `SUM(${col}${headerRows}:${col}${lastRowIndex})` };
          }
        }
      }
    }

    for (const key in ws) {
      if (Object.prototype.hasOwnProperty.call(ws, key)) {
        if (!key.startsWith('!')) {
          const row = parseInt(key.replace(/^\D+/g, '')) - 1;
          const col = this.getColumnIndex(key.replace(/[^A-Za-z]/g, ''));

          let style: ExcelStyle = {};

          if (align) {
            const al = align[col];
            if (al) {
              style.alignment = { horizontal: this.getAlign(al) };
            }
          }

          if (row < headerRows) {
            const colStyle = colHeaderStyle ? colHeaderStyle[col] : undefined;
            style = { ...style, ...defaultHeaderStyle, ...colStyle };
          } else {
            const cellOptions = dataOptions[row - headerRows][col];

            if (sumRow > -1 && row === sumRow - 1) {
              const colStyle = colSumStyle ? colSumStyle[col] : undefined;
              const formatStyle = format ? { numFmt: format[col] } : undefined;
              style = { ...style, ...defaultSumStyle, ...colStyle, ...formatStyle };
            } else {
              const colStyle =
                colDataStyle && cellOptions
                  ? { ...colDataStyle[col], ...cellOptions?.dataStyle }
                  : colDataStyle
                    ? colDataStyle[col]
                    : undefined;
              const formatStyle =
                cellOptions && cellOptions.format
                  ? { numFmt: cellOptions.format }
                  : format
                    ? { numFmt: format[col] }
                    : undefined;
              style = { ...style, ...defaultBorderStyle, ...colStyle, ...formatStyle };
            }
          }

          ws[key].s = style;
        }
      }
    }

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'SheetJS');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.attachment(fileName).send(buf);
  },

  style: {
    font(
      color: ExcelColor,
      bold = false,
      underline = false,
      italic = false,
      strike = false,
      outline = false,
      shadow = false,
      vertAlign = false
    ) {
      const font: ExcelFont = { color };
      if (bold) font.bold = true;
      if (underline) font.underline = true;
      if (italic) font.italic = true;
      if (strike) font.strike = true;
      if (outline) font.outline = true;
      if (shadow) font.shadow = true;
      if (vertAlign) font.vertAlign = true;
      return { font };
    },

    fill(color: string) {
      const fill: ExcelFill = { fgColor: { rgb: `ff${color}` } };
      return { fill };
    },

    border(color: string, style: ExcelBorderStyle = 'thin') {
      const border: ExcelBorder = {
        top: { style, color: { rgb: `ff${color}` } },
        bottom: { style, color: { rgb: `ff${color}` } },
        left: { style, color: { rgb: `ff${color}` } },
        right: { style, color: { rgb: `ff${color}` } },
      };
      return { border };
    },
  },
  format: {
    custom(format: string) {
      return { numFmt: format };
    },
    thousandComma() {
      return { numFmt: '#,###' };
    },
  },
};

export default excel;
