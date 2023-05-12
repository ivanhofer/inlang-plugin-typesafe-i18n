/**
 * @type {import("@inlang/core/config").DefineConfig}
 */
export async function defineConfig(env) {
  const { default: typesafeI18nPlugin } = await env.$import("/dist/index.js")

  return {
    plugins: [typesafeI18nPlugin()],
  }
}
