---
'@tabula/forge': minor
---

don't wrap SVG components with `React.memo` by default

If you need to change this behaviour, you can use `.svgrrc` files, which supported out of the box,
instead of `exportType`, `namedExport` and `svgo` options. They are set up by the `forge` itself.
