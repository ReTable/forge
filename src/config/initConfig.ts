import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import chalk from 'chalk';
import { findUp } from 'find-up';

import { Target } from '../types';

import { Config } from './config';
import { initialConfig } from './initialConfig';

const SCHEMA_URL = 'https://github.com/ReTable/forge/blob/main/schemas/forgerc.json';

export async function initConfig(target: Target): Promise<void> {
  const packageJsonPath = await findUp('package.json');

  if (packageJsonPath == null) {
    throw new Error("Couldn't find a `package.json`");
  }

  const configFilePath = join(dirname(packageJsonPath), '.forgerc');

  const config: Config = {
    $schema: SCHEMA_URL,

    target,

    ...initialConfig,
  };

  if (target === 'node') {
    delete config.storybook;
    delete config.build?.storybook;
    delete config.watch?.storybook;
  }

  await writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf8');

  console.log(chalk.green(`Created configuration file: ${configFilePath}`));
}
