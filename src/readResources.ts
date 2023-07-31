import type { InlangConfig } from "@inlang/core/config"
import type { InlangEnvironment } from "@inlang/core/environment"
import type * as ast from "@inlang/core/ast"
import { getConfig } from "typesafe-i18n/config"
import { experimentalParseMessage, type ParameterPart, type PluralPart } from "typesafe-i18n/parser"
import { patchFs, resolve } from './utils.js'

type ReadResourcesArgs = Parameters<InlangConfig["readResources"]>[0] &
	InlangEnvironment

export async function readResources({
	config,
	$fs: rawFs,
}: ReadResourcesArgs): ReturnType<InlangConfig["readResources"]> {
	const $fs = patchFs(rawFs)

	// @ts-expect-error - the types slightly differ; should work regardless
	const typesafeI18nConfig = await getConfig($fs)

	const result: ast.Resource[] = []
	for (const language of config.languages) {
		const dictionary = await getDictionaryForLocale(
			$fs,
			typesafeI18nConfig.outputPath,
			language
		)
		result.push(parseResource(dictionary, language))
	}

	return result
}

const getDictionaryForLocale = async (
	$fs: InlangEnvironment["$fs"],
	outputPath: string,
	locale: string
) => {
	// TODO: create a better, less hacky version
	const baseDictionary = await $fs.readFile(resolve(outputPath, `${locale}/index.ts`), { encoding: "utf-8" }) as string

	const withoutImports = baseDictionary
		.split("\n")
		.filter((line) => !line.trim().startsWith("import "))
		.join("\n")
	const withoutTypes = withoutImports
		.replace(/const\s\w[^\s]+\s*(:\s*\w[^\s]+\s*)=/g, (match, type) => match.replace(type, ""))
	const withoutSatisfies = withoutTypes.replace(/ satisfies.*\/n/g, "\n")

	const moduleWithMimeType = "data:application/javascript," + encodeURIComponent(withoutSatisfies)
	return (await import(/* @vite-ignore */ moduleWithMimeType)).default
}

const parseResource = (
	flatJson: Record<string, string>,
	locale: string
): ast.Resource => {
	return {
		type: "Resource",
		languageTag: {
			type: "LanguageTag",
			name: locale,
		},
		body: Object.entries(flatJson).map(([id, value]) =>
			parseMessage(id, value)
		).flat(),
	}
}

const parseMessage = (id: string, value: string | Record<string, string>): ast.Message | ast.Message[] => {
	if (typeof value === 'object')
		return Object.entries(value).map(([entryId, entryValue]) =>
			parseMessage(`${id}.${entryId}`, entryValue)
		).flat()

	const parsedMessage = experimentalParseMessage(value)

	return {
		type: "Message",
		id: {
			type: "Identifier",
			name: id,
		},
		pattern: {
			type: "Pattern",
			elements: parsedMessage.map(part => {
				switch (part.kind) {
					case 'parameter':
						return parseParameter(part)
					case 'text':
						return { type: "Text", value: part.content }
					case 'plural':
						return parsePlural(part)
				}
			})
		},
	}
}

const parseParameter = (parameterPart: ParameterPart): ast.Placeholder => {
	return {
		type: "Placeholder",
		body: {
			type: 'VariableReference',
			name: parameterPart.key,
			metadata: {
				types: parameterPart.types,
				optional: parameterPart.optional,
				transforms: parameterPart.transforms,
			}
		}
	}
}

// TODO: make this more robust
const parsePlural = (pluralPart: PluralPart): ast.Text => {
	return {
		type: "Text",
		value: `{{${[pluralPart.zero, pluralPart.one, pluralPart.two, pluralPart.few, pluralPart.many, pluralPart.other]
			.filter(Boolean)
			.join('|')
			}}}`
	}
}