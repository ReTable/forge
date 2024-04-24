import fs from 'node:fs/promises';
import path from 'node:path';

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

        for (const output in outputs) {
          if (!output.endsWith('.js')) {
            continue;
          }

          const { cssBundle } = outputs[output];

          if (cssBundle == null) {
            continue;
          }

          const sourcePath = path.join(absWorkingDir, output);
          const sourceContent = await fs.readFile(sourcePath, 'utf8');

          const sourcemapPath = path.join(absWorkingDir, `${output}.map`);
          const sourcemapContent = await fs.readFile(sourcemapPath, 'utf8');

          const consumer = await new SourceMapConsumer(sourcemapContent);
          const node = SourceNode.fromStringWithSourceMap(sourceContent, consumer);

          const importPath = path.relative(path.dirname(output), cssBundle);

          node.prepend(`import "./${importPath}";\n\n`);

          const { code, map } = node.toStringWithSourceMap();

          await fs.writeFile(sourcePath, code, 'utf8');
          await fs.writeFile(sourcemapPath, map.toString(), 'utf8');
        }
      });
    },
  };
}
