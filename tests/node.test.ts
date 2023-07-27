import { describe, expect } from 'vitest';

import { createTestApi } from './helpers';

const it = createTestApi();

describe('node', () => {
  describe('entries', () => {
    describe('input', () => {
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
          it(
            `resolves "${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
            { command: 'build', name: 'node-entry', target: 'node', entries: [entry] },
            async (c) => {
              const bundle = await c.read(`lib/${sample.out}`);

              expect(bundle.startsWith(`// src/${sample.in}\n`)).toBe(true);

              expect(bundle).toMatchSnapshot();
              expect(await c.read(`lib/${sample.out}.map`)).toMatchSnapshot();
            },
          );

          it(
            `resolves "./${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
            { command: 'build', name: 'node-entry', target: 'node', entries: [`./${entry}`] },
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

    describe('output', () => {
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
        it(
          `resolves "${sample.entry} to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
          { command: 'build', name: 'node-entry', target: 'node', entries: [sample.entry] },
          async (c) => {
            const bundle = await c.read(`lib/${sample.out}`);

            expect(bundle.startsWith(`// src/${sample.in}\n`)).toBe(true);

            expect(bundle).toMatchSnapshot();
            expect(await c.read(`lib/${sample.out}.map`)).toMatchSnapshot();
          },
        );
      }
    });

    describe('multiple entries', () => {
      it(
        `allows to handle multiple entries`,
        {
          command: 'build',
          name: 'node-multiple-entries',
          target: 'node',
          entries: ['submoduleA', 'submoduleB'],
        },
        async (c) => {
          expect(await c.read(`lib/submoduleA.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleA.js.map`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js`)).toMatchSnapshot();
          expect(await c.read(`lib/submoduleB.js.map`)).toMatchSnapshot();
        },
      );

      it(
        'use splitting to share code between multiple entries',
        {
          command: 'build',
          name: 'node-multiple-entries-splitting',
          target: 'node',
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

  describe('clean', () => {
    it(
      "doesn't remove files from the previous build",
      { command: 'build', name: 'node-clean', target: 'node', production: false },
      async (c) => {
        expect(await c.isExists('lib/previous.js')).toBe(true);
        expect(await c.isExists('typings/previous.d.ts')).toBe(true);
      },
    );

    it(
      'removes files from the previous build before production build',
      { command: 'build', name: 'node-clean', target: 'node', production: true },
      async (c) => {
        expect(await c.isExists('lib/previous.js')).toBe(false);
        expect(await c.isExists('typings/previous.d.ts')).toBe(false);
      },
    );
  });

  describe('source maps', () => {
    it(
      'generates source maps',
      { command: 'build', name: 'node-default', target: 'node' },
      async (c) => {
        expect(await c.read('lib/index.js.map')).toMatchSnapshot();
      },
    );

    it(
      'generates source maps with relative paths',
      { command: 'build', name: 'node-default', target: 'node' },
      async (c) => {
        const { sources } = await c.readSourceMap('lib/index.js.map');

        const areAllRelative = sources.every((source) => source.startsWith('../src'));

        expect(areAllRelative).toBe(true);
      },
    );

    it(
      'generates source maps with sources content',
      { command: 'build', name: 'node-default', target: 'node' },
      async (c) => {
        const { sourcesContent } = await c.readSourceMap('lib/index.js.map');

        expect(sourcesContent != null).toBe(true);
        expect((sourcesContent?.length ?? 0) > 0).toBe(true);
      },
    );
  });

  describe('dependencies', () => {
    it(
      'uses dependencies as external',
      { command: 'build', name: 'node-default', target: 'node' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
        expect(await c.read('lib/index.js.map')).toMatchSnapshot();
        expect(await c.read('typings/index.d.ts')).toMatchSnapshot();
        expect(await c.read('typings/readJson.d.ts')).toMatchSnapshot();
      },
    );
  });

  describe('default flags', () => {
    it(
      'minify bundle by default',
      { command: 'build', name: 'node-default', target: 'node' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    it(
      'generates typings by default',
      { command: 'build', name: 'node-default', target: 'node' },
      async (c) => {
        expect(await c.read('typings/index.d.ts')).toMatchSnapshot();
        expect(await c.read('typings/readJson.d.ts')).toMatchSnapshot();
      },
    );
  });

  describe('minify', () => {
    it(
      'drops debugger in production mode',
      { command: 'build', name: 'node-debugger', target: 'node' },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('production mode', () => {
    it(
      "don't minify code when production mode is off",
      { command: 'build', name: 'node-default', target: 'node', production: false },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );

    it(
      'minify code when production mode is on',
      { command: 'build', name: 'node-default', target: 'node', production: true },
      async (c) => {
        expect(await c.read('lib/index.js')).toMatchSnapshot();
      },
    );
  });

  describe('type checking', () => {
    it(
      "doesn't check types when check mode is off",
      { command: 'build', name: 'node-check', target: 'node', check: false },
      async (c) => {
        expect(await c.isExists('lib')).toBe(true);
      },
    );

    it(
      "doesn't generate typings when check mode is off",
      { command: 'build', name: 'node-default', target: 'node', check: false },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );

    it(
      'fails when types are invalid and check mode is on',
      { command: 'build', name: 'node-check', target: 'node', check: true },
      (c) => {
        expect(c.isFailed).toBe(true);
      },
    );

    it(
      "doesn't emit when errors are existed",
      { command: 'build', name: 'node-check', target: 'node', check: true },
      async (c) => {
        expect(await c.isExists('lib')).toBe(false);
        expect(await c.isExists('typings')).toBe(false);
      },
    );
  });

  describe('typings generation', () => {
    it(
      "doesn't generate typings when typings mode is off",
      { command: 'build', name: 'node-default', target: 'node', typings: false },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );

    it(
      'generates typings when typings mode is on',
      { command: 'build', name: 'node-default', target: 'node', typings: true },
      async (c) => {
        expect(await c.isExists('typings')).toBe(true);
      },
    );

    it(
      "doesn't generates typings when check mode is off",
      {
        command: 'build',
        name: 'node-default',
        target: 'node',
        check: false,
        typings: true,
      },
      async (c) => {
        expect(await c.isExists('typings')).toBe(false);
      },
    );
  });
});
