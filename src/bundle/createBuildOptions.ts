import { join } from 'node:path';

import { BuildOptions } from 'esbuild';

import {
  cssAutoImportPlugin,
  reactDocgenPlugin,
  stylesPlugin,
  svgPlugin,
  typescriptPlugin,
  vanillaExtractPlugin,
} from '../plugins';
import { createCssProcessor } from '../postcss';
import { Platform } from '../types';

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

function parseEntries(entries: string[]) {
  // NOTE: We cast result to the `entryPoints` type. Our parser returns the `Array<string | { in: string, out: string }`
  //       type. But `entryPoints` has a type `string[] | Array<{ in: string, out: string }>` and it's actually an
  //       error in typings.
  //       Actually, `esbuild` can consume mixed entry points in the same time.
  return entries.map((rawEntry) => {
    const [inPath, outPath] = rawEntry.split(':') as [string, string | undefined];

    // NOTE: The `join` function trim leading `./` path section, but it's required for `esbuild` to be sure that's not
    //       an external package (if entry hasn't extension).
    const entry = `./${join('src', inPath)}`;

    if (outPath == null) {
      return entry;
    }

    return {
      in: entry,
      out: outPath.endsWith('.js') ? outPath.slice(0, -3) : outPath,
    };
  }) as NonNullable<BuildOptions['entryPoints']>;
}

/* eslint-disable no-param-reassign */

async function applyBrowserOptions(
  buildOptions: BuildOptions,
  { name, production, repositoryRoot, storybook }: BrowserOptions,
) {
  const processCss = await createCssProcessor({
    cssModules: {
      exportGlobals: true,
      generateScopedName: production ? '[hash:base64]' : `${name}//[path][name]__[local]`,
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
    vanillaExtractPlugin(),
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
  entries: string[];
  name: string;
  packageRoot: string;
  platform: Platform;
  production: boolean;
  repositoryRoot: string;
  storybook: boolean;
  typings: boolean;
};

export async function createBuildOptions({
  check,
  entries,
  name,
  packageRoot,
  platform,
  production,
  repositoryRoot,
  storybook,
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

  switch (platform) {
    case 'browser': {
      await applyBrowserOptions(options, { name, production, repositoryRoot, storybook });

      break;
    }
    case 'node': {
      applyNodeOptions(options);

      break;
    }
  }

  if (check) {
    options.plugins = options.plugins ?? [];

    options.plugins.push(typescriptPlugin(typings));
  }

  return options;
}
