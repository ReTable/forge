---
'@tabula/forge': major
---

merge `build` and `watch` commands.

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
