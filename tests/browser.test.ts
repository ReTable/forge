import { setup } from './setup';

const it = setup();

const images = ['bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png', 'webp'];
const fonts = ['eot', 'otf', 'ttf', 'woff', 'woff2'];

// region Entries

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
    it(
      `resolves "${entry}" entry to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
      {
        name: 'browser-entry',
        platform: 'browser',
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
        name: 'browser-entry',
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
  it(
    `resolves "${sample.entry} to "src/${sample.in}" and bundles to "lib/${sample.out}"`,
    {
      name: 'browser-entry',
      platform: 'browser',
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
    name: 'browser-multiple-entries',
    platform: 'browser',
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
    name: 'browser-multiple-entries-splitting',
    platform: 'browser',
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

it(
  'create a own CSS bundle for each entry',
  {
    name: 'browser-multiple-entries',
    platform: 'browser',
    entries: ['submoduleA', 'submoduleB'],
  },
  async (t, c) => {
    t.snapshot(await c.read(`lib/submoduleA.js`));
    t.snapshot(await c.read(`lib/submoduleA.js.map`));
    t.snapshot(await c.read(`lib/submoduleB.js`));
    t.snapshot(await c.read(`lib/submoduleB.js.map`));
    t.snapshot(await c.read(`lib/submoduleA.css`));
    t.snapshot(await c.read(`lib/submoduleA.css.map`));
    t.snapshot(await c.read(`lib/submoduleB.css`));
    t.snapshot(await c.read(`lib/submoduleB.css.map`));
  },
);

it(
  'create non shared CSS bundle for each entry',
  {
    name: 'browser-multiple-entries-splitting-css',
    platform: 'browser',
    entries: ['submoduleA', 'submoduleB'],
    dependencies: ['@vanilla-extract/css'],
  },
  async (t, c) => {
    t.snapshot(await c.read(`lib/submoduleA.js`));
    t.snapshot(await c.read(`lib/submoduleA.js.map`));
    t.snapshot(await c.read(`lib/submoduleB.js`));
    t.snapshot(await c.read(`lib/submoduleB.js.map`));
    t.snapshot(await c.read(`lib/submoduleA.css`));
    t.snapshot(await c.read(`lib/submoduleA.css.map`));
    t.snapshot(await c.read(`lib/submoduleB.css`));
    t.snapshot(await c.read(`lib/submoduleB.css.map`));
  },
);

// endregion

// region Clean

it(
  "doesn't remove files from the previous build",
  { name: 'browser-clean', platform: 'browser', production: false },
  async (t, c) => {
    t.true(await c.isExists('lib/previous.js'));
    t.true(await c.isExists('typings/previous.d.ts'));
  },
);

it(
  'removes files from the previous build before production build',
  { name: 'browser-clean', platform: 'browser', production: true },
  async (t, c) => {
    t.false(await c.isExists('lib/previous.js'));
    t.false(await c.isExists('typings/previous.d.ts'));
  },
);

// endregion

// region Source Maps

it('generates source maps', { name: 'browser-default', platform: 'browser' }, async (t, c) => {
  t.snapshot(await c.read('lib/index.js.map'));
});

it(
  'generates source maps with relative paths',
  {
    name: 'browser-default',
    platform: 'browser',
  },
  async (t, c) => {
    const { sources } = await c.readSourceMap('lib/index.js.map');

    const areAllRelative = sources.every((source) => source.startsWith('../src'));

    t.true(areAllRelative);
  },
);

it(
  'generates source maps with sources content',
  { name: 'browser-default', platform: 'browser' },
  async (t, c) => {
    const { sourcesContent } = await c.readSourceMap('lib/index.js.map');

    t.true(sourcesContent != null);
    t.true((sourcesContent?.length ?? 0) > 0);
  },
);

// endregion

// region Dependencies

it(
  'uses dependencies as external',
  { name: 'browser-default', platform: 'browser' },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
    t.snapshot(await c.read('lib/index.js.map'));
    t.snapshot(await c.read('typings/index.d.ts'));
    t.snapshot(await c.read('typings/fetchJson.d.ts'));
  },
);

// endregion

// region Default Flags

it('minify bundle by default', { name: 'browser-default', platform: 'browser' }, async (t, c) => {
  t.snapshot(await c.read('lib/index.js'));
});

it(
  'generates typings by default',
  { name: 'browser-default', platform: 'browser' },
  async (t, c) => {
    t.snapshot(await c.read('typings/index.d.ts'));
    t.snapshot(await c.read('typings/fetchJson.d.ts'));
  },
);

// endregion

// region Minify

it(
  'drops debugger in production mode',
  { name: 'browser-debugger', platform: 'browser' },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

// endregion

// region Production Mode

it(
  "don't minify code when production mode is off",
  {
    name: 'browser-default',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  'minify code when production mode is on',
  {
    name: 'browser-default',
    platform: 'browser',
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
    name: 'browser-check',
    platform: 'browser',
    check: false,
  },
  async (t, c) => {
    t.true(await c.isExists('lib'));
  },
);

it(
  "doesn't generate typings when check mode is off",
  {
    name: 'browser-default',
    platform: 'browser',
    check: false,
  },
  async (t, c) => {
    t.false(await c.isExists('typings'));
  },
);

it(
  'fails when types are invalid and check mode is on',
  {
    name: 'browser-check',
    platform: 'browser',
    check: true,
  },
  (t, c) => {
    t.true(c.isFailed);
  },
);

it(
  "doesn't emit when errors are existed",
  {
    name: 'browser-check',
    platform: 'browser',
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
    name: 'browser-default',
    platform: 'browser',
    typings: false,
  },
  async (t, c) => {
    t.false(await c.isExists('typings'));
  },
);

it(
  'generates typings when typings mode is on',
  {
    name: 'browser-default',
    platform: 'browser',
    typings: true,
  },
  async (t, c) => {
    t.true(await c.isExists('typings'));
  },
);

it(
  "doesn't generates typings when check mode is off",
  {
    name: 'browser-default',
    platform: 'browser',
    check: false,
    typings: true,
  },
  async (t, c) => {
    t.false(await c.isExists('typings'));
  },
);

// endregion

// region Static files

it(
  'bundles static files',
  {
    name: 'browser-static',
    platform: 'browser',
  },
  async (t, c) => {
    for (const ext of images) {
      // eslint-disable-next-line no-await-in-loop
      const asset = await c.read(`lib/assets/js/image.${ext}`);

      t.is(asset.trim(), ext);
    }

    for (const ext of fonts) {
      // eslint-disable-next-line no-await-in-loop
      const asset = await c.read(`lib/assets/js/font.${ext}`);

      t.is(asset.trim(), ext);
    }
  },
);

it(
  'uses original imports for assets',
  {
    name: 'browser-static',
    platform: 'browser',
  },
  async (t, c) => {
    const content = await c.read('lib/index.js');

    for (const ext of images) {
      t.true(content.includes(`"./assets/js/image.${ext}"`));
    }

    for (const ext of fonts) {
      t.true(content.includes(`"./assets/js/font.${ext}"`));
    }
  },
);

// endregion

// region CSS

it(
  'supports CSS',
  {
    name: 'browser-css',
    platform: 'browser',
  },
  async (t, c) => {
    t.true(await c.isExists('lib/index.css'));
  },
);

it(
  'generates source maps for CSS',
  {
    name: 'browser-css',
    platform: 'browser',
  },
  async (t, c) => {
    t.true(await c.isExists('lib/index.css.map'));
  },
);

it(
  'bundles static files from CSS',
  {
    name: 'browser-static',
    platform: 'browser',
  },
  async (t, c) => {
    for (const ext of images) {
      // eslint-disable-next-line no-await-in-loop
      const asset = await c.read(`lib/assets/css/image.${ext}`);

      t.is(asset.trim(), ext);
    }

    for (const ext of fonts) {
      // eslint-disable-next-line no-await-in-loop
      const asset = await c.read(`lib/assets/css/font.${ext}`);

      t.is(asset.trim(), ext);
    }
  },
);

it(
  'uses original imports for assets in CSS',
  {
    name: 'browser-static',
    platform: 'browser',
  },
  async (t, c) => {
    const content = await c.read('lib/index.css');

    for (const ext of images) {
      t.true(content.includes(`url(./assets/css/image.${ext})`));
    }

    for (const ext of fonts) {
      t.true(content.includes(`url(./assets/css/font.${ext})`));
    }
  },
);

// endregion

// region CSS Auto Import

it(
  "doesn't add CSS import to the result bundle if CSS isn't used",
  {
    name: 'browser-default',
    platform: 'browser',
  },
  async (t, c) => {
    const content = await c.read('lib/index.js');

    t.false(content.startsWith('import "./index.css";'));
  },
);

it(
  'adds CSS import to the result bundle if CSS is used',
  {
    name: 'browser-css',
    platform: 'browser',
  },
  async (t, c) => {
    const content = await c.read('lib/index.js');

    t.true(content.startsWith('import "./index.css";'));
  },
);

// endregion

// region CSS Modules

it(
  'supports CSS modules',
  {
    name: 'browser-css-modules',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'uses short ids for CSS modules when the production mode is on',
  {
    name: 'browser-css-modules',
    platform: 'browser',
    production: true,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

// endregion

// region Preprocessors Support

it(
  'supports SCSS postprocessor',
  {
    name: 'browser-scss',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'resolves paths in SCSS',
  {
    name: 'browser-scss-node-modules',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'resolves paths in SCSS with conditional exports',
  {
    name: 'browser-scss-node-modules-conditionals',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'supports PostCSS preprocessor',
  {
    dependencies: ['postcss-nested'],
    name: 'browser-postcss',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

// endregion

// region React Support

it(
  'supports development JSX runtime',
  {
    dependencies: ['@types/react'],
    name: 'browser-react',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  'supports JSX runtime when the production mode is on',
  {
    dependencies: ['@types/react'],
    name: 'browser-react',
    platform: 'browser',
    production: true,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

// endregion

// region SVG Support

it(
  'supports SVG in CSS',
  {
    dependencies: ['@types/react'],
    name: 'browser-svg',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/assets/css.svg'));
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'supports import of SVG as URL in JS',
  {
    dependencies: ['@types/react'],
    name: 'browser-svg',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/assets/js.svg'));
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  'supports import of SVG as React Component in JS',
  {
    dependencies: ['@types/react'],
    name: 'browser-svg',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/assets/js.svg'));
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  'supports sharing the same SVG between CSS and JS',
  {
    dependencies: ['@types/react'],
    name: 'browser-svg',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/assets/shared.svg'));
    t.snapshot(await c.read('lib/index.js'));
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'minify SVG when production mode is on',
  {
    dependencies: ['@types/react'],
    name: 'browser-svg',
    platform: 'browser',
    production: true,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/assets/css.svg'));
    t.snapshot(await c.read('lib/assets/js.svg'));
    t.snapshot(await c.read('lib/assets/shared.svg'));
    t.snapshot(await c.read('lib/index.js'));
    t.snapshot(await c.read('lib/index.css'));
  },
);

// endregion

// region Vanilla Extract Support

it(
  'supports `vanilla-extract` package',
  {
    dependencies: ['@vanilla-extract/css'],
    name: 'browser-vanilla-extract',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'supports static files in the `vanilla-extract` styles',
  {
    dependencies: ['@vanilla-extract/css'],
    name: 'browser-vanilla-extract',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.false(await c.isExists('lib/assets'));

    t.snapshot(await c.read('lib/index.css'));
  },
);

it(
  'bundles static files from `vanilla-extract` styles',
  {
    dependencies: ['@vanilla-extract/css'],
    name: 'browser-vanilla-extract-static',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    for (const ext of images) {
      // eslint-disable-next-line no-await-in-loop
      const asset = await c.read(`lib/assets/image.${ext}`);

      t.is(asset.trim(), ext);
    }

    for (const ext of fonts) {
      // eslint-disable-next-line no-await-in-loop
      const asset = await c.read(`lib/assets/font.${ext}`);

      t.is(asset.trim(), ext);
    }
  },
);

it(
  'ignores import of css files from `vanilla-extract` files',
  {
    dependencies: ['@vanilla-extract/css'],
    name: 'browser-vanilla-extract-css',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.css'));
  },
);

// endregion

// region Storybook

it(
  "doesn't generate documentation by default",
  {
    name: 'browser-storybook',
    platform: 'browser',
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  "doesn't generate documentation in production",
  {
    name: 'browser-storybook',
    platform: 'browser',
    production: true,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  "doesn't generate documentation by default in development",
  {
    name: 'browser-storybook',
    platform: 'browser',
    production: false,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

it(
  'generates documentation if flag is given',
  {
    name: 'browser-storybook',
    platform: 'browser',
    production: false,
    storybook: true,
  },
  async (t, c) => {
    t.snapshot(await c.read('lib/index.js'));
  },
);

// endregion
