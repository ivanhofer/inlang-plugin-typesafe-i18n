import { getLocaleInformation } from "typesafe-i18n/config"
import { createPlugin } from "@inlang/core/plugin"
import { readResources } from './readResources.js'
import { writeResources } from './writeResources.js'
import { patchFs } from './utils.js'
import type { InlangConfig } from "@inlang/core/config"

// issues:
//  - real typescript compilation does not work

export const plugin = createPlugin(({ env }) => ({
  id: "ivanhofer.inlang-plugin-typesafe-i18n",
  config: async (config) => {
    // @ts-expect-error - the types slightly differ; should work regardless
    const { base, locales } = await getLocaleInformation(patchFs(env.$fs))

    return {
      referenceLanguage: base,
      languages: locales,
      readResources: ({ config }) => readResources({ config, ...env }),
      writeResources: ({ config, resources }) => writeResources({ config, resources, ...env }),
      ideExtension: config.ideExtension ? config.ideExtension : ideExtensionDefaultConfig
    }
  },
}))

const ideExtensionDefaultConfig: InlangConfig["ideExtension"] = {
	messageReferenceMatchers: [
		async (args) => {
			const regex = /\$LL\.[a-zA-Z]+\([^)]*\)/gm;
			const str = args.documentText;
			let match;
			const result = [];

			while ((match = regex.exec(str)) !== null) {
				const startLine = (str.slice(0, Math.max(0, match.index)).match(/\n/g) || []).length + 1;
				const startPos = match.index - str.lastIndexOf("\n", match.index - 1);
				const endPos = match.index + match[0].length - str.lastIndexOf("\n", match.index + match[0].length - 1);
				const endLine = (str.slice(0, Math.max(0, match.index + match[0].length)).match(/\n/g) || []).length + 1;

				result.push({
					messageId: match[0],
					position: {
						start: {
							line: startLine,
							character: startPos,
						},
						end: {
							line: endLine,
							character: endPos,
						},
					},
				});
			}
			return result;
		},
	],
	extractMessageOptions: [
		{
			callback: (messageId) => {
				const lastDotIndex = messageId.lastIndexOf(".");
				const lastSpaceIndex = messageId.lastIndexOf(" ");
				const functionName = `$LL.${messageId.substring(0, lastDotIndex)}`;
				let argument = messageId;
			  
				if (
				  lastDotIndex !== -1 &&
				  lastSpaceIndex < lastDotIndex &&
				  lastDotIndex < messageId.length - 1
				) {
				  argument = messageId.substring(lastDotIndex + 1);
				}
			  
				return `${functionName}(${argument})`;
			  },
		},
	],
	documentSelectors: [
		{
			language: "javascript",
		},
		{
			language: "typescript",
		},
		{
			language: "svelte",
		},
	],
};
