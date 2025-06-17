import compare from '@pdg/compare';
import data from '@pdg/data';
import dateTime from '@pdg/date-time';
import format from '@pdg/formatting';
import masking from '@pdg/masking';
import url from '@pdg/url';
import crypto from '@pdg/crypto';
import file from './file';
import ip from './ip';
import password from './password';
import slack from './slack';
import uuid from './uuid';

const util = {
  compare,
  data,
  dateTime,
  format,
  masking,
  url,
  ...crypto,
  file,
  ip,
  password,
  slack,
  uuid,
};

export default util;

export { util };
