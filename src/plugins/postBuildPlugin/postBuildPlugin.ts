import path from 'node:path';

import { Plugin } from 'esbuild';
import { execa } from 'execa';

import { Hook } from '../../types';

function prepareHooks(hooks: Hook[], workingDir: string) {
  return hooks.map((hook) => {
    if (typeof hook === 'string') {
      return {
        command: hook,
        cwd: workingDir,
      };
    }

    return {
      command: hook.command,
      cwd: hook.cwd == null ? workingDir : path.join(workingDir, hook.cwd),
    };
  });
}

export function postBuildPlugin(initialHooks: Hook[]): Plugin {
  return {
    name: 'post-build-plugin',

    setup({ initialOptions, onEnd }) {
      if (initialHooks.length === 0) {
        return;
      }

      const hooks = prepareHooks(initialHooks, initialOptions.absWorkingDir ?? process.cwd());

      onEnd(async (result) => {
        if (result.errors.length > 0) {
          return;
        }

        for (const { command, cwd } of hooks) {
          await execa(command, { shell: 'sh', stdio: 'inherit', cwd });
        }
      });
    },
  };
}
