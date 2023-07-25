import { spawn } from 'node:child_process';

export async function run(bin: string, args: string[], cwd: string): Promise<void> {
  return new Promise((done, reject) => {
    const childProcess = spawn(bin, args, {
      cwd,
      stdio: 'ignore',
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        done();
      } else {
        reject();
      }
    });

    childProcess.on('error', reject);
  });
}
