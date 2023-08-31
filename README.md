# @tabula/forge

The bundler for packages for Node.js and browser with support of various tools.

## Details

This bundler is wrapper around [esbuild](https://esbuild.github.io/) with various plugins.

The `forge` doesn't allow to configure details of bundling, and expects
predefined project structure.

## Installation

Use the package manager [pnpm](https://pnpm.io) to install `@tabula/forge`.

```bash
pnpm add @tabula/forge --save-dev
```

You can use [npm](https://npmjs.com) or [yarn](https://yarnpkg.com) too.

## Common

The `forge` has a few moments which should be highlighted:

- looking for sources in the `<packageRoot>/src` directory;
- produces output to the `<packageRoot>/lib` directory;
- produces typings to the `<packageRoot>/typings` directory;
- uses ESM format for produced module;
- doesn't bundle dependencies;
- generates source maps which include sources content.

## Commands

### init

Create an initial file for the selected target.

#### Usage

`forge init -t,--target browser|node`

#### Options

- `-t,--target` - defines target for which a config will be generated.

### build

Build a package.

#### Usage

`forge [build] <-t,--target browser|node> [-e,--entry <in>[:<out>]] [-p,--production] [-c,--check] [-t,--typings]
[-s,--storybook] [-b,--post-build <command>[:<cwd>]] [-w,--watch]`

#### Options

- `-t`, `--target` - defines which platform is target for build. Must be `browser` or `node`. This
  option is required, if not defined in the configuration file.
- `-e`, `--entry` - (default: **index**) defines an entry point. Can be used multiple times to define multiple entry
  points.
- `-p`, `--production` - (default: **true** for build and **false** for watch) enables bundling for production environment. Build for production mode doesn't enable minification
  for debug purposes in the target user application.
- `-c`, `--check` - (default: **true**) enables types checking through TypeScript compiler running. It stops build if any
  type error has been found.
- `-t`, `--typings` - (default: **true**) enables typings generation. It generates typings only if type checking is enabled.
- `-s`, `--storybook` - (default: **false** for build and **true** for watch) enables emitting additional meta for Storybook. It uses `react-docgen` under the hood. This option
  is useful only for the `browser` target.
- `-h,--css-class-prefix` - (default: **true**) option defines usage of prefix for CSS classes which generates by the CSS modules and
  vanilla-extract in production mode. It can be string in special format or boolean.
- `-b`, `--post-build` - defines post build hook. A hook is an external command, which executed in a shell. Can be used
  multiple times to define multiple post build hooks.
- `-w`, `--watch` - (default: **false**) enables watch mode.

## Configuration file

You can use configuration file. We're looking for:

- a `forge` property in the `package.json`;
- a JSON or YAML `.forgerc` file;
- an `.forgerc` file with `.json`, `.yaml`, `.yml`, `.js`, `.mjs` or `.cjs`
- any of the above two inside a .config subdirectory;
- a `forge.config.js`, `forge.config.mjs`, or `forge.config.cjs` file.

## Example

```json
{
  "$schema": "https://github.com/ReTable/forge/blob/main/schemas/forgerc.json",

  "target": "node",

  "entry": "index",

  "check": true,
  "typings": true,
  "cssClassPrefix": true,

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

### Entry format

You can use one of following entry formats:

- ```json
  "<input>"
  ```
- ```json
  "<input>:<output>"
  ```
- ```json
  {
    "in": "<input>"
  }
  ```
- ```json
  {
    "in": "<input>",
    "out": "<output>"
  }
  ```

### Entries

You can define one or more entries:

```json5
{
  "entry": // <entry>
}
```

or

```json5
{
  entries: [
    // <entry>
    // <entry>
    // ...
  ],
}
```

### Hooks format

You can use one of following hook formats:

- ```json
  "<command>"
  ```
- ```json
  "<command>:<cwd>"
  ```
- ```json
  {
    "command": "<command>"
  }
  ```
- ```json
  {
    "command": "<command>",
    "cwd": "<cwd>"
  }
  ```

### Options resolving

We resolve option in following order:

- an option provided through CLI;
- command specific option from the config (`build` or `watch` properties);
- option from the config file;
- default value.

### Schema

You can look at the [JSON Schema](https://github.com/ReTable/forge/blob/main/schemas/forgerc.json) for configuration file.

## Entries

By default, the `forge` looking for `<packageRoot>/src/index.tsx` or `<packageRoot/src/index.ts` file, and bundles it
to the `<packageRoot>/lib/index.js`.

You can provide entry in two possible variants:

- only input: `<input>`;
- input and output: `<input>:<output>`.

### Input resolving

All input files will be searched in the `<packageRoot>/src` directory.

If you provide input as file name, then it will be searched exactly.

For example the following command:

```shell
$ forge build node --entry nodes/entry.ts
```

The `forge` will use `<packageRoot>/src/nodes/entry.ts` as an entry file.

But you can provide module name instead of file.

Look at the next command:

```shell
$ forge build node --entry nodes/entry
```

In that case, the `forge` will looking for an entry file in the following order:

- `<packageRoot>/src/nodes/entry.tsx`;
- `<packageRoot>/src/nodes/entry.ts`;
- `<packageRoot>/src/nodes/entry/index.tsx`;
- `<packageRoot>/src/nodes/entry/index.ts`.

### Output resolving

By default, we use relative path of entry module as output path. For example:

- when input is `nodes/entry`, then bundle will be `<packageRoot>/lib/nodes/entry.js` (for example, an entry file may be
  `<packageRoot>/nodes/entry.ts` or `<packageRoot>/nodes/entry/index.ts`);
- when input is `nodes/index.ts`, then bundle will be `<packageRoot>/lib/nodes/index.js`.

But you can define your own path for bundle. For example:

```shell
forge build node --entry nodes/entry:bundles/nodes
```

This command creates a bundle `<packageRoot>/lib/bundles/nodes.js`.

**NOTE:** Don't use `.js` extension for output module, because we add it by default before transfer parameters to the
`esbuild`. But even if you add the extension, we will fix it and your bundle will haven't doubled `.js` extension
anyway.

### Code splitting

We use code splitting feature of the `esbuild`. If you have multiple entries which share the same code, bundler will
create ESM modules with shared code, and will use it in the bundles.

### Code splitting and CSS

Be carefully when use code splitting and CSS. Constants which extracted from CSS modules or `vanilla-extract` styles
will be shared. But, extracted CSS from shared modules will be duplicated for each bundle.

All hashed class names will be the same between all modules which use them.

## Hooks

You can run scripts after each build.

For example:

```shell
forge -b "touch lib/meta.js" -b "touch meta.d.ts":"typings"
```

The two commands will be executed after build. The first one will use `<packageRoot>` as working directory. And the
second one will use `<packageRoot>/typings` as working directory.

## Node.js

The only one moment which you should know about bundling for Node.js that we
use version 18 as target.

## Browser

Bundling for browser has a much more implementation details.

### Assets

We support bundling of images and fonts. But we don't inline it, and not
change names or assets structure like a Vite or Webpack.

We only solve a task to bundle package for using in projects which will be
bundled for serving later.

### CSS

The CSS supported out of the box.

If your package uses CSS then a line `import "./index.css";` automatically
will be added to the beginning of a `lib/index.js` file.

Also, all CSS are processed by the [Autoprefixer](https://github.com/postcss/autoprefixer).

### CSS Modules

We support [CSS Modules](https://github.com/css-modules/css-modules) with
predefined settings:

- use `camelCaseOnly` locals convention;
- different scoped names are generated for development and production modes;
- package name and file path are used in scoped name for debug purposes in
  development mode.

Style files which use CSS Modules must have `*.module.[ext]` filename.

### CSS Preprocessors

The `forge` supports usage of the [PostCSS](https://postcss.org/) and
[Sass](https://sass-lang.com/).

You should use `*.pcss` extension for PostCSS and `*.scss` for the Sass.

#### Sass Imports

We support imports in format of `~<pkg>`. It's similar to the Webpack, but
has own restrictions.

The `forge` doesn't support paths inside the package. It does search
the `package.json` of the given package, and try to read `sass` field inside
of it.

Example:

```json
{
  "name": "@tabula/ui-theme",
  "sass": "./sass/index.scss"
}
```

will be resolved to the `<node_modules>/@tabula/ui-theme/sass/index.scss`.

### vanilla-extract

We support the [vanilla-extract](https://vanilla-extract.style/).

This is zero-runtime CSS-in-JS solution with TypeScript support.

**IMPORTANT**: All imports of CSS files in `*.css.ts` files is ignored.

### SVGR

We support the [SVGR](https://react-svgr.com/) to allow to use SVG images not
only as loadable assets, but also as a React components.

```typescript jsx
import iconUrl, { ReactComponent as IconUrl } from './icon.svg';

<>
  <IconUrl className="react-icon" />
  <img className="img-icon" src={iconUrl} />
</>;
```

An SVG file already exports React component as `ReactComponent`.

### React

We use automatic runtime only for React.

For more details, see [here](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).

This feature is [supported](https://esbuild.github.io/api/#jsx) by the esbuild already.

### Storybook

We generate additional documentation for Storybook:

```js
AwesomeComponent.__docgenInfo = { ...componentDocumentation };
```

### TypeScript

The `forge` supports TypeScript. It runs `tsc` before each build automatically.

You should provide `tsconfig.forge.json` in your project which will be used by
the `forge`.

You can use `@tabula/typescript-config` for Node.js:

```json
{
  "extends": "@tabula/typescript-config/tsconfig.node.json",

  "include": ["src/**/*"]
}
```

or browser:

```json
{
  "extends": "@tabula/typescript-config/tsconfig.browser.json",

  "include": ["src/**/*"]
}
```

The configuration for browser also includes typings for CSS and CSS Modules,
static files and SVG files with SVGR support.

That configs are recommended for usage with the `forge`.

### CSS Class Prefix

The `forge` supports option `cssClassPrefix` which used in production for browser builds. It enables adding prefix to
the classes which generated by the CSS Modules and `vanilla-extract`.

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

## License

This project is [ISC](https://choosealicense.com/licenses/isc/) licensed.
