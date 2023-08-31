import { join } from 'node:path';

import { snakeCase } from 'change-case';
import { BuildOptions } from 'esbuild';

import {
  cssAutoImportPlugin,
  postBuildPlugin,
  reactDocgenPlugin,
  stylesPlugin,
  svgPlugin,
  typescriptPlugin,
  vanillaExtractPlugin,
} from '../plugins';
import { createCssProcessor } from '../postcss';
import { Entry, Hook, Target } from '../types';

type BrowserOptions = {
  name: string;
  production: boolean;
  repositoryRoot: string;
  storybook: boolean;
};

const extensions = [
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'webp',
  'eot',
  'otf',
  'ttf',
  'woff',
  'woff2',
];

const staticLoaders: NonNullable<BuildOptions['loader']> = {};

for (const extension of extensions) {
  staticLoaders[`.${extension}`] = 'file';
}

function prependEntry(entry: string) {
  return `./${join('src', entry)}`;
}

function parseEntries(entries: Entry[]) {
  // NOTE: We cast result to the `entryPoints` type. Our parser returns the `Array<string | { in: string, out: string }`
  //       type. But `entryPoints` has a type `string[] | Array<{ in: string, out: string }>` and it's actually an
  //       error in typings.
  //       Actually, `esbuild` can consume mixed entry points in the same time.
  return entries.map((entry) => {
    if (typeof entry === 'string') {
      return prependEntry(entry);
    }

    return {
      in: prependEntry(entry.in),
      out: entry.out,
    };
  }) as NonNullable<BuildOptions['entryPoints']>;
}

/* eslint-disable no-param-reassign */

async function applyBrowserOptions(
  buildOptions: BuildOptions,
  { name, production, repositoryRoot, storybook }: BrowserOptions,
) {
  const classNamePrefix = snakeCase(name);

  const processCss = await createCssProcessor({
    cssModules: {
      exportGlobals: true,
      generateScopedName: production
        ? `${classNamePrefix}__[hash:base64]`
        : `${classNamePrefix}__[path][name]__[local]`,
      hashPrefix: name,
      localsConvention: 'camelCaseOnly',
    },
    sourcemap: Boolean(buildOptions.sourcemap),
    sourcesContent: Boolean(buildOptions.sourcesContent),
  });

  buildOptions.assetNames = '[dir]/[name]';

  buildOptions.jsx = 'automatic';
  buildOptions.jsxDev = !production;

  buildOptions.loader = staticLoaders;

  buildOptions.metafile = true;

  buildOptions.platform = 'browser';
  buildOptions.target = 'esnext';

  buildOptions.plugins = [
    cssAutoImportPlugin(),
    stylesPlugin({ processCss }),
    svgPlugin(),
    vanillaExtractPlugin({ classNamePrefix, isProduction: production }),
  ];

  if (storybook) {
    buildOptions.plugins.push(reactDocgenPlugin(repositoryRoot));
  }
}

function applyNodeOptions(buildOptions: BuildOptions) {
  buildOptions.platform = 'node';
  buildOptions.target = 'node18';
}

type Options = {
  check: boolean;
  entries: Entry[];
  name: string;
  packageRoot: string;
  postBuild: Hook[];
  production: boolean;
  repositoryRoot: string;
  storybook: boolean;
  target: Target;
  typings: boolean;
};

export async function createBuildOptions({
  check,
  entries,
  name,
  packageRoot,
  postBuild,
  production,
  repositoryRoot,
  storybook,
  target,
  typings,
}: Options): Promise<BuildOptions> {
  const options: BuildOptions = {
    absWorkingDir: packageRoot,
    bundle: true,
    chunkNames: 'shared/[hash]',
    entryNames: '[dir]/[name]',
    entryPoints: parseEntries(entries),
    format: 'esm',
    logLevel: 'info',
    outbase: 'src',
    outdir: 'lib',
    packages: 'external',
    sourcemap: true,
    sourcesContent: true,
    splitting: true,
    treeShaking: true,
  };

  if (production) {
    options.drop = ['debugger'];
  }

  switch (target) {
    case 'browser': {
      await applyBrowserOptions(options, { name, production, repositoryRoot, storybook });

      break;
    }
    case 'node': {
      applyNodeOptions(options);

      break;
    }
  }

  if (options.plugins == null) {
    options.plugins = [];
  }

  options.plugins.push(postBuildPlugin(postBuild));

  if (check) {
    options.plugins.push(typescriptPlugin(typings));
  }

  return options;
}
