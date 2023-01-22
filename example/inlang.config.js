/**
 * @type {import("@inlang/core/config").DefineConfig}
 */
export async function defineConfig(env) {
  /**
   * @type {import("typesafe-i18n/config")}
   */
  const { getLocaleInformation } = await env.$import("https://cdn.jsdelivr.net/npm/typesafe-i18n@5.20.0/config/index.mjs")

  // importing plugin from local file for testing purposes
  const plugin = await env.$import("../dist/index.js");

  const { base, locales } = await getLocaleInformation(env.$fs)

  return {
    referenceLanguage: base,
    languages: locales,
    readResources: (args) =>
      plugin.readResources({ ...args, ...env }),
    writeResources: (args) =>
      plugin.writeResources({ ...args, ...env }),
  };
}
