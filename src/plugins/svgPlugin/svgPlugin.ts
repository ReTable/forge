import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { Config, transform } from '@svgr/core';
import { cosmiconfig } from 'cosmiconfig';
import { Plugin } from 'esbuild';
import { optimize } from 'svgo';

import { getOriginalPath, isVanillaCss } from '../vanillaExtractPlugin';

import { applyComponentName } from './applyComponentName';

type PluginData = {
  path: string;
};

const svgrSuffix = '?svgr';

type Options = {
  svgrComponentName?: (componentName: string) => string;
};

export function svgPlugin({ svgrComponentName }: Options): Plugin {
  return {
    name: 'svg-plugin',

    async setup({ initialOptions, onLoad, onResolve }) {
      const minify = Boolean(initialOptions.minify);

      // NOTE: The `svgr` uses runtime config over CLI config. We avoid this behaviour.
      const userConfig: { config: Config } | null = await cosmiconfig('svgr').search();

      const memo = userConfig?.config.memo ?? true;

      const config: Config = {
        ...userConfig?.config,

        exportType: 'named',
        memo,
        namedExport: 'ReactComponent',
        plugins: ['@svgr/plugin-jsx'],
        runtimeConfig: false,
        template(variables, { tpl }) {
          applyComponentName(variables, { memo, transformName: svgrComponentName });

          return tpl`
            ${variables.imports};

            ${variables.interfaces};

            const ${variables.componentName} = (${variables.props}) => (
              ${variables.jsx}
            );

            ${variables.exports};
          `;
        },
        svgo: minify,
      };

      onResolve(
        {
          filter: /^ni:svgr;/,
        },
        ({ pluginData }) => ({ path: (pluginData as PluginData).path }),
      );

      onResolve(
        {
          filter: /\.svg$/,
        },
        ({ importer, kind, path }) => {
          const importerPath = isVanillaCss(importer) ? getOriginalPath(importer) : importer;

          const absPath = resolve(dirname(importerPath), path);

          const isCSSImport = kind === 'import-rule' || kind === 'url-token';

          return isCSSImport ? { path: absPath } : { path: absPath, suffix: svgrSuffix };
        },
      );

      onLoad(
        {
          filter: /\.svg(\?svgr)?$/,
        },
        async ({ path, suffix }) => {
          const svg = await readFile(path, 'utf8');

          if (suffix !== svgrSuffix) {
            return {
              contents: minify ? optimize(svg).data : svg,
              loader: 'file',
              resolveDir: dirname(path),
            };
          }

          const component = await transform(svg, config, {
            filePath: path,
          });

          const base64 = createHash('sha256').update(component).digest('base64url');
          const url = `ni:svgr;${base64}`;

          const contents = [
            `import svgUrl from ${JSON.stringify(url)};`,
            'export default svgUrl;',
            component,
          ].join('\n');

          return {
            contents,
            loader: 'jsx',
            pluginData: {
              path,
            },
            resolveDir: dirname(path),
          };
        },
      );
    },
  };
}
