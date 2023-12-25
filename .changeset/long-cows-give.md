---
'@tabula/forge': minor
---

added support of transformation of SVG component name with `svgrComponentName` option.

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
