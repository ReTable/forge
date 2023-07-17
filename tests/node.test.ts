import { setup } from './setup';

const it = setup();

// region Entries

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
      {
        name: 'node-entry',
        platform: 'node',
        entries: [entry],
      },
      async (t, c) => {
        const bundle = await c.read(`lib/${sample.out}`);

        t.true(bundle.startsWith(`// src/${sample.in}\n`));

        t.snapshot(bundle);
        t.snapshot(await c.read(`lib/${sample.out}.map`));
      },
    );

    it(
      `resolves "./${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
      {
        name: 'node-entry',
        platform: 'node',
        entries: [`./${entry}`],
      },
      async (t, c) => {
        const bundle = await c.read(`lib/${sample.out}`);

        t.true(bundle.startsWith(`// src/${sample.in}\n`));

        t.snapshot(bundle);
        t.snapshot(await c.read(`lib/${sample.out}.map`));
      },
    );
  }
}

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
    {
      name: 'node-entry',
      platform: 'node',
      entries: [sample.entry],
    },
    async (t, c) => {
      const bundle = await c.read(`lib/${sample.out}`);

      t.true(bundle.startsWith(`// src/${sample.in}\n`));

      t.snapshot(bundle);
      t.snapshot(await c.read(`lib/${sample.out}.map`));
    },
  );
}

// endregion

// region Multiple Entries

it(
  `allows to handle multiple entries`,
  {
    name: 'node-multiple-entries',
    platform: 'node',
    entries: ['submoduleA', 'submoduleB'],
  },
  async (t, c) => {
    t.snapshot(await c.read(`lib/submoduleA.js`));
    t.snapshot(await c.read(`lib/submoduleA.js.map`));
    t.snapshot(await c.read(`lib/submoduleB.js`));
    t.snapshot(await c.read(`lib/submoduleB.js.map`));
  },
);

it(
  'use splitting to share code between multiple entries',
  {
    name: 'node-multiple-entries-splitting',
    platform: 'node',
    entries: ['submoduleA', 'submoduleB'],
  },
  async (t, c) => {
    t.snapshot(await c.read(`lib/submoduleA.js`));
    t.snapshot(await c.read(`lib/submoduleA.js.map`));
    t.snapshot(await c.read(`lib/submoduleB.js`));
    t.snapshot(await c.read(`lib/submoduleB.js.map`));
    t.snapshot(await c.read(`lib/shared/EB35NJ2I.js`));
    t.snapshot(await c.read(`lib/shared/EB35NJ2I.js.map`));
  },
);

// endregion

// region Clean

it(
  "doesn't remove files from the previous build",
  { name: 'node-clean', platform: 'node', production: false },
  async (t, c) => {
    t.true(await c.isExists('lib/previous.js'));
    t.true(await c.isExists('typings/previous.d.ts'));
  },
);

it(
  'removes files from the previous build before production build',
  { name: 'node-clean', platform: 'node', production: true },
  async (t, c) => {
    t.false(await c.isExists('lib/previous.js'));
    t.false(await c.isExists('typings/previous.d.ts'));
  },
);

// endregion

// region Source Maps

it('generates source maps', { name: 'node-default', platform: 'node' }, async (t, c) => {
  t.snapshot(await c.read('lib/index.js.map'));
});

it(
  'generates source maps with relative paths',
  { name: 'node-default', platform: 'node' },
  async (t, c) => {
    const { sources } = await c.readSourceMap('lib/index.js.map');

    const areAllRelative = sources.every((source) => source.startsWith('../src'));

    t.true(areAllRelative);
  },
);

it(
  'generates source maps with sources content',
  { name: 'node-default', platform: 'node' },
  async (t, c) => {
    const { sourcesContent } = await c.readSourceMap('lib/index.js.map');

    t.true(sourcesContent != null);
    t.true((sourcesContent?.length ?? 0) > 0);
  },
);

// endregion

// region Dependencies

it('uses dependencies as external', { name: 'node-default', platform: 'node' }, async (t, c) => {
  t.snapshot(await c.read('lib/index.js'));
  t.snapshot(await c.read('lib/index.js.map'));
  t.snapshot(await c.read('typings/index.d.ts'));
  t.snapshot(await c.read('typings/readJson.d.ts'));
});

// endregion

// region Default Flags

it('minify bundle by default', { name: 'node-default', platform: 'node' }, async (t, c) => {
  t.snapshot(await c.read('lib/index.js'));
});

it('generates typings by default', { name: 'node-default', platform: 'node' }, async (t, c) => {
  t.snapshot(await c.read('typings/index.d.ts'));
  t.snapshot(await c.read('typings/readJson.d.ts'));
});

// endregion

// region Minify

it(
  'drops debugger in production mode',
  { name: 'node-debugger', platform: 'node' },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

// endregion

// region Production Mode

it(
  "don't minify code when production mode is off",
  {
    name: 'node-default',
    platform: 'node',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  'minify code when production mode is on',
  {
    name: 'node-default',
    platform: 'node',
    production: true,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

// endregion

// region Type Checking

it(
  "doesn't check types when check mode is off",
  {
    name: 'node-check',
    platform: 'node',
    check: false,
  },
  async (t, c) => {
    t.true(await c.isExists('lib'));
  },
);

it(
  "doesn't generate typings when check mode is off",
  {
    name: 'node-default',
    platform: 'node',
    check: false,
  },
  async (t, c) => {
    t.false(await c.isExists('typings'));
  },
);

it(
  'fails when types are invalid and check mode is on',
  {
    name: 'node-check',
    platform: 'node',
    check: true,
  },
  (t, c) => {
    t.true(c.isFailed);
  },
);

it(
  "doesn't emit when errors are existed",
  {
    name: 'node-check',
    platform: 'node',
    check: true,
  },
  async (t, c) => {
    t.false(await c.isExists('lib'));
    t.false(await c.isExists('typings'));
  },
);

// endregion

// region Typings Generation

it(
  "doesn't generate typings when typings mode is off",
  {
    name: 'node-default',
    platform: 'node',
    typings: false,
  },
  async (t, c) => {
    t.false(await c.isExists('typings'));
  },
);

it(
  'generates typings when typings mode is on',
  {
    name: 'node-default',
    platform: 'node',
    typings: true,
  },
  async (t, c) => {
    t.true(await c.isExists('typings'));
  },
);

it(
  "doesn't generates typings when check mode is off",
  {
    name: 'node-default',
    platform: 'node',
    check: false,
    typings: true,
  },
  async (t, c) => {
    t.false(await c.isExists('typings'));
  },
);

// endregion
