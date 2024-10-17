import fs from 'node:fs/promises';
import path from 'node:path';

import { vanillaExtractPlugin as officialPlugin } from '@vanilla-extract/esbuild-plugin';
import { Plugin } from 'esbuild';

type Options = {
  isProduction: boolean;
  prefix: string;
};

type PluginData = {
  importPath: string;
};

const staticOptions = {
  filter: /\.(css|bmp|gif|ico|jpeg|jpg|png|svg|webp|eot|otf|ttf|woff|woff2)$/,
};

function getIdentifiersBuilder({ isProduction, prefix }: Options) {
  if (!isProduction) {
    return 'debug';
  }

  if (prefix.length === 0) {
    return 'short';
  }

  return ({ hash }: { hash: string }) => `${prefix}${hash}`;
}

// NOTE: The old `esbuild` has a little different `entries` format, but it's not a critical for our bundler.
export function vanillaExtractPlugin(options: Options): Plugin {
  return officialPlugin({
    // NOTE: The `@vanilla-extract/esbuild-plugin` has wrong typings for `identifiers` option. The documentations says
    //       it can be a function, but typings allow to use only `short` and `debug` string literals.
    identifiers: getIdentifiersBuilder(options) as never,
    esbuildOptions: {
      define: {
        'import.meta.env.DEV': JSON.stringify(!options.isProduction),
        'import.meta.env.PROD': JSON.stringify(options.isProduction),
        'import.meta.env.MODE': JSON.stringify(options.isProduction ? 'production' : 'development'),
      },

      plugins: [
        {
          name: 'vanilla-extract-plugin/static',

          setup(build) {
            build.onResolve(staticOptions, async ({ importer, path: importedPath }) => {
              const resolvedPath = path.resolve(path.dirname(importer), importedPath);

              // NOTE: Ignores imports of `vanilla-extract` files itself.
              try {
                await fs.stat(resolvedPath);
              } catch {
                return null;
              }

              return {
                path: path.resolve(path.dirname(importer), importedPath),
                pluginData: {
                  importPath: importedPath,
                },
              };
            });

            build.onLoad(staticOptions, ({ pluginData }) => ({
              contents: `export default ${JSON.stringify((pluginData as PluginData).importPath)};`,
              loader: 'js',
            }));
          },
        },
      ],
    },
  }) as unknown as Plugin;
}
