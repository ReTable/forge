---
'@tabula/forge': minor
---

emulate Vite's environment variables

The `vanilla-extract` uses `esbuild` under the hood with CJS format. In that case, if you import any code with usage of
`import`.

We assume usage only `import.meta.env.DEV`, `import.meta.env.PROD` and `import.meta.env.MODE` variables in bundler
user's code and emulate only it with defining constants.

But this constants working only in compile time when CSS is generated and based on mode in which the `forge` is running
at compilation moment.

Be careful when use code which based on that variables in your `vanilla-extract` styles.
