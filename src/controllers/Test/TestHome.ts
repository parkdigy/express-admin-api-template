/********************************************************************************************************************
 * (Test) 홈 화면 Controller
 * ******************************************************************************************************************/
import { MyRequest, MyResponse } from '@types';

export default {
  /********************************************************************************************************************
   * 홈 화면 HTML
   * ******************************************************************************************************************/
  getHtml: (req: MyRequest, res: MyResponse) => {
    if (req.$$user != null) {
      res.send(`
        <div>Welcome, ${req.$$user.email}</div>
        <form action="/test/signout" method="post"><button type="submit">로그아웃</button></form>
      `);
    } else {
      res.send(`
        <div>Welcome</div>
        <a href="/test/signin">로그인</a>
        <a href="/test/signup">회원가입</a>
      `);
    }
  },
};
