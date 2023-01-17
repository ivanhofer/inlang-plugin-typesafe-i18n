import { getLocaleInformation } from 'typesafe-i18n/config'

/**
 * @type {import("@inlang/core/config").InitializeConfig}
 */
export async function initializeConfig(env) {
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
