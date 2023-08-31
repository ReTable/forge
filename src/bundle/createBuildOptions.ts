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
  cssClassPrefix: boolean | string;
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

function getPrefixFrom(cssClassPrefix: boolean | string, packageName: string) {
  if (cssClassPrefix === true) {
    return `${snakeCase(packageName)}__`;
  } else if (cssClassPrefix === false) {
    return '';
  }

  const [scope, name] = packageName.startsWith('@')
    ? packageName.slice(1).split('/')
    : ['', packageName];

  return cssClassPrefix
    .replaceAll('[scope]', snakeCase(scope))
    .replaceAll('[name]', snakeCase(name))
    .replaceAll('[full-name]', snakeCase(packageName));
}

async function applyBrowserOptions(
  buildOptions: BuildOptions,
  { cssClassPrefix, name, production, repositoryRoot, storybook }: BrowserOptions,
) {
  const prefix = getPrefixFrom(cssClassPrefix, name);

  const processCss = await createCssProcessor({
    cssModules: {
      exportGlobals: true,
      generateScopedName: production ? `${prefix}[hash:base64]` : `${prefix}[path][name]__[local]`,
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
    vanillaExtractPlugin({ isProduction: production, prefix }),
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
  cssClassPrefix: boolean | string;
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
  cssClassPrefix,
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
      await applyBrowserOptions(options, {
        cssClassPrefix,
        name,
        production,
        repositoryRoot,
        storybook,
      });

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
