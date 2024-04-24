import fs from 'node:fs/promises';
import module from 'node:module';
import path from 'node:path';
import url from 'node:url';

import * as sass from 'sass';
import { fromObject } from 'convert-source-map';
import { readPackageUpSync } from 'read-package-up';

type Options = {
  path: string;
  sourcemap: boolean;
  sourcesContent: boolean;
};

type Result = {
  css: string;
  watchFiles?: string[];
};

async function renderCss({ path: cssPath }: Options): Promise<Result> {
  const css = await fs.readFile(cssPath, 'utf8');

  return { css };
}

function isValidURL(urlToCheck: string) {
  const parts = urlToCheck.split('/');

  return parts[0].startsWith('@') ? parts.length === 2 : parts.length === 1;
}

function findImportDirectly(name: string, localRequire: NodeJS.Require) {
  try {
    const pkgJsonPath = localRequire.resolve(`${name}/package.json`);
    const dir = path.dirname(pkgJsonPath);
    const json = localRequire(pkgJsonPath) as { sass?: string };

    if (json.sass == null) {
      return null;
    }

    return path.join(dir, json.sass);
  } catch {
    return null;
  }
}

function findImportConditionally(name: string, localRequire: NodeJS.Require) {
  try {
    const entry = localRequire.resolve(name);

    const result = readPackageUpSync({ cwd: path.dirname(entry) });

    if (result == null) {
      return null;
    }

    const { packageJson, path: pkgJsonPath } = result as {
      packageJson: { sass?: string };
      path: string;
    };

    if (packageJson.sass == null) {
      return null;
    }

    return path.join(path.dirname(pkgJsonPath), packageJson.sass);
  } catch {
    return null;
  }
}

function findImport(name: string, localRequire: NodeJS.Require) {
  const directImport = findImportDirectly(name, localRequire);

  if (directImport != null) {
    return directImport;
  }

  return findImportConditionally(name, localRequire);
}

function createImporter(importerPath: string): sass.FileImporter<'sync'> {
  return {
    findFileUrl(pkgUrl: string) {
      if (!pkgUrl.startsWith('~')) {
        return null;
      }

      const importUrl = pkgUrl.slice(1);

      if (!isValidURL(importUrl)) {
        throw new Error(`Wrong package name: "${importUrl}"`);
      }

      const localRequire = module.createRequire(importerPath);

      const importPath = findImport(importUrl, localRequire);

      if (importPath != null) {
        return url.pathToFileURL(importPath);
      }

      throw new Error(`Package "${importUrl}" has no "sass" field`);
    },
  };
}

function renderScss({ path: importerPath, sourcemap, sourcesContent }: Options): Result {
  const importer = createImporter(importerPath);

  const result = sass.compile(importerPath, {
    importers: [importer],
    sourceMap: sourcemap,
    sourceMapIncludeSources: sourcesContent,
  });

  let { css } = result;

  const { loadedUrls, sourceMap } = result;

  if (sourceMap != null) {
    css += fromObject(sourceMap).toComment({ multiline: true });
  }

  const dependencies = loadedUrls.map((loadedUrl) => url.fileURLToPath(loadedUrl));

  return { css, watchFiles: dependencies };
}

export async function renderStyle(options: Options): Promise<Result> {
  switch (path.extname(options.path)) {
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
