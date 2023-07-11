---
'@tabula/forge': minor
---

The `forge` resolves external packages through `~<pkg>` urls.

Example: 

```scss
@use `~@tabula/ui-theme` as theme;

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
