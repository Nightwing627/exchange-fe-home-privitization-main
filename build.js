const cp = require('child_process');

cp.exec('gulp build', { cwd: '.' }, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
