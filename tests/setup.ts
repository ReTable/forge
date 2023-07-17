import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import test, { ExecutionContext, OnlyFn, SkipFn, TestFn } from 'ava';

// ----- Types

type SourceMap = {
  version: number;
  sources: string[];
  sourcesContent?: string[];
  mappings: string;
  names: string[];
};

type Platform = 'browser' | 'node';

type SuiteFlag = 'only' | 'skip';

type Suite = (t: ExecutionContext, c: Context) => Promise<void> | void;

type BaseSuiteOptions = {
  check?: boolean;
  dependencies?: string[];
  entries?: string[];
  flag?: SuiteFlag;
  name: string;
  platform: Platform;
  production?: boolean;
  typings?: boolean;
};

type SuiteOptions =
  | (BaseSuiteOptions & { platform: 'browser'; storybook?: boolean })
  | (BaseSuiteOptions & { platform: 'node'; storybook?: never });

type DefineSuite = (title: string, options: SuiteOptions, suite: Suite) => void;

type Fixture = {
  isFailed: boolean;
  workingDir: string;
};

// ----- Constants

const rootDir = dirname(fileURLToPath(import.meta.url));

const fixturesDir = join(rootDir, 'fixtures');

const tmpDir = join(rootDir, 'tmp');

const binPath = resolve(rootDir, '../lib/index.js');

// ----- Fixture

const fixturesCache = new Map<string, Promise<Fixture>>();

async function run(bin: string, args: string[], cwd: string): Promise<void> {
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

async function prepareWorkingDir(id: string, name: string): Promise<string> {
  await mkdir(tmpDir, { recursive: true });

  const workingDir = join(tmpDir, id);

  await cp(join(fixturesDir, name), workingDir, { recursive: true });

  return workingDir;
}

async function prepareMockedModules(workingDir: string): Promise<void> {
  let entries: string[] = [];

  try {
    entries = await readdir(join(workingDir, '__node_modules__'));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }

  await mkdir(join(workingDir, 'node_modules'), { recursive: true });

  for (const entry of entries) {
    await rename(
      join(workingDir, '__node_modules__', entry),
      join(workingDir, 'node_modules', entry),
    );
  }
}

async function prepare(
  id: string,
  { check, dependencies, entries, name, platform, production, storybook, typings }: SuiteOptions,
): Promise<Fixture> {
  const workingDir = await prepareWorkingDir(id, name);

  if (dependencies) {
    await run('/usr/bin/env', ['pnpm', 'install', '--no-lockfile', ...dependencies], workingDir);
  }

  await prepareMockedModules(workingDir);

  const args = ['build', platform];

  if (entries != null) {
    for (const entry of entries) {
      args.push('--entry', entry);
    }
  }

  if (production != null) {
    args.push(production ? '--production' : '--no-production');
  }

  if (check != null) {
    args.push(check ? '--check' : '--no-check');
  }

  if (typings != null) {
    args.push(typings ? '--typings' : '--no-typings');
  }

  if (storybook != null) {
    args.push(storybook ? '--storybook' : '--no-storybook');
  }

  try {
    await run('/usr/bin/env', ['node', binPath, ...args], workingDir);

    return { isFailed: false, workingDir };
  } catch {
    return { isFailed: true, workingDir };
  }
}

async function prepareFixture(options: SuiteOptions): Promise<Fixture> {
  const platform = options.platform === 'node' ? 'pl_n' : 'pl_b';

  let production = 'pr_d';

  if (options.production != null) {
    production = options.production ? 'pr_t' : 'pr_f';
  }

  let check = 'ch_d';

  if (options.check != null) {
    check = options.check ? 'ch_t' : 'ch_f';
  }

  let typings = 'ts_d';

  if (options.typings != null) {
    typings = options.typings ? 'ts_t' : 'ts_f';
  }

  let storybook = 'sb_d';

  if (options.storybook != null) {
    storybook = options.storybook ? 'sb_t' : 'sb_f';
  }

  let entries = 'default';

  if (options.entries != null) {
    entries = options.entries
      .map((entry) =>
        entry.replaceAll('.', '_dot_').replaceAll('/', '_slash_').replaceAll(':', '_colon_'),
      )
      .join('-dl-');
  }

  const id = [options.name, platform, entries, production, check, typings, storybook].join('-');

  let promise = fixturesCache.get(id);

  if (promise == null) {
    promise = prepare(id, options);

    fixturesCache.set(id, promise);
  }

  return promise;
}

// ----- Context

class Context {
  public readonly isFailed: boolean;

  public readonly workingDir: string;

  public constructor({ isFailed, workingDir }: Fixture) {
    this.isFailed = isFailed;
    this.workingDir = workingDir;
  }

  public async isExists(relativePath: string): Promise<boolean> {
    try {
      await stat(this.resolve(relativePath));

      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }

  public async read(relativePath: string): Promise<string> {
    return readFile(this.resolve(relativePath), 'utf8');
  }

  public async readSourceMap(relativePath: string): Promise<SourceMap> {
    const content = await this.read(relativePath);

    return JSON.parse(content) as SourceMap;
  }

  private resolve(relativePath: string): string {
    return join(this.workingDir, relativePath);
  }
}

// ----- Suite

export function setup(): DefineSuite {
  test.after.always(async () => {
    const fixtures = await Promise.all(fixturesCache.values());

    await Promise.all(
      fixtures.map(async (fixture) => rm(fixture.workingDir, { force: true, recursive: true })),
    );
  });

  return (title, options, suite) => {
    let define: OnlyFn | SkipFn | TestFn = test;

    if (options.flag === 'only') {
      define = test.only;
    } else if (options.flag === 'skip') {
      define = test.skip;
    }

    define(title, async (t) => {
      const fixture = await prepareFixture(options);
      const context = new Context(fixture);

      await suite(t, context);
    });
  };
}
