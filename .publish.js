const ll = console.log;

const exec = require('child_process').exec;

const isWin = process.platform === 'win32';
const mode = process.env.NODE_ENV;

if (!['development', 'staging', 'production'].includes(mode)) {
  ll('Invalid mode :', mode);
  return;
}

ll('git branch');
exec('git branch', (err, stdout, stderr) => {
  if (err) {
    ll(err);
    return;
  }

  let currentBranch = undefined;

  stdout.split('\n').find((branch) => {
    if (branch.indexOf('* ') === 0) {
      currentBranch = branch.substr(2).trim();
      return true;
    }
  });

  if (!currentBranch) {
    ll('Cannot find current branch');
    return;
  }

  ll(`git checkout publish/${mode}`);
  exec(`git checkout publish/${mode}`, (err, stdout, stderr) => {
    if (err) {
      ll(err);
      return;
    }

    ll(`git merge -X theirs ${currentBranch}`);
    exec(`git merge -X theirs ${currentBranch}`, (err, stdout, stderr) => {
      ll('npm run reset-gitignore');
      exec('npm run reset-gitignore', (err, stdout, stderr) => {
        if (err) {
          ll(err);
          return;
        }

        const command = isWin
          ? 'cmd /V /C "set "GIT_EDITOR=true" && git merge --continue"'
          : 'GIT_EDITOR=true git merge --continue';
        ll(command);
        exec(command, (err, stdout, stderr) => {
          ll(`git push origin publish/${mode}`);
          exec(`git push origin publish/${mode}`, (err, stdout, stderr) => {
            if (err) {
              ll(err);
              return;
            }

            ll(`git checkout ${currentBranch}`);
            exec(`git checkout ${currentBranch}`, (err, stdout, stderr) => {
              if (err) {
                ll(err);
                return;
              }

              ll('success');
            });
          });
        });
      });
    });
  });
});
