export type ExcelColor =
  | { auto: 1 }
  | {
      rgb: string;
    }
  | { theme: '1'; tint: '-0.25' }
  | { indexed: 64 };

export type ExcelBorderStyle =
  | 'thin'
  | 'medium'
  | 'thick'
  | 'dotted'
  | 'hair'
  | 'dashed'
  | 'mediumDashed'
  | 'dashDot'
  | 'mediumDashDot'
  | 'dashDotDot'
  | 'mediumDashDotDot'
  | 'slantDashDot';

export interface ExcelFill {
  patternType?: 'solid' | 'none';
  fgColor?: ExcelColor;
  bgColor?: ExcelColor;
}

export interface ExcelBorder {
  top?: { style: ExcelBorderStyle; color: ExcelColor };
  bottom?: { style: ExcelBorderStyle; color: ExcelColor };
  left?: { style: ExcelBorderStyle; color: ExcelColor };
  right?: { style: ExcelBorderStyle; color: ExcelColor };
  diagonalUp?: boolean;
  diagonalDown?: boolean;
}

export interface ExcelAlignment {
  vertical?: 'bottom' | 'center' | 'top';
  horizontal?: 'left' | 'center' | 'right';
  wrapText?: boolean;
  /** 2 is "right-to-left" */
  readingOrder?: number;
  /** 0-180 or 255 */
  textRotation?: number;
  indent?: number;
}

export interface ExcelFont {
  name?: string;
  sz?: string;
  color?: ExcelColor;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  strike?: boolean;
  outline?: boolean;
  shadow?: boolean;
  vertAlign?: boolean;
}

export interface ExcelStyle {
  fill?: ExcelFill;
  font?: ExcelFont;
  /**
   * Formating of number. Some examples: (see StyleBuilder.SSF property for more)
   * "0"
   * "0.00%"
   * "0.0%"
   * "0.00%;\\(0.00%\\);\\-;@"
   * "m/dd/yy"
   */
  numFmt?: string;
  alignment?: ExcelAlignment;
  border?: ExcelBorder;
}

export type ExcelColumnOptionAlign = 'l' | 'c' | 'r';
export type ExcelColumnSum = string | boolean;
export type ExcelColumnOnValueReturn = string | number | null | undefined | false;
export interface ExcelColumnOption<T, Name extends keyof T | undefined> {
  title: string | string[];
  name?: Name;
  width?: number;
  align?: ExcelColumnOptionAlign;
  format?: string;
  headerStyle?: ExcelStyle;
  dataStyle?: ExcelStyle;
  sum?: ExcelColumnSum;
  sumStyle?: ExcelStyle;
  onValue?: Name extends keyof T
    ? (value: T[Name], info: T) => ExcelColumnOnValueReturn
    : (info: T) => ExcelColumnOnValueReturn;
  onCellOptions?: (
    info: T
  ) => Omit<ExcelColumnOption<T, Name>, 'title' | 'name' | 'width' | 'align' | 'onValue'> | void | undefined | false;
}
