/**
 * @type {import("@inlang/core/config").DefineConfig}
 */
export async function defineConfig(env) {
  const plugin = await env.$import("./dist/index.js");

  const { base, locales } = await plugin.getLocaleInformation(env.$fs);

  return {
    referenceLanguage: base,
    languages: locales,
    readResources: (args) => plugin.readResources({ ...args, ...env }),
    writeResources: (args) => plugin.writeResources({ ...args, ...env }),
  };
}
