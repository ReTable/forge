import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { vanillaExtractPlugin as officialPlugin } from '@vanilla-extract/esbuild-plugin';
import { Plugin } from 'esbuild';

type Options = {
  classNamePrefix: string;
  isProduction: boolean;
};

type PluginData = {
  importPath: string;
};

const staticOptions = {
  filter: /\.(css|bmp|gif|ico|jpeg|jpg|png|svg|webp|eot|otf|ttf|woff|woff2)$/,
};

function createIdentifierBuilder(classNamePrefix: string) {
  return ({ hash }: { hash: string }) => `${classNamePrefix}__${hash}`;
}

// NOTE: The old `esbuild` has a little different `entries` format, but it's not a critical for our bundler.
export function vanillaExtractPlugin({ classNamePrefix, isProduction }: Options): Plugin {
  const identifiers = isProduction ? createIdentifierBuilder(classNamePrefix) : 'debug';

  return officialPlugin({
    // NOTE: The `@vanilla-extract/esbuild-plugin` has wrong typings for `identifiers` option. The documentations says
    //       it can be a function, but typings allow to use only `short` and `debug` string literals.
    identifiers: identifiers as never,
    esbuildOptions: {
      plugins: [
        {
          name: 'vanilla-extract-plugin/static',

          setup({ onLoad, onResolve }) {
            onResolve(staticOptions, async ({ importer, path }) => {
              const resolvedPath = resolve(dirname(importer), path);

              // NOTE: Ignores imports of `vanilla-extract` files itself.
              try {
                await stat(resolvedPath);
              } catch {
                return null;
              }

              return {
                path: resolve(dirname(importer), path),
                pluginData: {
                  importPath: path,
                },
              };
            });

            onLoad(staticOptions, ({ pluginData }) => ({
              contents: `export default ${JSON.stringify((pluginData as PluginData).importPath)};`,
              loader: 'js',
            }));
          },
        },
      ],
    },
  }) as unknown as Plugin;
}
