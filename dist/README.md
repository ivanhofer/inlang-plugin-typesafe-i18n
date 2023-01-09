The dist directory is not ignored by default to enable dynamic imports directly from GitHub.

Importing directly from GitHub makes life easier for plugin maintainers as no publishing process to NPM is required. Users can import via a CDN like https://www.jsdelivr.com/. For example:

```ts
// @version refers to a git(hub) release tag
// read more on https://www.jsdelivr.com/?docs=gh
const module = await $import(
  "https://cdn.jsdelivr.net/gh/inlang/plugin-template@version/dist/index.js"
);
```
