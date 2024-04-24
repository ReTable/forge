import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { binPath, fixturesDir, tmpDir } from './paths';
import { run } from './run';
import { BuildFixtureOptions, Fixture, FixtureOptions, InitFixtureOptions } from './types';

const fixturesCache = new Map<string, Promise<Fixture>>();

// region Build

async function prepareMockedModules(workingDir: string): Promise<void> {
  let entries: string[] = [];

  try {
    entries = await fs.readdir(path.join(workingDir, '__node_modules__'));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }

  await fs.mkdir(path.join(workingDir, 'node_modules'), { recursive: true });

  for (const entry of entries) {
    await fs.rename(
      path.join(workingDir, '__node_modules__', entry),
      path.join(workingDir, 'node_modules', entry),
    );
  }
}

async function prepareForBuild(
  workingDir: string,
  {
    check,
    cssClassPrefix,
    dependencies,
    entries,
    target,
    postBuild,
    production,
    storybook,
    typings,
  }: BuildFixtureOptions,
) {
  if (dependencies) {
    await run('/usr/bin/env', ['pnpm', 'install', '--no-lockfile', ...dependencies], workingDir);
  }

  await prepareMockedModules(workingDir);

  // NOTE: Workaround for fixtures which already has `.forgerc.hs` config file.
  try {
    await fs.stat(path.join(workingDir, '.forgerc.js'));
  } catch {
    await fs.writeFile(path.join(workingDir, '.forgerc'), JSON.stringify({ target }), 'utf8');
  }

  const args = [];

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

  if (cssClassPrefix != null) {
    if (cssClassPrefix === true) {
      args.push(`--css-class-prefix`);
    } else if (cssClassPrefix === false) {
      args.push(`--no-css-class-prefix`);
    } else {
      args.push(`--css-class-prefix=${cssClassPrefix}`);
    }
  }

  if (postBuild) {
    for (const hook of postBuild) {
      args.push('--post-build', hook);
    }
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
  await fs.mkdir(tmpDir, { recursive: true });

  const workingDir = path.join(tmpDir, id);

  await fs.cp(path.join(fixturesDir, name), workingDir, { recursive: true });

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
    `command=${options.command}`,
    `name=${options.name}`,
    `target=${options.target}`,
  ];

  if (options.command === 'build') {
    if (options.production != null) {
      chunks.push(`production=${options.production.toString()}`);
    }

    if (options.check != null) {
      chunks.push(`check=${options.check.toString()}`);
    }

    if (options.typings != null) {
      chunks.push(`typings=${options.typings.toString()}`);
    }

    if (options.storybook != null) {
      chunks.push(`storybook=${options.storybook.toString()}`);
    }

    if (options.cssClassPrefix != null) {
      chunks.push(`css-class-prefix=${options.cssClassPrefix.toString()}`);
    }

    if (options.entries != null) {
      for (const entry of options.entries) {
        chunks.push(`entry=${entry}`);
      }
    }

    if (options.postBuild != null) {
      for (const hook of options.postBuild) {
        chunks.push(`postBuild=${hook}`);
      }
    }
  }

  const hash = crypto.createHash('sha256');

  hash.update(chunks.join(' '));

  return hash.digest('hex');
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
    fixtures.map(async (fixture) => fs.rm(fixture.workingDir, { force: true, recursive: true })),
  );
}
