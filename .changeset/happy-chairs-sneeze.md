---
'@tabula/forge': minor
---

added `cssClassPrefix` option

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
