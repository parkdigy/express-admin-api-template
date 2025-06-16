import compare from '@pdg/compare';
import data from '@pdg/data';
import dateTime from '@pdg/date-time';
import format from '@pdg/formatting';
import masking from '@pdg/masking';
import url from '@pdg/url';
import file from './file';
import ip from './ip';
import md5 from './md5';
import password from './password';
import slack from './slack';
import sha1 from './sha1';
import sha256 from './sha256';
import uuid from './uuid';

const util = {
  compare,
  data,
  dateTime,
  format,
  masking,
  url,
  file,
  ip,
  md5,
  password,
  slack,
  sha1,
  sha256,
  uuid,
};

export default util;

export { util };
