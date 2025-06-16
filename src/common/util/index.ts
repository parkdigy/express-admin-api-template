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
  file,
  ip,
  md5,
  password,
  slack,
  sha1,
  sha256,
  url,
  uuid,
};

export default util;

export { util };
