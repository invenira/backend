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

  process.env.DUMMY_AP_PID = await new Promise((resolve, reject) => {
    console.log('Starting Dummy Activity Provider\n');
    const npmi = spawn('npm', ['install'], {
      cwd: './e2e/generated-dummy-ap/',
      shell: true,
      stdio: 'pipe',
    });

    npmi.on('close', () => {
      const ap = spawn('node', ['index.js'], {
        cwd: './e2e/generated-dummy-ap/',
        shell: false,
        stdio: 'pipe',
      });

      ap.stdout.on('data', (data) => {
        if (data.toString().includes('Swagger-ui is available on')) {
          console.log('Dummy Activity Provider started\n');
          resolve(ap.pid?.toString() || '');
        }
      });

      ap.on('error', (err) => {
        reject(`Dummy Activity Provider error: ${err}`);
      });
    });

    npmi.on('error', (err) => {
      reject(`Dummy Activity Provider error: ${err}`);
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
      process.stdout.write(`${data}\n`);
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
