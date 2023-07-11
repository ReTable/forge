import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import * as sass from 'sass';
import { fromObject } from 'convert-source-map';

type Options = {
  path: string;
  sourcemap: boolean;
  sourcesContent: boolean;
};

type Result = {
  css: string;
  watchFiles?: string[];
};

async function renderCss({ path }: Options): Promise<Result> {
  const css = await readFile(path, 'utf8');

  return { css };
}

function isValidURL(url: string) {
  const parts = url.split('/');

  return parts[0].startsWith('@') ? parts.length === 2 : parts.length === 1;
}

function createImporter(path: string): sass.FileImporter<'sync'> {
  return {
    findFileUrl(pkgUrl: string) {
      if (!pkgUrl.startsWith('~')) {
        return null;
      }

      const url = pkgUrl.slice(1);

      if (!isValidURL(url)) {
        throw new Error(`Wrong package name: "${url}"`);
      }

      const localRequire = createRequire(path);

      const packageJsonPath = localRequire.resolve(`${url}/package.json`);
      const packageJsonDir = dirname(packageJsonPath);
      const packageJson = localRequire(packageJsonPath) as { sass?: string };

      if (packageJson.sass != null) {
        const importPath = join(packageJsonDir, packageJson.sass);

        return pathToFileURL(importPath);
      }

      throw new Error(`Package "${url}" has no "sass" field`);
    },
  };
}

function renderScss({ path, sourcemap, sourcesContent }: Options): Result {
  const importer = createImporter(path);

  const result = sass.compile(path, {
    importers: [importer],
    sourceMap: sourcemap,
    sourceMapIncludeSources: sourcesContent,
  });

  let { css } = result;

  const { loadedUrls, sourceMap } = result;

  if (sourceMap != null) {
    css += fromObject(sourceMap).toComment({ multiline: true });
  }

  const dependencies = loadedUrls.map((url) => fileURLToPath(url));

  return { css, watchFiles: dependencies };
}

export async function renderStyle(options: Options): Promise<Result> {
  switch (extname(options.path)) {
    case '.css':
    case '.pcss': {
      return renderCss(options);
    }
    case '.sass':
    case '.scss': {
      return renderScss(options);
    }
    default: {
      throw new Error(`Unknown extension of the '${options.path}`);
    }
  }
}
