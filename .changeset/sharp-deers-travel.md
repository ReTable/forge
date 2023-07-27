---
'@tabula/forge': minor
---

add support of post build hooks

You can use one or more post build hooks:

```shell
forge build --target node --post-build "touch lib/index.js" --post-build "touch index.d.ts":"typings"
```
