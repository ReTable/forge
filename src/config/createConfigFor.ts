import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import chalk from 'chalk';
import { findUp } from 'find-up';

import { Platform } from '../types';

import { Config } from './config';

export async function createConfigFor(platform: Platform): Promise<void> {
  const packageJsonPath = await findUp('package.json');

  if (packageJsonPath == null) {
    throw new Error("Couldn't find a `package.json`");
  }

  const configFilePath = join(dirname(packageJsonPath), '.forgerc');

  const config: Config = {
    $schema: 'https://github.com/ReTable/forge/blob/main/schemas/forgerc.json',

    platform,

    entry: 'index',

    check: true,
    typings: true,

    build: {
      production: true,
    },

    watch: {
      production: false,
      storybook: platform === 'browser' ? true : undefined,
    },
  };

  await writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf8');

  console.log(chalk.green(`Created configuration file: ${configFilePath}`));
}
