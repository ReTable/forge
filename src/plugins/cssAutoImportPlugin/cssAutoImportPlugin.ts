import fs from 'node:fs/promises';
import path from 'node:path';

import { Plugin } from 'esbuild';

export function cssAutoImportPlugin(): Plugin {
  return {
    name: 'css-auto-import-plugin',

    setup(build) {
      const { absWorkingDir } = build.initialOptions;

      if (absWorkingDir == null) {
        throw new Error('The `absWorkingDir` option must be defined');
      }

      build.onEnd(async (result) => {
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

          const sourceMapName = `${path.basename(output)}.map`;
          const sourceMapComment = `//# sourceMappingURL=${sourceMapName}\n`;

          const importPath = path.relative(path.dirname(output), cssBundle);

          const replacement = `\n// post-build: auto import bundled styles\nimport "./${importPath}";\n\n${sourceMapComment}`;

          await fs.writeFile(
            sourcePath,
            sourceContent.replace(sourceMapComment, replacement),
            'utf8',
          );
        }
      });
    },
  };
}
