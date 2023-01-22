# inlang-plugin-typesafe-i18n

This is the official [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) plugin for [inlang](https://inlang.com).

## Usage

```js
// filename: inlang.config.js
export async function defineConfig(env) {
  // initialize the plugin
  const plugin = await env.$import(
    "https://cdn.jsdelivr.net/gh/ivanhofer/inplang-plugin-typesafe-i18n@{version}/dist/index.js"
  )

  // get the locale information from `typesafe-i18n`
  const { base, locales } = await getLocaleInformation(env.$fs)

  return {
    referenceLanguage: base,
    languages: locales,
    readResources: (args) =>
      plugin.readResources({ ...args, ...env }),
    writeResources: (args) =>
      plugin.writeResources({ ...args, ...env }),
  }
}
```