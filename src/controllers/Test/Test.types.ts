import {
  Param_Array,
  Param_Boolean_Required,
  Param_BusinessNo_Required,
  Param_Date_Required,
  Param_DateFrom_Required,
  Param_Email_Required,
  Param_Enum,
  Param_Enum_Required,
  Param_Integer_Required,
  Param_Mobile_Required,
  Param_Number_Required,
  Param_PersonalNo_Required,
  Param_String,
  Param_String_Required,
  Param_Tel_Required,
  Param_Url_Required,
} from '@common_param';

export const TestDataListParams = { keyword: Param_String(), status: Param_Enum(db.TestData.Status.getList()) };

export const TestDataAddEditParams = {
  text: Param_String_Required(),
  email: Param_Email_Required(),
  tel: Param_Tel_Required(),
  mobile: Param_Mobile_Required(),
  url: Param_Url_Required(),
  company_num: Param_BusinessNo_Required({ dash: false }),
  personal_num: Param_PersonalNo_Required({ dash: false }),
  num_int: Param_Integer_Required(),
  num_float: Param_Number_Required(),
  bool: Param_Boolean_Required(),
  date: Param_DateFrom_Required(),
  datetime: Param_Date_Required(),
  text_array: Param_Array('string'),
  status: Param_Enum_Required(db.TestData.Status.getList()),
};
