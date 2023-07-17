import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

import { Plugin } from 'esbuild';
import { SourceMapConsumer, SourceNode } from 'source-map';

export function cssAutoImportPlugin(): Plugin {
  return {
    name: 'css-auto-import-plugin',

    setup({ initialOptions, onEnd }) {
      const { absWorkingDir } = initialOptions;

      if (absWorkingDir == null) {
        throw new Error('The `absWorkingDir` option must be defined');
      }

      onEnd(async (result) => {
        const { outputs } = result.metafile ?? { outputs: null };

        if (outputs == null) {
          return;
        }

        for (const path in outputs) {
          if (!path.endsWith('.js')) {
            continue;
          }

          const { cssBundle } = outputs[path];

          if (cssBundle == null) {
            continue;
          }

          const sourcePath = join(absWorkingDir, path);
          const sourceContent = await readFile(sourcePath, 'utf8');

          const sourcemapPath = join(absWorkingDir, `${path}.map`);
          const sourcemapContent = await readFile(sourcemapPath, 'utf8');

          const consumer = await new SourceMapConsumer(sourcemapContent);
          const node = SourceNode.fromStringWithSourceMap(sourceContent, consumer);

          const importPath = relative(dirname(path), cssBundle);

          node.prepend(`import "./${importPath}";\n\n`);

          const { code, map } = node.toStringWithSourceMap();

          await writeFile(sourcePath, code, 'utf8');
          await writeFile(sourcemapPath, map.toString(), 'utf8');
        }
      });
    },
  };
}
