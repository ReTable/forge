---
'@tabula/forge': minor
---

add support of multiple entries

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

**IMPORTANT:** This feature not working with CSS. Yes, your imports from CSS modules or `vanilla-extract` will be
shared, but own CSS bundle will be created for each JS bundle, even they have a similar styles inside. Hashed classes
will be identical in all CSS bundles too. Keep it in mind.
