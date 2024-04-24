import fs from 'node:fs/promises';
import path from 'node:path';

import { build, context } from 'esbuild';
import { findUp } from 'find-up';
import { readPackageUp } from 'read-package-up';

import { Entry, Hook, SVGRComponentNameFn, SVGRDisplayNameFn, Target } from '../types';

import { createBuildOptions } from './createBuildOptions';

type Options = {
  check: boolean;
  entries: Entry[];
  postBuild: Hook[];
  production: boolean;
  storybook: boolean;
  cssClassPrefix: boolean | string;
  svgrComponentName?: SVGRComponentNameFn;
  svgrDisplayName?: SVGRDisplayNameFn;
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
  svgrDisplayName,
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

  const packageRoot = path.dirname(pkg.path);

  const repositoryPath = await findUp('.git', { cwd: packageRoot, type: 'directory' });

  if (repositoryPath == null) {
    throw new Error("Couldn't find a repository root");
  }

  const repositoryRoot = path.dirname(repositoryPath);

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
    svgrDisplayName,
    target,
    typings,
  });

  if (production) {
    await Promise.all([
      fs.rm(path.join(packageRoot, 'lib'), { force: true, recursive: true }),
      fs.rm(path.join(packageRoot, 'typings'), { force: true, recursive: true }),
    ]);
  }

  if (watch) {
    const ctx = await context(buildOptions);

    await ctx.watch();
  } else {
    await build(buildOptions);
  }
}
