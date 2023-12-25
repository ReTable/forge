---
'@tabula/forge': minor
---

allow to append `displayName` for SVGR components.

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
