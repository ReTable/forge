import { describe, expect } from 'vitest';

import { createTestApi } from './helpers/createTestApi';

const it = createTestApi();

const images = ['bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png', 'webp'];
const fonts = ['eot', 'otf', 'ttf', 'woff', 'woff2'];

describe('browser', () => {
  describe('entries', () => {
    describe('input', async () => {
      const inputSamples = [
        {
          entries: ['index', 'index.tsx'],
          in: 'index.tsx',
          out: 'index.js',
        },
        {
          entries: ['index.ts'],
          in: 'index.ts',
          out: 'index.js',
        },
        {
          entries: ['file', 'file.tsx'],
          in: 'file.tsx',
          out: 'file.js',
        },
        {
          entries: ['file.ts'],
          in: 'file.ts',
          out: 'file.js',
        },
        {
          entries: ['subdir-ts-and-tsx'],
          in: 'subdir-ts-and-tsx/index.tsx',
          out: 'subdir-ts-and-tsx.js',
        },
        {
          entries: ['subdir-ts-and-tsx/index.tsx'],
          in: 'subdir-ts-and-tsx/index.tsx',
          out: 'subdir-ts-and-tsx/index.js',
        },
        {
          entries: ['subdir-ts-and-tsx/index.ts'],
          in: 'subdir-ts-and-tsx/index.ts',
          out: 'subdir-ts-and-tsx/index.js',
        },
        {
          entries: ['subdir-ts'],
          in: 'subdir-ts/index.ts',
          out: 'subdir-ts.js',
        },
        {
          entries: ['subdir-tsx'],
          in: 'subdir-tsx/index.tsx',
          out: 'subdir-tsx.js',
        },
        {
          entries: ['file-or-subdir', 'file-or-subdir.tsx'],
          in: 'file-or-subdir.tsx',
          out: 'file-or-subdir.js',
        },
        {
          entries: ['file-or-subdir/index', 'file-or-subdir/index.tsx'],
          in: 'file-or-subdir/index.tsx',
          out: 'file-or-subdir/index.js',
        },
      ];

      for (const sample of inputSamples) {
        for (const entry of sample.entries) {
          await it(
            `resolves "${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
            {
              command: 'build',
              name: 'browser-entry',
              target: 'browser',
              entries: [entry],
            },
            async (c) => {
              const bundle = await c.read(`lib/${sample.out}`);

              expect(bundle.startsWith(`// src/${sample.in}\n`)).toBe(true);

              expect(bundle).toMatchSnapshot();
              expect(await c.read(`lib/${sample.out}.map`)).toMatchSnapshot();
            },
          );

          await it(
            `resolves "./${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
            { command: 'build', name: 'browser-entry', target: 'node', entries: [`./${entry}`] },
            async (c) => {
              const bundle = await c.read(`lib/${sample.out}`);

              expect(bundle.startsWith(`// src/${sample.in}\n`)).toBe(true);

              expect(bundle).toMatchSnapshot();
              expect(await c.read(`lib/${sample.out}.map`)).toMatchSnapshot();
            },
          );
        }
      }
    });

    describe('output', async () => {
      const outputSamples = [
        {
          entry: 'index:main',
          in: 'index.tsx',
          out: 'main.js',
        },
        {
          entry: 'index:main.bundle',
          in: 'index.tsx',
          out: 'main.bundle.js',
        },
        {
          entry: 'index:main.js',
          in: 'index.tsx',
          out: 'main.js',
        },
        {
          entry: 'index:bundles/main',
          in: 'index.tsx',
          out: 'bundles/main.js',
        },
      ];

      for (const sample of outputSamples) {
        await it(
          `resolves "${sample.entry} to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
          { command: 'build', name: 'browser-entry', target: 'browser', entries: [sample.entry] },
          async (c) => {
            const bundle = await c.read(`lib/${sample.out}`);

            expect(bundle.startsWith(`// src/${sample.in}\n`)).toBe(true);

            expect(bundle).toMatchSnapshot();
            expect(await c.read(`lib/${sample.out}.map`)).toMatchSnapshot();
          },
        );
      }
    });

    describe('multiple entries', async () => {
      await it(
        `allows to handle multiple entries`,
        {
          command: 'build',
          name: 'browser-multiple-entries',
          target: 'browser',
          entries: ['submoduleA', 'submoduleB'],
        },
        async (c) => {
          expect(await c.read(`lib/submoduleA.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js.map`)).toMatchSnapshot();
        },
      );

      await it(
        'use splitting to share code between multiple entries',
        {
          command: 'build',
          name: 'browser-multiple-entries-splitting',
          target: 'browser',
          entries: ['submoduleA', 'submoduleB'],
        },
        async (c) => {
          expect(await c.read(`lib/submoduleA.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/shared/EB35NJ2I.js`)).toMatchSnapshot();
          expect(await c.read(`lib/shared/EB35NJ2I.js.map`)).toMatchSnapshot();
        },
      );

      await it(
        'create a own CSS bundle for each entry',
        {
          command: 'build',
          name: 'browser-multiple-entries',
          target: 'browser',
          entries: ['submoduleA', 'submoduleB'],
        },
        async (c) => {
          expect(await c.read(`lib/submoduleA.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.css`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.css.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.css`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.css.map`)).toMatchSnapshot();
        },
      );

      await it(
        'create non shared CSS bundle for each entry',
        {
          command: 'build',
          name: 'browser-multiple-entries-splitting-css',
          target: 'browser',
          entries: ['submoduleA', 'submoduleB'],
          dependencies: ['@vanilla-extract/css'],
        },
        async (c) => {
          expect(await c.read(`lib/submoduleA.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.css`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.css.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.css`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.css.map`)).toMatchSnapshot();
        },
      );
    });
  });

  describe('clean', async () => {
    await it(
      "doesn't remove files from the previous build",
      { command: 'build', name: 'browser-clean', target: 'browser', production: false },
      async (c) => {
        expect(await c.isExists('lib/previous.js')).toBe(true);
        expect(await c.isExists('typings/previous.d.ts')).toBe(true);
      },
    );

    await it(
      'removes files from the previous build before production build',
      { command: 'build', name: 'browser-clean', target: 'browser', production: true },
      async (c) => {
        expect(await c.isExists('lib/previous.js')).toBe(false);
        expect(await c.isExists('typings/previous.d.ts')).toBe(false);
      },
    );
  });

  describe('source maps', async () => {
    await it(
      'generates source maps',
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        expect(await c.read('lib/index.js.map')).toMatchSnapshot();
      },
    );

    await it(
      'generates source maps with relative paths',
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        const { sources } = await c.readSourceMap('lib/index.js.map');

        const areAllRelative = sources.every((source) => source.startsWith('../src'));

        expect(areAllRelative).toBe(true);
      },
    );

    await it(
      'generates source maps with sources content',
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        const { sourcesContent } = await c.readSourceMap('lib/index.js.map');

        expect(sourcesContent != null).toBe(true);
        expect((sourcesContent?.length ?? 0) > 0).toBe(true);
      },
    );
  });

  describe('dependencies', async () => {
    await it(
      'uses dependencies as external',
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
        expect(await c.read('lib/index.js.map')).toMatchSnapshot();
        expect(await c.read('typings/index.d.ts')).toMatchSnapshot();
        expect(await c.read('typings/fetchJson.d.ts')).toMatchSnapshot();
      },
    );
  });

  describe('default flags', async () => {
    await it(
      'minify bundle by default',
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'generates typings by default',
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        expect(await c.read('typings/index.d.ts')).toMatchSnapshot();
        expect(await c.read('typings/fetchJson.d.ts')).toMatchSnapshot();
      },
    );
  });

  describe('minify', async () => {
    await it(
      'drops debugger in production mode',
      { command: 'build', name: 'browser-debugger', target: 'browser' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('production mode', async () => {
    await it(
      "don't minify code when production mode is off",
      { command: 'build', name: 'browser-default', target: 'browser', production: false },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'minify code when production mode is on',
      { command: 'build', name: 'browser-default', target: 'browser', production: true },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('type checking', async () => {
    await it(
      "doesn't check types when check mode is off",
      { command: 'build', name: 'browser-check', target: 'browser', check: false },
      async (c) => {
        expect(await c.isExists('lib')).toBe(true);
      },
    );

    await it(
      "doesn't generate typings when check mode is off",
      { command: 'build', name: 'browser-default', target: 'browser', check: false },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );

    await it(
      'fails when types are invalid and check mode is on',
      { command: 'build', name: 'browser-check', target: 'browser', check: true },
      (c) => {
        expect(c.isFailed).toBe(true);
      },
    );

    await it(
      "doesn't emit when errors are existed",
      { command: 'build', name: 'browser-check', target: 'browser', check: true },
      async (c) => {
        expect(await c.isExists('lib')).toBe(false);
        expect(await c.isExists('typings')).toBe(false);
      },
    );
  });

  describe('typings generation', async () => {
    await it(
      "doesn't generate typings when typings mode is off",
      { command: 'build', name: 'browser-default', target: 'browser', typings: false },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );

    await it(
      'generates typings when typings mode is on',
      { command: 'build', name: 'browser-default', target: 'browser', typings: true },
      async (c) => {
        expect(await c.isExists('typings')).toBe(true);
      },
    );

    await it(
      "doesn't generates typings when check mode is off",
      {
        command: 'build',
        name: 'browser-default',
        target: 'browser',
        check: false,
        typings: true,
      },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );
  });

  describe('static files', async () => {
    await it(
      'bundles static files',
      { command: 'build', name: 'browser-static', target: 'browser' },
      async (c) => {
        for (const ext of images) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await c.read(`lib/assets/js/image.${ext}`);

          expect(asset.trim()).toBe(ext);
        }

        for (const ext of fonts) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await c.read(`lib/assets/js/font.${ext}`);

          expect(asset.trim()).toBe(ext);
        }
      },
    );

    await it(
      'uses original imports for assets',
      { command: 'build', name: 'browser-static', target: 'browser' },
      async (c) => {
        const content = await c.read('lib/index.js');

        for (const ext of images) {
          expect(content.includes(`"./assets/js/image.${ext}"`)).toBe(true);
        }

        for (const ext of fonts) {
          expect(content.includes(`"./assets/js/font.${ext}"`)).toBe(true);
        }
      },
    );
  });

  describe('CSS', async () => {
    await it(
      'supports CSS',
      { command: 'build', name: 'browser-css', target: 'browser' },
      async (c) => {
        expect(await c.isExists('lib/index.css')).toBe(true);
      },
    );

    await it(
      'generates source maps for CSS',
      { command: 'build', name: 'browser-css', target: 'browser' },
      async (c) => {
        expect(await c.isExists('lib/index.css.map')).toBe(true);
      },
    );

    await it(
      'bundles static files from CSS',
      { command: 'build', name: 'browser-static', target: 'browser' },
      async (c) => {
        for (const ext of images) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await c.read(`lib/assets/css/image.${ext}`);

          expect(asset.trim()).toBe(ext);
        }

        for (const ext of fonts) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await c.read(`lib/assets/css/font.${ext}`);

          expect(asset.trim()).toBe(ext);
        }
      },
    );

    await it(
      'uses original imports for assets in CSS',
      { command: 'build', name: 'browser-static', target: 'browser' },
      async (c) => {
        const content = await c.read('lib/index.css');

        for (const ext of images) {
          expect(content.includes(`url(./assets/css/image.${ext})`)).toBe(true);
        }

        for (const ext of fonts) {
          expect(content.includes(`url(./assets/css/font.${ext})`)).toBe(true);
        }
      },
    );
  });

  describe('CSS auto import', async () => {
    await it(
      "doesn't add CSS import to the result bundle if CSS isn't used",
      { command: 'build', name: 'browser-default', target: 'browser' },
      async (c) => {
        const content = await c.read('lib/index.js');

        expect(content.startsWith('import "./index.css";')).toBe(false);
      },
    );

    await it(
      'adds CSS import to the result bundle if CSS is used',
      { command: 'build', name: 'browser-css', target: 'browser' },
      async (c) => {
        const content = await c.read('lib/index.js');

        expect(content.startsWith('import "./index.css";')).toBe(true);
      },
    );
  });

  describe('CSS Modules', async () => {
    await it(
      'supports CSS modules',
      { command: 'build', name: 'browser-css-modules', target: 'browser', production: false },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'uses short ids for CSS modules when the production mode is on',
      { command: 'build', name: 'browser-css-modules', target: 'browser', production: true },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );
  });

  describe('preprocessors support', async () => {
    await it(
      'supports SCSS postprocessor',
      { command: 'build', name: 'browser-scss', target: 'browser', production: false },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'resolves paths in SCSS',
      {
        command: 'build',
        name: 'browser-scss-node-modules',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'resolves paths in SCSS with conditional exports',
      {
        command: 'build',
        name: 'browser-scss-node-modules-conditionals',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'supports PostCSS preprocessor',
      {
        command: 'build',
        dependencies: ['postcss-nested'],
        name: 'browser-postcss',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );
  });

  describe('React support', async () => {
    await it(
      'supports development JSX runtime',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-react',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'supports JSX runtime when the production mode is on',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-react',
        target: 'browser',
        production: true,
      },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('SVG support', async () => {
    await it(
      'supports SVG in CSS',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-svg',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/assets/css.svg')).toMatchSnapshot();
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'supports import of SVG as URL in JS',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-svg',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/assets/js.svg')).toMatchSnapshot();
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'supports import of SVG as React Component in JS',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-svg',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/assets/js.svg')).toMatchSnapshot();
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'supports sharing the same SVG between CSS and JS',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-svg',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/assets/shared.svg')).toMatchSnapshot();
        expect(await c.read('lib/index.js')).toMatchSnapshot();
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'minify SVG when production mode is on',
      {
        command: 'build',
        dependencies: ['@types/react'],
        name: 'browser-svg',
        target: 'browser',
        production: true,
      },
      async (c) => {
        expect(await c.read('lib/assets/css.svg')).toMatchSnapshot();
        expect(await c.read('lib/assets/js.svg')).toMatchSnapshot();
        expect(await c.read('lib/assets/shared.svg')).toMatchSnapshot();
        expect(await c.read('lib/index.js')).toMatchSnapshot();
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );
  });

  describe('vanilla-extract support', async () => {
    await it(
      'supports `vanilla-extract` package',
      {
        command: 'build',
        dependencies: ['@vanilla-extract/css'],
        name: 'browser-vanilla-extract',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'supports static files in the `vanilla-extract` styles',
      {
        command: 'build',
        dependencies: ['@vanilla-extract/css'],
        name: 'browser-vanilla-extract',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.isExists('lib/assets')).toBe(false);

        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );

    await it(
      'bundles static files from `vanilla-extract` styles',
      {
        command: 'build',
        dependencies: ['@vanilla-extract/css'],
        name: 'browser-vanilla-extract-static',
        target: 'browser',
        production: false,
      },
      async (c) => {
        for (const ext of images) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await c.read(`lib/assets/image.${ext}`);

          expect(asset.trim()).toBe(ext);
        }

        for (const ext of fonts) {
          // eslint-disable-next-line no-await-in-loop
          const asset = await c.read(`lib/assets/font.${ext}`);

          expect(asset.trim()).toBe(ext);
        }
      },
    );

    await it(
      'ignores import of css files from `vanilla-extract` files',
      {
        command: 'build',
        dependencies: ['@vanilla-extract/css'],
        name: 'browser-vanilla-extract-css',
        target: 'browser',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.css')).toMatchSnapshot();
      },
    );
  });

  describe('storybook', async () => {
    await it(
      "doesn't generate documentation by default",
      { command: 'build', name: 'browser-storybook', target: 'browser' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      "doesn't generate documentation in production",
      { command: 'build', name: 'browser-storybook', target: 'browser', production: true },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      "doesn't generate documentation by default in development",
      { command: 'build', name: 'browser-storybook', target: 'browser', production: false },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'generates documentation if flag is given',
      {
        command: 'build',
        name: 'browser-storybook',
        target: 'browser',
        production: false,
        storybook: true,
      },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });
});
