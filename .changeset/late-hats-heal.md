---
'@tabula/forge': minor
---

add support of configuration file

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
