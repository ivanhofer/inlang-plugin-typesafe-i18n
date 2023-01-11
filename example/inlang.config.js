/**
 * @type {import("@inlang/core/config").InitializeConfig}
 */
export async function initializeConfig(env) {
  // importing plugin from local file for testing purposes
  const plugin = await env.$import("../dist/index.js");

  return {
    referenceLanguage: "en",
    languages: ["en", "de"],
    readResources: (args) =>
      plugin.readResources({ ...args, ...env }),
    writeResources: (args) =>
      plugin.writeResources({ ...args, ...env }),
  };
}
