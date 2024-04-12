const exec = require('child_process').exec;

const isWin = process.platform === 'win32';
const mode = process.env.NODE_ENV;
const parentBranch =
  mode === 'production' ? 'main' : mode === 'staging' ? 'staging' : mode === 'development' ? 'dev' : undefined;

if (!parentBranch) {
  console.error('Invalid mode :', mode);
  return;
}

console.log(`git checkout publish/${mode}`);
exec(`git checkout publish/${mode}`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`git merge ${parentBranch}`);
  exec(`git merge ${parentBranch}`, (err, stdout, stderr) => {
    console.log('npm run reset-gitignore');
    exec('npm run reset-gitignore', (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }

      const command = isWin
        ? 'cmd /V /C "set "GIT_EDITOR=true" && git merge --continue"'
        : 'GIT_EDITOR=true git merge --continue';
      console.log(command);
      exec(command, (err, stdout, stderr) => {
        console.log(`git push origin publish/${mode}`);
        exec(`git push origin publish/${mode}`, (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }

          console.log(`git checkout ${parentBranch}`);
          exec(`git checkout ${parentBranch}`, (err, stdout, stderr) => {
            if (err) {
              console.error(err);
              return;
            }

            console.log('success');
          });
        });
      });
    });
  });
});
