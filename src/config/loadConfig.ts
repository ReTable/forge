import { cosmiconfig } from 'cosmiconfig';

import { Platform } from '../types';

import { config } from './config';
import { defaultBuildConfig, defaultWatchConfig } from './initialConfig';

async function loadUserConfig() {
  const result = await cosmiconfig('forge').search();

  if (result == null) {
    return null;
  }

  const userConfig = config.parse(result.config);

  console.log(`Used config from ${result.filepath}`);

  return userConfig;
}

type Options = {
  target?: Platform;

  entries?: string[];

  production?: boolean;
  check?: boolean;
  typings?: boolean;
  storybook?: boolean;

  watch: boolean;
};

type Result = {
  platform: Platform;

  entries: string[];

  production: boolean;
  check: boolean;
  typings: boolean;
  storybook: boolean;

  watch: boolean;
};

export async function loadConfig(options: Options): Promise<Result> {
  const defaults = options.watch ? defaultWatchConfig : defaultBuildConfig;

  const userConfig = await loadUserConfig();

  const platform = options.target ?? userConfig?.platform;

  if (platform == null) {
    throw new Error('Platform must be provided through CLI arguments or config file');
  }

  const commandConfig = options.watch ? userConfig?.watch : userConfig?.build;

  const production =
    options.production ??
    commandConfig?.production ??
    userConfig?.production ??
    defaults.production;

  const check = options.check ?? commandConfig?.check ?? userConfig?.check ?? defaults.check;

  const typings =
    options.typings ?? commandConfig?.typings ?? userConfig?.typings ?? defaults.typings;

  const storybook =
    options.storybook ?? commandConfig?.storybook ?? userConfig?.storybook ?? defaults.storybook;

  return {
    platform,

    entries: ['index'],

    production,
    check,
    typings: check && typings,
    storybook: platform === 'browser' && storybook,

    watch: options.watch,
  };
}
