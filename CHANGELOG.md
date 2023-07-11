# @tabula/forge

## 0.2.1

### Patch Changes

- [#6](https://github.com/ReTable/forge/pull/6) [`b807fa7`](https://github.com/ReTable/forge/commit/b807fa7cdc82b14792b81a8f4982fe411e688df9) Thanks [@demiazz](https://github.com/demiazz)! - use conditional import for searching of Sass imports

## 0.2.0

### Minor Changes

- [#4](https://github.com/ReTable/forge/pull/4) [`8dddd8d`](https://github.com/ReTable/forge/commit/8dddd8d83e1f911b5f9ed315004b78c0846f7f8c) Thanks [@demiazz](https://github.com/demiazz)! - adds support of packages resolve in the Sass

  The `forge` resolves external packages through `~<pkg>` urls.

  Example:

  ```scss
  @use `~ @tabula / ui-theme` as theme;

  .root {
    background-color: theme.$color--primary;
  }
  ```

  It will search `<pkg>` in dependencies through Node.js `require`, and try to read `sass` field in the `package.json`
  of the founded package.

  Example:

  ```json
  {
    "name": "@tabula/ui-theme",
    "sass": "./sass/index.scss"
  }
  ```

  will be resolved to the `<node_modules>/@tabula/ui-theme/sass/index.scss`.

### Patch Changes

- [#4](https://github.com/ReTable/forge/pull/4) [`8dddd8d`](https://github.com/ReTable/forge/commit/8dddd8d83e1f911b5f9ed315004b78c0846f7f8c) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 0.1.1

### Patch Changes

- [#2](https://github.com/ReTable/forge/pull/2) [`91e6393`](https://github.com/ReTable/forge/commit/91e6393cb6136683d81612c2d7d3749c03f279ea) Thanks [@demiazz](https://github.com/demiazz)! - add `prettier` formatting

- [#2](https://github.com/ReTable/forge/pull/2) [`91e6393`](https://github.com/ReTable/forge/commit/91e6393cb6136683d81612c2d7d3749c03f279ea) Thanks [@demiazz](https://github.com/demiazz)! - use predefined TypeScript configs

- [#2](https://github.com/ReTable/forge/pull/2) [`91e6393`](https://github.com/ReTable/forge/commit/91e6393cb6136683d81612c2d7d3749c03f279ea) Thanks [@demiazz](https://github.com/demiazz)! - add `eslint` checks

## 0.1.0

### Minor Changes

- [`a9556b6`](https://github.com/ReTable/forge/commit/a9556b605e6595c8dff5ea8db9f62e181b8557d4) Thanks [@demiazz](https://github.com/demiazz)! - initial release
