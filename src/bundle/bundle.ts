import { rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { build, context } from 'esbuild';
import { findUp } from 'find-up';
import { readPackageUp } from 'read-package-up';

import { Entry, Hook, Target } from '../types';

import { createBuildOptions } from './createBuildOptions';

type Options = {
  check: boolean;
  entries: Entry[];
  postBuild: Hook[];
  production: boolean;
  storybook: boolean;
  cssClassPrefix: boolean | string;
  svgrComponentName?: (componentName: string) => string;
  target: Target;
  typings: boolean;
  watch: boolean;
};

export async function bundle({
  check,
  cssClassPrefix,
  entries,
  postBuild,
  production,
  storybook,
  svgrComponentName,
  target,
  typings,
  watch,
}: Options): Promise<void> {
  const pkg = await readPackageUp({ normalize: false });

  if (pkg == null) {
    throw new Error("Couldn't find a `package.json`");
  }

  const { name } = pkg.packageJson;

  if (name == null || name.length === 0) {
    throw new Error('Package must have a name');
  }

  const packageRoot = dirname(pkg.path);

  const repositoryPath = await findUp('.git', { cwd: packageRoot, type: 'directory' });

  if (repositoryPath == null) {
    throw new Error("Couldn't find a repository root");
  }

  const repositoryRoot = dirname(repositoryPath);

  const buildOptions = await createBuildOptions({
    check,
    cssClassPrefix,
    entries,
    name,
    packageRoot,
    postBuild,
    production,
    repositoryRoot,
    storybook,
    svgrComponentName,
    target,
    typings,
  });

  if (production) {
    await Promise.all([
      rm(join(packageRoot, 'lib'), { force: true, recursive: true }),
      rm(join(packageRoot, 'typings'), { force: true, recursive: true }),
    ]);
  }

  if (watch) {
    const ctx = await context(buildOptions);

    await ctx.watch();
  } else {
    await build(buildOptions);
  }
}
