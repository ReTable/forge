import { cosmiconfig } from 'cosmiconfig';

import { Entry, Hook, Target } from '../types';

import { defaultBuildConfig, defaultWatchConfig } from './initialConfig';
import { schema } from './schema';

// region User config

async function loadUserConfig() {
  const result = await cosmiconfig('forge').search();

  if (result == null) {
    return null;
  }

  const userConfig = schema.parse(result.config);

  console.log(`Used config from ${result.filepath}`);

  return userConfig;
}

// endregion

// region Entries

type RawEntry = string | { in: string; out?: string };

function normalizeEntryOut(path: string) {
  return path.endsWith('.js') ? path.slice(0, -3) : path;
}

function parseEntry(entry: RawEntry): Entry {
  if (typeof entry === 'string') {
    const [inPath, outPath] = entry.split(':') as [string, string | undefined];

    if (outPath == null) {
      return inPath;
    }

    return {
      in: inPath,
      out: normalizeEntryOut(outPath),
    };
  }

  if (entry.out != null) {
    return {
      in: entry.in,
      out: normalizeEntryOut(entry.out),
    };
  }

  return entry.in;
}

function parseEntries(entries: RawEntry[]) {
  return entries.map((entry) => parseEntry(entry));
}

// endregion

// region Hooks

function parseCliHooks(hooks: string[]) {
  return hooks.map((hook) => {
    const [command, cwd] = hook.split(':') as [string, string | undefined];

    if (cwd == null) {
      return command;
    }

    return {
      command,
      cwd,
    };
  });
}

function normalizeHooks(hooks: Hook | Hook[]) {
  return Array.isArray(hooks) ? hooks : [hooks];
}

// endregion

// region Load

type Options = {
  target?: Target;

  entries?: string[];

  production?: boolean;
  check?: boolean;
  typings?: boolean;
  storybook?: boolean;

  postBuild?: string[];

  watch: boolean;
};

type Result = {
  target: Target;

  entries: Entry[];

  production: boolean;
  check: boolean;
  typings: boolean;
  storybook: boolean;

  postBuild: Hook[];

  watch: boolean;
};

export async function loadConfig(options: Options): Promise<Result> {
  const defaults = options.watch ? defaultWatchConfig : defaultBuildConfig;

  const userConfig = await loadUserConfig();

  const target = options.target ?? userConfig?.target;

  if (target == null) {
    throw new Error('Target must be provided through CLI arguments or config file');
  }

  const commandConfig = options.watch ? userConfig?.watch : userConfig?.build;

  let entries: RawEntry[] = defaults.entries;

  if (options.entries != null) {
    entries = options.entries;
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

  let postBuild: Hook | Hook[] = [];

  if (options.postBuild != null) {
    postBuild = parseCliHooks(options.postBuild);
  } else if (userConfig?.postBuild != null) {
    postBuild = userConfig.postBuild;
  }

  postBuild = normalizeHooks(postBuild);

  return {
    target,

    entries: parseEntries(entries),

    production,
    check,
    typings: check && typings,
    storybook: target === 'browser' && storybook,

    postBuild,

    watch: options.watch,
  };
}

// endregion
