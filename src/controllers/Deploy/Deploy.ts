/********************************************************************************************************************
 * 배포 Controller
 * ******************************************************************************************************************/

import { exec } from 'child_process';
import crypto from 'crypto';

export default {
  /********************************************************************************************************************
   * github
   * ******************************************************************************************************************/
  github(req: MyRequest, res: MyResponse) {
    // 성공 응답
    const sendSuccess = (data: string) => {
      res.status(200).send({
        result: {
          c: 0,
          m: '성공적으로 배포되었습니다.',
        },
        data,
      });
    };

    // skip 응답
    const sendSkip = () => {
      res.status(200).send({
        result: {
          c: 1,
          m: 'skip',
        },
      });
    };

    // 실패 응답
    const sendFail = (code: number, data: string) => {
      res.status(500).send({
        result: {
          c: code,
          m: '배포 중 오류가 발생했습니다.',
        },
        data,
      });
    };

    try {
      // 서명 확인
      const githubSignature = req.headers['x-hub-signature'];
      if (empty(githubSignature)) {
        sendFail(-10, '서명 불일치');
        return;
      }

      // 서명 비교
      const hmac = crypto.createHmac('sha1', process.env.DEPLOY_GITHUB_SECRET);
      const computedSignature = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;
      if (githubSignature !== computedSignature) {
        sendFail(-11, '서명 불일치');
        return;
      }

      // push 이벤트인지 확인
      const githubEvent = req.headers['x-github-event'];
      if (githubEvent !== 'push') {
        sendSkip();
        return;
      }

      // 브랜치 일치하는지 확인
      const githubRef = req.body.ref;
      if (githubRef !== process.env.DEPLOY_GITHUB_REF) {
        sendSkip();
        return;
      }

      // git pull 실행
      exec('git pull 2>&1', (err, data, stderr) => {
        if (err) {
          sendFail(-12, err.message);
        } else if (stderr) {
          sendFail(-13, stderr);
        } else if (['error', 'fetal'].includes(data.substring(0, 5))) {
          sendFail(-14, data);
        } else {
          exec('git rev-parse HEAD', (err2, stdout2, stderr2) => {
            if (err2) {
              sendFail(-15, err2.message);
            } else if (stderr2) {
              sendFail(-16, stderr2);
            } else {
              if (req.body.after.trim() === stdout2.replace(/\n/g, '').trim()) {
                sendSuccess(data);

                const checkText = 'Already up to date.';
                if (data.substring(0, checkText.length) !== checkText) {
                  // npm install 및 pm2 reload 실행
                  exec('npm run install:prod && npm run pm2:reload');
                }
              } else {
                sendFail(-17, data);
              }
            }
          });
        }
      });
    } catch (err) {
      sendFail(-99, '예상치 못한 오류가 발생했습니다.');
    }
  },
};
