/********************************************************************************************************************
 * Multer 파일 업로드 처리 미들웨어
 * - 다중 파일 업로드 처리
 * ******************************************************************************************************************/
import multer from 'multer';

export default function (fields: string[], dest = '@uploads/') {
  return multer({ dest: dest }).fields(fields.map((field) => ({ name: field, maxCount: 1 })));
}
