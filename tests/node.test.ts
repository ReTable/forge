import { describe, expect } from 'vitest';

import { setup } from './setup';

const it = setup();

describe('node', () => {
  describe('entries', () => {
    describe('input', async () => {
      const inputSamples = [
        {
          entries: ['index', 'index.ts'],
          in: 'index.ts',
          out: 'index.js',
        },
        {
          entries: ['file', 'file.ts'],
          in: 'file.ts',
          out: 'file.js',
        },
        {
          entries: ['subdir'],
          in: 'subdir/index.ts',
          out: 'subdir.js',
        },
        {
          entries: ['subdir/index.ts'],
          in: 'subdir/index.ts',
          out: 'subdir/index.js',
        },
        {
          entries: ['file-or-subdir', 'file-or-subdir.ts'],
          in: 'file-or-subdir.ts',
          out: 'file-or-subdir.js',
        },
        {
          entries: ['file-or-subdir/index', 'file-or-subdir/index.ts'],
          in: 'file-or-subdir/index.ts',
          out: 'file-or-subdir/index.js',
        },
      ];

      for (const sample of inputSamples) {
        for (const entry of sample.entries) {
          await it(
            `resolves "${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
            {
              name: 'node-entry',
              platform: 'node',
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
            {
              name: 'node-entry',
              platform: 'node',
              entries: [`./${entry}`],
            },
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
          in: 'index.ts',
          out: 'main.js',
        },
        {
          entry: 'index:main.bundle',
          in: 'index.ts',
          out: 'main.bundle.js',
        },
        {
          entry: 'index:main.js',
          in: 'index.ts',
          out: 'main.js',
        },
        {
          entry: 'index:bundles/main',
          in: 'index.ts',
          out: 'bundles/main.js',
        },
      ];

      for (const sample of outputSamples) {
        await it(
          `resolves "${sample.entry} to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
          {
            name: 'node-entry',
            platform: 'node',
            entries: [sample.entry],
          },
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
          name: 'node-multiple-entries',
          platform: 'node',
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
          name: 'node-multiple-entries-splitting',
          platform: 'node',
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
    });
  });

  describe('clean', async () => {
    await it(
      "doesn't remove files from the previous build",
      { name: 'node-clean', platform: 'node', production: false },
      async (c) => {
        expect(await c.isExists('lib/previous.js')).toBe(true);
        expect(await c.isExists('typings/previous.d.ts')).toBe(true);
      },
    );

    await it(
      'removes files from the previous build before production build',
      { name: 'node-clean', platform: 'node', production: true },
      async (c) => {
        expect(await c.isExists('lib/previous.js')).toBe(false);
        expect(await c.isExists('typings/previous.d.ts')).toBe(false);
      },
    );
  });

  describe('source maps', async () => {
    await it('generates source maps', { name: 'node-default', platform: 'node' }, async (c) => {
      expect(await c.read('lib/index.js.map')).toMatchSnapshot();
    });

    await it(
      'generates source maps with relative paths',
      { name: 'node-default', platform: 'node' },
      async (c) => {
        const { sources } = await c.readSourceMap('lib/index.js.map');

        const areAllRelative = sources.every((source) => source.startsWith('../src'));

        expect(areAllRelative).toBe(true);
      },
    );

    await it(
      'generates source maps with sources content',
      { name: 'node-default', platform: 'node' },
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
      { name: 'node-default', platform: 'node' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
        expect(await c.read('lib/index.js.map')).toMatchSnapshot();
        expect(await c.read('typings/index.d.ts')).toMatchSnapshot();
        expect(await c.read('typings/readJson.d.ts')).toMatchSnapshot();
      },
    );
  });

  describe('default flags', async () => {
    await it('minify bundle by default', { name: 'node-default', platform: 'node' }, async (c) => {
      expect(await c.read('lib/index.js')).toMatchSnapshot();
    });

    await it(
      'generates typings by default',
      { name: 'node-default', platform: 'node' },
      async (c) => {
        expect(await c.read('typings/index.d.ts')).toMatchSnapshot();
        expect(await c.read('typings/readJson.d.ts')).toMatchSnapshot();
      },
    );
  });

  describe('minify', async () => {
    await it(
      'drops debugger in production mode',
      { name: 'node-debugger', platform: 'node' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('production mode', async () => {
    await it(
      "don't minify code when production mode is off",
      {
        name: 'node-default',
        platform: 'node',
        production: false,
      },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    await it(
      'minify code when production mode is on',
      {
        name: 'node-default',
        platform: 'node',
        production: true,
      },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('type checking', async () => {
    await it(
      "doesn't check types when check mode is off",
      {
        name: 'node-check',
        platform: 'node',
        check: false,
      },
      async (c) => {
        expect(await c.isExists('lib')).toBe(true);
      },
    );

    await it(
      "doesn't generate typings when check mode is off",
      {
        name: 'node-default',
        platform: 'node',
        check: false,
      },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );

    await it(
      'fails when types are invalid and check mode is on',
      {
        name: 'node-check',
        platform: 'node',
        check: true,
      },
      (c) => {
        expect(c.isFailed).toBe(true);
      },
    );

    await it(
      "doesn't emit when errors are existed",
      {
        name: 'node-check',
        platform: 'node',
        check: true,
      },
      async (c) => {
        expect(await c.isExists('lib')).toBe(false);
        expect(await c.isExists('typings')).toBe(false);
      },
    );
  });

  describe('typings generation', async () => {
    await it(
      "doesn't generate typings when typings mode is off",
      {
        name: 'node-default',
        platform: 'node',
        typings: false,
      },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );

    await it(
      'generates typings when typings mode is on',
      {
        name: 'node-default',
        platform: 'node',
        typings: true,
      },
      async (c) => {
        expect(await c.isExists('typings')).toBe(true);
      },
    );

    await it(
      "doesn't generates typings when check mode is off",
      {
        name: 'node-default',
        platform: 'node',
        check: false,
        typings: true,
      },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );
  });
});
