import { cp, mkdir, readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { binPath, fixturesDir, tmpDir } from './paths';
import { run } from './run';
import { BuildFixtureOptions, Fixture, FixtureOptions, InitFixtureOptions } from './types';

const fixturesCache = new Map<string, Promise<Fixture>>();

// region Build

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

async function prepareForBuild(
  workingDir: string,
  { check, dependencies, entries, target, production, storybook, typings }: BuildFixtureOptions,
) {
  if (dependencies) {
    await run('/usr/bin/env', ['pnpm', 'install', '--no-lockfile', ...dependencies], workingDir);
  }

  await prepareMockedModules(workingDir);

  const args = ['--target', target];

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

  await run('/usr/bin/env', ['node', binPath, ...args], workingDir);
}

// endregion

// region Init

async function prepareForInit(workingDir: string, { target }: InitFixtureOptions) {
  const args = ['init', `--target`, target];

  await run('/usr/bin/env', ['node', binPath, ...args], workingDir);
}

// endregion

// region Fixture Preparation

async function prepareWorkingDir(id: string, name: string): Promise<string> {
  await mkdir(tmpDir, { recursive: true });

  const workingDir = join(tmpDir, id);

  await cp(join(fixturesDir, name), workingDir, { recursive: true });

  return workingDir;
}

async function prepare(id: string, options: FixtureOptions): Promise<Fixture> {
  const workingDir = await prepareWorkingDir(id, options.name);

  try {
    await (options.command === 'build'
      ? prepareForBuild(workingDir, options)
      : prepareForInit(workingDir, options));

    return { isFailed: false, workingDir };
  } catch {
    return { isFailed: true, workingDir };
  }
}

// endregion

// region Fixture ID

function createFixtureIdFor(options: FixtureOptions): string {
  const chunks: string[] = [
    options.command,
    options.name,
    options.target === 'node' ? 'tg_n' : 'tg_b',
  ];

  if (options.command === 'build') {
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

    chunks.push(entries, production, check, typings, storybook);
  }

  return chunks.join('-');
}

// endregion

export async function prepareFixture(options: FixtureOptions): Promise<Fixture> {
  const id = createFixtureIdFor(options);

  let promise = fixturesCache.get(id);

  promise = promise == null ? prepare(id, options) : promise.then((fixture) => fixture);

  fixturesCache.set(id, promise);

  return promise;
}

export async function clearFixtures(): Promise<void> {
  const fixtures = await Promise.all(fixturesCache.values());

  await Promise.all(
    fixtures.map(async (fixture) => rm(fixture.workingDir, { force: true, recursive: true })),
  );
}
