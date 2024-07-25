# @tabula/forge

## 4.0.0

### Major Changes

- [#80](https://github.com/ReTable/forge/pull/80) [`3dd45b9`](https://github.com/ReTable/forge/commit/3dd45b9df7b826ac332c433a7efbb0cbf037e9fe) Thanks [@demiazz](https://github.com/demiazz)! - add auto import of bundled CSS styles to the end of JS bundle

### Patch Changes

- [#78](https://github.com/ReTable/forge/pull/78) [`274e744`](https://github.com/ReTable/forge/commit/274e74499d1f45f1478438e1a708e03ff03f9b32) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 4.0.0-next.0

### Major Changes

- [#80](https://github.com/ReTable/forge/pull/80) [`3dd45b9`](https://github.com/ReTable/forge/commit/3dd45b9df7b826ac332c433a7efbb0cbf037e9fe) Thanks [@demiazz](https://github.com/demiazz)! - add auto import of bundled CSS styles to the end of JS bundle

### Patch Changes

- [#78](https://github.com/ReTable/forge/pull/78) [`274e744`](https://github.com/ReTable/forge/commit/274e74499d1f45f1478438e1a708e03ff03f9b32) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 3.0.0

### Major Changes

- [#76](https://github.com/ReTable/forge/pull/76) [`52ee60f`](https://github.com/ReTable/forge/commit/52ee60f421005d0b97a4aeaf365d18768f65cee9) Thanks [@demiazz](https://github.com/demiazz)! - dropped support of Node.js versions lower 20.4.0

### Minor Changes

- [#76](https://github.com/ReTable/forge/pull/76) [`52ee60f`](https://github.com/ReTable/forge/commit/52ee60f421005d0b97a4aeaf365d18768f65cee9) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 2.0.3

### Patch Changes

- [#73](https://github.com/ReTable/forge/pull/73) [`3715a09`](https://github.com/ReTable/forge/commit/3715a09201edde2c005f80a38ea911cd2324168d) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 2.0.2

### Patch Changes

- [#70](https://github.com/ReTable/forge/pull/70) [`c7760dd`](https://github.com/ReTable/forge/commit/c7760dd4aec82cbe3daf5fd3b76be1b75b2c5fd2) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies tree

- [#68](https://github.com/ReTable/forge/pull/68) [`eb1414c`](https://github.com/ReTable/forge/commit/eb1414c8c3707f3571d3df918321367cd0ac5866) Thanks [@dependabot](https://github.com/apps/dependabot)! - update `vite` to fix vulnerabilities

## 2.0.1

### Patch Changes

- [#67](https://github.com/ReTable/forge/pull/67) [`b093b93`](https://github.com/ReTable/forge/commit/b093b9397e08d8941c737586d0377daf51975bc6) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 2.0.0

### Major Changes

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - enable `memo` by default for SVGR transformations

- [#60](https://github.com/ReTable/forge/pull/60) [`5611ead`](https://github.com/ReTable/forge/commit/5611ead5c205c95501692f0edd36a3381225e876) Thanks [@demiazz](https://github.com/demiazz)! - update target node up to 20.x

### Minor Changes

- [#62](https://github.com/ReTable/forge/pull/62) [`bcd685a`](https://github.com/ReTable/forge/commit/bcd685a8974a601fa64d64e456315ab48e09c460) Thanks [@demiazz](https://github.com/demiazz)! - emulate Vite's environment variables

  The `vanilla-extract` uses `esbuild` under the hood with CJS format. In that case, if you import any code with usage of
  `import`.

  We assume usage only `import.meta.env.DEV`, `import.meta.env.PROD` and `import.meta.env.MODE` variables in bundler
  user's code and emulate only it with defining constants.

  But this constants working only in compile time when CSS is generated and based on mode in which the `forge` is running
  at compilation moment.

  Be careful when use code which based on that variables in your `vanilla-extract` styles.

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - added support of transformation of SVG component name with `svgrComponentName` option.

  By default, SVGR uses `Svg<CamelCaseFileName>` name for components. You can override this behaviour through
  `svgrComponentName` options, which should be function of format `(svgrName: string) => string`.

  Example:

  ```js
  export default {
    // ...
    svgrComponentName(name) {
      return `Ui${name.slice(3)}Icon`;
    },
    // ...
  };
  ```

  If you have a file `column.svg` then component name is `SvgColumn` by default. But with config from about the name
  will be `UiColumnIcon`.

  If you use memoization it looks like:

  ```js
  import { memo } from 'react';

  const UiColumnIcon = (props) => {
    // ...
  };

  const Memo = memo(UiColumnIcon);

  export { Memo as ReactComponent };
  ```

  This option doesn't affect named exports.

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - allow to append `displayName` for SVGR components.

  By default, SVGR doesn't append `displayName` for exported components. You can add this behaviour through `svgrDisplayName`
  option, which should be function of format `(componentName: string) => string | { displayName: string; isDebugOnly?: boolean }`.

  When function is returns string, then `isDebugOnly` equals to `false`.

  The `componentName` is name of component itself (before memoization if enabled). If you provide `svgrComponentName` option,
  then result of applying this function is `componentName`.

  The `isDebugOnly` enables wrapping the assignment in Vite compatible condition.

  ```js
  // `isDebugOnly` = false

  Component.displayName = 'scope(ComponentDisplayName)';

  // `isDebugOnly` = true

  if (import.meta.env.DEV) {
    Component.displayName = `scope(ComponentDisplayName)`;
  }
  ```

  If memoization is enabled, then the `displayName` will be assigned to the memoized component:

  ```js
  const Component = (props) => {
    // ...
  };

  const Memo = memo(Component);

  Memo.displayName = `scope(ComponentDisplayName)`;
  ```

### Patch Changes

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - add typings and exports config type

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - add `@babel/types` dependency

## 2.0.0-next.2

### Minor Changes

- [#62](https://github.com/ReTable/forge/pull/62) [`bcd685a`](https://github.com/ReTable/forge/commit/bcd685a8974a601fa64d64e456315ab48e09c460) Thanks [@demiazz](https://github.com/demiazz)! - emulate Vite's environment variables

  The `vanilla-extract` uses `esbuild` under the hood with CJS format. In that case, if you import any code with usage of
  `import`.

  We assume usage only `import.meta.env.DEV`, `import.meta.env.PROD` and `import.meta.env.MODE` variables in bundler
  user's code and emulate only it with defining constants.

  But this constants working only in compile time when CSS is generated and based on mode in which the `forge` is running
  at compilation moment.

  Be careful when use code which based on that variables in your `vanilla-extract` styles.

## 2.0.0-next.1

### Major Changes

- [#60](https://github.com/ReTable/forge/pull/60) [`5611ead`](https://github.com/ReTable/forge/commit/5611ead5c205c95501692f0edd36a3381225e876) Thanks [@demiazz](https://github.com/demiazz)! - update target node up to 20.x

## 2.0.0-next.0

### Major Changes

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - enable `memo` by default for SVGR transformations

### Minor Changes

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - added support of transformation of SVG component name with `svgrComponentName` option.

  By default, SVGR uses `Svg<CamelCaseFileName>` name for components. You can override this behaviour through
  `svgrComponentName` options, which should be function of format `(svgrName: string) => string`.

  Example:

  ```js
  export default {
    // ...
    svgrComponentName(name) {
      return `Ui${name.slice(3)}Icon`;
    },
    // ...
  };
  ```

  If you have a file `column.svg` then component name is `SvgColumn` by default. But with config from about the name
  will be `UiColumnIcon`.

  If you use memoization it looks like:

  ```js
  import { memo } from 'react';

  const UiColumnIcon = (props) => {
    // ...
  };

  const Memo = memo(UiColumnIcon);

  export { Memo as ReactComponent };
  ```

  This option doesn't affect named exports.

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - allow to append `displayName` for SVGR components.

  By default, SVGR doesn't append `displayName` for exported components. You can add this behaviour through `svgrDisplayName`
  option, which should be function of format `(componentName: string) => string | { displayName: string; isDebugOnly?: boolean }`.

  When function is returns string, then `isDebugOnly` equals to `false`.

  The `componentName` is name of component itself (before memoization if enabled). If you provide `svgrComponentName` option,
  then result of applying this function is `componentName`.

  The `isDebugOnly` enables wrapping the assignment in Vite compatible condition.

  ```js
  // `isDebugOnly` = false

  Component.displayName = 'scope(ComponentDisplayName)';

  // `isDebugOnly` = true

  if (import.meta.env.DEV) {
    Component.displayName = `scope(ComponentDisplayName)`;
  }
  ```

  If memoization is enabled, then the `displayName` will be assigned to the memoized component:

  ```js
  const Component = (props) => {
    // ...
  };

  const Memo = memo(Component);

  Memo.displayName = `scope(ComponentDisplayName)`;
  ```

### Patch Changes

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - add typings and exports config type

- [#57](https://github.com/ReTable/forge/pull/57) [`d3c40d7`](https://github.com/ReTable/forge/commit/d3c40d7aad9615965415a3be9e9364000c43c833) Thanks [@demiazz](https://github.com/demiazz)! - add `@babel/types` dependency

## 1.3.5

### Patch Changes

- [#47](https://github.com/ReTable/forge/pull/47) [`dd9e428`](https://github.com/ReTable/forge/commit/dd9e42892f608000b614f01ce3c77e5d2cf5eb6d) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.3.4

### Patch Changes

- [#45](https://github.com/ReTable/forge/pull/45) [`9e9f585`](https://github.com/ReTable/forge/commit/9e9f58544c0c918b67c4db2e2408c7445f94e697) Thanks [@demiazz](https://github.com/demiazz)! - fix node version restrictions

## 1.3.3

### Patch Changes

- [#43](https://github.com/ReTable/forge/pull/43) [`936d5e2`](https://github.com/ReTable/forge/commit/936d5e274a23cca20bd9243bafd656c9fc62cb61) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.3.2

### Patch Changes

- [#40](https://github.com/ReTable/forge/pull/40) [`6081c5a`](https://github.com/ReTable/forge/commit/6081c5afcbde2b22c40b06a2a06791ea1aa47504) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.3.1

### Patch Changes

- [#38](https://github.com/ReTable/forge/pull/38) [`fc41ac8`](https://github.com/ReTable/forge/commit/fc41ac89e9d3e5eef52bb5d626d8afdfc452f7f3) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.3.0

### Minor Changes

- [#36](https://github.com/ReTable/forge/pull/36) [`8bb0af7`](https://github.com/ReTable/forge/commit/8bb0af71b8fdd2b44d4b1988d978f1308e1a1110) Thanks [@demiazz](https://github.com/demiazz)! - add correct handling of user defined `displayName` property when Storybook docs are generated

## 1.2.0

### Minor Changes

- [#32](https://github.com/ReTable/forge/pull/32) [`a92544c`](https://github.com/ReTable/forge/commit/a92544c7d8e556344cb503ec8aa6a59f1d1364a3) Thanks [@demiazz](https://github.com/demiazz)! - added `cssClassPrefix` option

  The option can be boolean or string.

  If string option is used, then it will be used as simple template with following placeholders:

  - `[full-name]` - full package name (with scope if it presented);
  - `[scope]` - package scope if presented or an empty string;
  - `[name]` - package name without scope.

  The prefix has format `[full-name]__` by default or when option is `true`.

  When package name is `awesome-ui`, then:

  - when the option is `[full-name]__`, then the prefix is `awesome_ui__`;
  - when the option is `[scope]__`, then the prefix is `__`;
  - when the option is `[scope]__[name]__`, then the prefix is `__awesome_ui__`.

  When package name is `@awesome-ui/theme`, then:

  - when the option is `[full-name]__`, then the prefix is `awesome_ui_theme_`;
  - when the option is `[scope]__`, then the prefix is `awesome_ui__`;
  - when the option is `[scope]__[name]__`, then the prefix is `awesome_ui__theme__`.

### Patch Changes

- [#32](https://github.com/ReTable/forge/pull/32) [`a92544c`](https://github.com/ReTable/forge/commit/a92544c7d8e556344cb503ec8aa6a59f1d1364a3) Thanks [@demiazz](https://github.com/demiazz)! - uses short CSS classes format for CSS Modules and `vanilla-extract` in production mode

- [#32](https://github.com/ReTable/forge/pull/32) [`a92544c`](https://github.com/ReTable/forge/commit/a92544c7d8e556344cb503ec8aa6a59f1d1364a3) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.1.3

### Patch Changes

- [#29](https://github.com/ReTable/forge/pull/29) [`a31820d`](https://github.com/ReTable/forge/commit/a31820d661e4e206a9a43284ca2ee1fda2892ed2) Thanks [@demiazz](https://github.com/demiazz)! - skip doc generation for external types

- [#29](https://github.com/ReTable/forge/pull/29) [`a31820d`](https://github.com/ReTable/forge/commit/a31820d661e4e206a9a43284ca2ee1fda2892ed2) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.1.2

### Patch Changes

- [#27](https://github.com/ReTable/forge/pull/27) [`fccb287`](https://github.com/ReTable/forge/commit/fccb287e130361d693bd40e4d49ec2b046fa9714) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.1.1

### Patch Changes

- [#25](https://github.com/ReTable/forge/pull/25) [`4e5e4cf`](https://github.com/ReTable/forge/commit/4e5e4cf266c606b31c607db126cb7b4f4caedcc7) Thanks [@demiazz](https://github.com/demiazz)! - skip undocumented props when generate metadata for Storybook

## 1.1.0

### Minor Changes

- [#23](https://github.com/ReTable/forge/pull/23) [`d81e5d4`](https://github.com/ReTable/forge/commit/d81e5d40c3b18d2eb7d42b23980740acfc4725d0) Thanks [@demiazz](https://github.com/demiazz)! - don't wrap SVG components with `React.memo` by default

  If you need to change this behaviour, you can use `.svgrrc` files, which supported out of the box,
  instead of `exportType`, `namedExport` and `svgo` options. They are set up by the `forge` itself.

## 1.0.3

### Patch Changes

- [#21](https://github.com/ReTable/forge/pull/21) [`d64c649`](https://github.com/ReTable/forge/commit/d64c649c0f788a8cfeb75cb8d9ea77c5c56330b3) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 1.0.2

### Patch Changes

- [#18](https://github.com/ReTable/forge/pull/18) [`2b874d8`](https://github.com/ReTable/forge/commit/2b874d8dee1c5d66eba4e61ba3e51e9c9c117932) Thanks [@demiazz](https://github.com/demiazz)! - fix parsing of entries from config file

## 1.0.1

### Patch Changes

- [#16](https://github.com/ReTable/forge/pull/16) [`b6bc79c`](https://github.com/ReTable/forge/commit/b6bc79caa7adb7cd64a5cc6176b43542b3a1235d) Thanks [@demiazz](https://github.com/demiazz)! - return a broken watch mode

## 1.0.0

### Major Changes

- [#14](https://github.com/ReTable/forge/pull/14) [`b0d7f4c`](https://github.com/ReTable/forge/commit/b0d7f4c7c6096453eac6bac6b9c047bedc84dc29) Thanks [@demiazz](https://github.com/demiazz)! - merge `build` and `watch` commands.

  The `watch` command has been replaced with `-w,--watch` option. Also, we replace platform command with `-t,--target`
  option.

  You should change:

  ```shell
  forge watch node
  ```

  to the following code:

  ```shell
  forge build --target node --watch
  ```

### Minor Changes

- [#14](https://github.com/ReTable/forge/pull/14) [`b0d7f4c`](https://github.com/ReTable/forge/commit/b0d7f4c7c6096453eac6bac6b9c047bedc84dc29) Thanks [@demiazz](https://github.com/demiazz)! - add support of configuration file

  You can use configuration file. We're looking for:

  - a `forge` property in the `package.json`;
  - a JSON or YAML `.forgerc` file;
  - an `.forgerc` file with `.json`, `.yaml`, `.yml`, `.js`, `.mjs` or `.cjs`
  - any of the above two inside a .config subdirectory;
  - a `forge.config.js`, `forge.config.mjs`, or `forge.config.cjs` file.

  Look at example of JSON configuration:

  ```json
  {
    "$schema": "https://github.com/ReTable/forge/blob/main/schemas/forgerc.json",

    "target": "node",

    "entry": "index",

    "check": true,
    "typings": true,

    "postBuild": "touch lib/meta.js",

    "build": {
      "production": true
    },

    "watch": {
      "production": false,
      "storybook": true
    }
  }
  ```

- [#14](https://github.com/ReTable/forge/pull/14) [`b0d7f4c`](https://github.com/ReTable/forge/commit/b0d7f4c7c6096453eac6bac6b9c047bedc84dc29) Thanks [@demiazz](https://github.com/demiazz)! - add support of post build hooks

  You can use one or more post build hooks:

  ```shell
  forge build --target node --post-build "touch lib/index.js" --post-build "touch index.d.ts":"typings"
  ```

### Patch Changes

- [#14](https://github.com/ReTable/forge/pull/14) [`b0d7f4c`](https://github.com/ReTable/forge/commit/b0d7f4c7c6096453eac6bac6b9c047bedc84dc29) Thanks [@demiazz](https://github.com/demiazz)! - add `init` command

  You can generate `.forgerc` with `init` command.

  Example:

  ```shell
  forge init --target node
  ```

## 0.3.0

### Minor Changes

- [#12](https://github.com/ReTable/forge/pull/12) [`0813828`](https://github.com/ReTable/forge/commit/08138286d26c0f78334399c581ec82865de7c9b2) Thanks [@demiazz](https://github.com/demiazz)! - add support of multiple entries

  You can use `--entry` option to define entry points.

  The `--entry` option has the following syntax: `--entry <in>[:<out>]`. You can use this option more than one time to
  define multiple entries.

  #### Default behaviour

  By default, the `forge` always searches `<packageRoot>/src/index.tsx` or `<packageRoot>/src/index.ts` entry point, and
  always bundles it to the `<packageRoot>/lib/index.js`.

  The following command:

  ```shell
  $ forge build browser
  ```

  is equivalent to this command:

  ```shell
  $ forge build browser --entry index
  ```

  #### Input format

  We allow to define input module as path to file or as path to module. A given path will be automatically prepended by
  `./src/` path before it will be transferred to the `esbuild`.

  If you provide a module path, then the `forge` will search entry point in different ways.

  For example, look at the next command:

  ```shell
  $ forge build browser --entry nodes
  ```

  The `forge` will search entry point in the following order:

  - `<packageRoot>/src/nodes.tsx`
  - `<packageRoot>/src/nodes.ts`
  - `<packageRoot>/src/nodes/index.tsx`
  - `<packageRoot>/src/nodes/index.ts`

  #### Output format

  By default, the `forge` uses module path relative to the `<packageRoot>/src` directory.

  For example, look at this command:

  ```shell
  $ forge build browser --entry nodes
  ```

  The `forge` create `<packageRoot>/lib/nodes.js` bundle independent of entry point (`nodes.ts` or `nodes/index.ts`).

  But if you call it in the following style:

  ```shell
  $ forge build browser --entry nodes/index
  ```

  Then the `<packageRoot>/lib/nodes/index.js` will be created.

  Also, don't provide `.js` extension for output entry. It will be added automatically.

  But even if you provide it, then we automatically remove it before calling of `esbuild` to prevent creating a file with
  doubled `.js` extension.

  #### Code Splitting

  Support of multiple entries enables code splitting feature to share the code inside a bundled library.

  It creates ESM modules with shared code and uses them in bundles.

  Each JS bundle will automatically import own CSS bundle in beginning of file if a CSS bundle is exists.

  **IMPORTANT:** This feature not working with CSS. Yes, your imports from CSS modules or `vanilla-extract` will be
  shared, but own CSS bundle will be created for each JS bundle, even they have a similar styles inside. Hashed classes
  will be identical in all CSS bundles too. Keep it in mind.

### Patch Changes

- [#12](https://github.com/ReTable/forge/pull/12) [`0813828`](https://github.com/ReTable/forge/commit/08138286d26c0f78334399c581ec82865de7c9b2) Thanks [@demiazz](https://github.com/demiazz)! - update dependencies

## 0.2.3

### Patch Changes

- [#10](https://github.com/ReTable/forge/pull/10) [`585405a`](https://github.com/ReTable/forge/commit/585405a6a1499aa65434122fe56ddc0e120e9aa3) Thanks [@demiazz](https://github.com/demiazz)! - ignore import of CSS files inside `vanilla-extract` files

## 0.2.2

### Patch Changes

- [#8](https://github.com/ReTable/forge/pull/8) [`23ff8c4`](https://github.com/ReTable/forge/commit/23ff8c4588f3e70894c36d0c8d501ef806ae0357) Thanks [@demiazz](https://github.com/demiazz)! - add support of import css files from in the `vanilla-extract` plugin

## 0.2.1

### Patch Changes

- [#6](https://github.com/ReTable/forge/pull/6) [`b807fa7`](https://github.com/ReTable/forge/commit/b807fa7cdc82b14792b81a8f4982fe411e688df9) Thanks [@demiazz](https://github.com/demiazz)! - use conditional import for searching of Sass imports

## 0.2.0

### Minor Changes

- [#4](https://github.com/ReTable/forge/pull/4) [`8dddd8d`](https://github.com/ReTable/forge/commit/8dddd8d83e1f911b5f9ed315004b78c0846f7f8c) Thanks [@demiazz](https://github.com/demiazz)! - adds support of packages resolve in the Sass

  The `forge` resolves external packages through `~<pkg>` urls.

  Example:

  ```scss
  @use '~@tabula/ui-theme' as theme;

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
