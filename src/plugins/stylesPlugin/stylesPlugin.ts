import path from 'node:path';

import { Plugin } from 'esbuild';

import { CssProcessor } from '../../postcss';

import { renderModule } from './renderModule';
import { renderStyle } from './renderStyle';

type Options = {
  processCss: CssProcessor;
};

type CssPluginData = {
  css: string;
  path: string;
};

type JsPluginData = {
  css: string;
  resolveDir: string;
};

const moduleSuffix = '?css-module';

export function stylesPlugin({ processCss }: Options): Plugin {
  return {
    name: 'styles-plugin',

    setup(build) {
      const sourcemap = Boolean(build.initialOptions.sourcemap);
      const sourcesContent = Boolean(build.initialOptions.sourcesContent);

      build.onResolve(
        {
          filter: /^~.*\.css$/,
        },
        async ({ path: importedPath, importer, resolveDir, kind }) =>
          build.resolve(importedPath.slice(1), {
            importer,
            kind,
            resolveDir,
          }),
      );

      build.onResolve(
        {
          filter: /^ni:css-module;/,
        },
        ({ pluginData, resolveDir }) => ({
          path: (pluginData as CssPluginData).path,
          pluginData: {
            css: (pluginData as CssPluginData).css,
            resolveDir,
          },
          suffix: moduleSuffix,
        }),
      );

      build.onLoad(
        {
          filter: /\.(css|pcss|scss)(\?css-module)?$/,
          namespace: 'file',
        },
        async ({ path: loadedPath, pluginData, suffix }) => {
          // Step 1: If file has a suffix of the CSS Module, then just load CSS
          //         as is.

          if (suffix === moduleSuffix) {
            return {
              contents: (pluginData as JsPluginData).css,
              resolveDir: (pluginData as JsPluginData).resolveDir,
              loader: 'css',
            };
          }

          // Step 2: Render a styles.

          const { css: renderedCss, watchFiles } = await renderStyle({
            path: loadedPath,
            sourcemap,
            sourcesContent,
          });

          // Step 3: Process rendered styles with PostCSS.

          const { classNames, css } = await processCss({
            css: renderedCss,
            from: loadedPath,
            modules: /\.module\.\w{3,4}$/.test(loadedPath),
          });

          // Step 4: If it's a not a CSS module, then load processed CSS as is.

          if (classNames === false) {
            return {
              contents: css,
              loader: 'css',
              watchFiles,
            };
          }

          // Step 5: Render JS module with CSS module import.

          return {
            contents: renderModule({ classNames, css }),
            loader: 'js',
            pluginData: {
              css,
              path: loadedPath,
            },
            resolveDir: path.dirname(loadedPath),
            watchFiles,
          };
        },
      );
    },
  };
}
