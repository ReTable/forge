import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { Config, transform } from '@svgr/core';
import { cosmiconfig } from 'cosmiconfig';
import { Plugin } from 'esbuild';
import { optimize } from 'svgo';

import { SVGRComponentNameFn, SVGRDisplayNameFn } from '../../types';

import { getOriginalPath, isVanillaCss } from '../vanillaExtractPlugin';

import { applyComponentName } from './applyComponentName';
import { buildDisplayName } from './buildDisplayName';

type PluginData = {
  path: string;
};

const svgrSuffix = '?svgr';

type Options = {
  svgrComponentName?: SVGRComponentNameFn;
  svgrDisplayName?: SVGRDisplayNameFn;
};

export function svgPlugin({ svgrComponentName, svgrDisplayName }: Options): Plugin {
  return {
    name: 'svg-plugin',

    async setup(build) {
      const minify = Boolean(build.initialOptions.minify);

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

          const displayName = buildDisplayName(variables.componentName, {
            memo,
            transformDisplayName: svgrDisplayName,
          });

          return tpl`
            ${variables.imports};

            ${variables.interfaces};

            const ${variables.componentName} = (${variables.props}) => (
              ${variables.jsx}
            );

            ${variables.exports};

            ${displayName}
          `;
        },
        svgo: minify,
      };

      build.onResolve(
        {
          filter: /^ni:svgr;/,
        },
        ({ pluginData }) => ({ path: (pluginData as PluginData).path }),
      );

      build.onResolve(
        {
          filter: /\.svg$/,
        },
        ({ importer, kind, path: importedPath }) => {
          const importerPath = isVanillaCss(importer) ? getOriginalPath(importer) : importer;

          const absPath = path.resolve(path.dirname(importerPath), importedPath);

          const isCSSImport = kind === 'import-rule' || kind === 'url-token';

          return isCSSImport ? { path: absPath } : { path: absPath, suffix: svgrSuffix };
        },
      );

      build.onLoad(
        {
          filter: /\.svg(\?svgr)?$/,
        },
        async ({ path: loadedPath, suffix }) => {
          const svg = await fs.readFile(loadedPath, 'utf8');

          if (suffix !== svgrSuffix) {
            return {
              contents: minify ? optimize(svg).data : svg,
              loader: 'file',
              resolveDir: path.dirname(loadedPath),
            };
          }

          const component = await transform(svg, config, {
            filePath: loadedPath,
          });

          const base64 = crypto.createHash('sha256').update(component).digest('base64url');
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
              path: loadedPath,
            },
            resolveDir: path.dirname(loadedPath),
          };
        },
      );
    },
  };
}
