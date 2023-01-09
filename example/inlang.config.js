/**
 * @type {import("@inlang/core/config").InitializeConfig}
 */
export async function initializeConfig(env) {
  // importing plugin from local file for testing purposes
  const plugin = await env.$import("../dist/index.js");

  const pluginConfig = {
    pathPattern: "./{language}.json",
  };

  return {
    referenceLanguage: "en",
    languages: ["en", "de"],
    readResources: (args) =>
      plugin.readResources({ ...args, ...env, pluginConfig }),
    writeResources: (args) =>
      plugin.writeResources({ ...args, ...env, pluginConfig }),
  };
}
