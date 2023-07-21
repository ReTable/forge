import { cosmiconfig } from 'cosmiconfig';

import { Entry, Target } from '../types';

import { defaultBuildConfig, defaultWatchConfig } from './initialConfig';
import { schema } from './schema';

async function loadUserConfig() {
  const result = await cosmiconfig('forge').search();

  if (result == null) {
    return null;
  }

  const userConfig = schema.parse(result.config);

  console.log(`Used config from ${result.filepath}`);

  return userConfig;
}

type Options = {
  target?: Target;

  entries?: string[];

  production?: boolean;
  check?: boolean;
  typings?: boolean;
  storybook?: boolean;

  watch: boolean;
};

type Result = {
  target: Target;

  entries: Entry[];

  production: boolean;
  check: boolean;
  typings: boolean;
  storybook: boolean;

  watch: boolean;
};

function parseCliEntries(entries: string[]) {
  return entries.map((entry) => {
    const [inPath, outPath] = entry.split(':') as [string, string | undefined];

    if (outPath == null) {
      return inPath;
    }

    return {
      in: inPath,
      out: outPath.endsWith('.js') ? outPath.slice(0, -3) : outPath,
    };
  });
}

export async function loadConfig(options: Options): Promise<Result> {
  const defaults = options.watch ? defaultWatchConfig : defaultBuildConfig;

  const userConfig = await loadUserConfig();

  const target = options.target ?? userConfig?.target;

  if (target == null) {
    throw new Error('Target must be provided through CLI arguments or config file');
  }

  const commandConfig = options.watch ? userConfig?.watch : userConfig?.build;

  let entries: Entry[] = defaults.entries;

  if (options.entries != null) {
    entries = parseCliEntries(options.entries);
  } else if (userConfig != null) {
    if ('entry' in userConfig && userConfig.entry != null) {
      entries = [userConfig.entry];
    } else if ('entries' in userConfig && userConfig.entries != null) {
      entries = userConfig.entries;
    }
  }

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
    target,

    entries,

    production,
    check,
    typings: check && typings,
    storybook: target === 'browser' && storybook,

    watch: options.watch,
  };
}
