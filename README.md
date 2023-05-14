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
  const { default: typesafeI18nPlugin } = await env.$import(
    "https://cdn.jsdelivr.net/gh/ivanhofer/inlang-plugin-typesafe-i18n@2/dist/index.js"
  )

  return {
    plugins: [typesafeI18nPlugin()],
  }
}
```

### Limitations

 - [namespaces](https://github.com/ivanhofer/typesafe-i18n/tree/main/packages/generator#namespaces) are currently not supported in the `inlang` Editor
 - types don't get updated if you make changes to your `BaseTranslation`
   workaround: to update the types run the [generator](https://github.com/ivanhofer/typesafe-i18n/tree/main/packages/generator) in CI after the Editor pushes new Messages to the repository
