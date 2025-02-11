import { spawn } from 'child_process';

/* eslint-disable */
/* tslint-disable */

module.exports = async function () {
  console.log('\nStarting E2E Environment\n');

  await new Promise((resolve, reject) => {
    console.log('Starting Mongo DB\n');
    const docker = spawn(
      'docker',
      ['compose', '-f', 'docker-compose-test.yaml', 'up'],
      {
        shell: true,
        stdio: 'pipe',
      },
    );

    docker.stdout.on('data', (data) => {
      if (
        data
          .toString()
          .includes('"ctx":"initandlisten","msg":"mongod startup complete"')
      ) {
        console.log('Mongo DB started\n');
        resolve(docker);
      }
    });

    docker.on('error', (err) => {
      reject(`Docker error: ${err}`);
    });
  });

  await new Promise<void>((resolve, reject) => {
    console.log('Building Backend\n');
    const docker = spawn('npm', ['run', 'build'], {
      shell: true,
      stdio: 'pipe',
    });

    docker.stdout.on('close', () => {
      console.log('Backend Build completed\n');
      resolve();
    });

    docker.on('error', (err) => {
      reject(`Build error: ${err}`);
    });
  });

  const customEnv = {
    ...process.env,
    OAUTH_KEY: '123456789',
  };

  // @ts-ignore
  process.env.BACKEND_PID = await new Promise((resolve, reject) => {
    console.log('Starting Backend\n');
    const server = spawn('node', ['dist/src/main'], {
      shell: false,
      stdio: 'pipe',
      env: customEnv,
    });

    server.stdout.on('data', (data) => {
      if (data.toString().includes('Started in')) {
        console.log('Backend started\n');
        resolve(server.pid?.toString() || '');
      }
    });

    server.on('error', (err) => {
      reject(`Backend error: ${err}`);
    });
  });
};
