import assert from 'node:assert';
import { readFile } from 'node:fs/promises';

import { Plugin } from 'esbuild';

import { parseDocs } from './parseDocs';
import { renderDocs } from './renderDocs';

export function reactDocgenPlugin(repositoryRoot: string): Plugin {
  return {
    name: 'react-docgen-plugin',

    setup(build) {
      const { absWorkingDir } = build.initialOptions;

      assert(absWorkingDir);

      build.onLoad({ filter: /\.tsx$/ }, async (params) => {
        const content = await readFile(params.path, 'utf8');
        const docs = parseDocs(params.path, {
          packageRoot: absWorkingDir,
          repositoryRoot,
        });
        const docsContent = renderDocs(docs);

        return {
          contents: `${content}\n${docsContent}`,
          loader: 'tsx',
        };
      });
    },
  };
}
