import { spawn } from 'child_process';

/* eslint-disable */
/* tslint-disable */

module.exports = async function () {
  console.log('\nStopping E2E Environment\n');
  // @ts-ignore
  const bPid = process.env.BACKEND_PID;
  // @ts-ignore
  const apPid = process.env.DUMMY_AP_PID;

  console.log(`Stopping Backend PID: ${bPid}`);
  // @ts-ignore
  process.kill(bPid, 'SIGKILL');

  console.log(`Stopping Dummy AP PID: ${apPid}`);
  // @ts-ignore
  process.kill(apPid, 'SIGKILL');

  await new Promise((resolve, reject) => {
    console.log(`Stopping MongoDB`);
    const docker = spawn(
      'docker',
      ['compose', '-f', 'docker-compose-test.yaml', 'down', '--volumes'],
      {
        shell: true,
        stdio: 'pipe',
      },
    );

    docker.on('error', (err) => {
      reject(`Docker error: ${err}`);
    });

    docker.on('close', () => {
      console.log(`MongoDB stopped`);
      resolve('');
    });
  });
};
