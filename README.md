# inlang-plugin-typesafe-i18n

This is the official [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) plugin for [inlang](https://inlang.com).

## Usage

```js
// filename: inlang.config.js

/**
 * @type {import("@inlang/core/config").DefineConfig}
 */
export async function defineConfig(env) {
  // initialize the plugin
  const plugin = await env.$import(
    "https://cdn.jsdelivr.net/gh/ivanhofer/inlang-plugin-typesafe-i18n/dist/index.js"
  )

  // get the locale information from `typesafe-i18n`
  const { base, locales } = await plugin.getLocaleInformation(env.$fs)

  return {
    referenceLanguage: base,
    languages: locales,
    readResources: (args) => plugin.readResources({ ...args, ...env }),
    writeResources: (args) => plugin.writeResources({ ...args, ...env }),
  }
}

```