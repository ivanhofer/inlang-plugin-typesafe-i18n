import type { Message, Pattern, Plugin, VariableReference } from "@inlang/plugin"
import { patchFs, resolve } from './utils/typesafe-i18n.utils.js'
import { getConfig } from 'typesafe-i18n/config'
import type { BaseTranslation } from 'typesafe-i18n'
import set from 'just-safe-set'
import dedent from 'dedent'
import { globalMetadata, type ParameterMetadata } from './loadMessages.js'

type NodeishFs = Parameters<NonNullable<Plugin['saveMessages']>>[0]['nodeishFs']

// ------------------------------------------------------------------------------------------------

export const saveMessages = (async ({ nodeishFs, messages }) => {
	const $fs = patchFs(nodeishFs)

	// @ts-expect-error - the types slightly differ; should work regardless
	const typesafeI18nConfig = await getConfig($fs)

	const dictionaryMap = messagesToDictionaryMap(messages, typesafeI18nConfig.baseLocale)

	for (const [locale, dictionary] of Object.entries(dictionaryMap)) {
		const isReferenceLanguage = locale === typesafeI18nConfig.baseLocale

		const type = isReferenceLanguage ? "BaseTranslation" : "Translation"
		// TODO: path could be wrong if esmImports=true
		// TODO: write correct path for namespaces
		// TODO: export utility type from `typesafe-i18n` to get correct string e.g. with `satisfies`
		const template = dedent`
			import type { ${type} } from '../${typesafeI18nConfig.typesFileName}'

			const ${locale}: ${type} = ${JSON.stringify(dictionary, null, 3)
				.split(/\n/).map(text => '   ' + text).join('\n')}

			export default ${locale}
		`

		await createFoldersIfMissing($fs, resolve(typesafeI18nConfig.outputPath, locale))

		await $fs.writeFile(
			resolve(typesafeI18nConfig.outputPath, `${locale}/index.ts`),
			template
		)
	}
}) satisfies Plugin['saveMessages']

// ------------------------------------------------------------------------------------------------

const createFoldersIfMissing = async ($fs: NodeishFs, path: string): Promise<void> => {
	const pathParts = path.split('/')
	let currentPath = ''
	for (const part of pathParts) {
		currentPath += part + '/'
		if (!(await $fs.readdir(currentPath).catch(() => undefined))) {
			await $fs.mkdir(currentPath)
		}
	}
}

// ------------------------------------------------------------------------------------------------

const messagesToDictionaryMap = (messages: Message[], baseLocale: string): Record<string, BaseTranslation> => {
	const dictionaries: Record<string, BaseTranslation> = {}

	for (const message of messages) {
		for (const variant of message.variants) {
			const { languageTag, pattern } = variant
			const dictionary = dictionaries[languageTag] ??= {}
			const isBaseLocale = languageTag === baseLocale
			// TODO: how to make this work with multiple variants?
			set(dictionary, message.id, serializePattern(pattern, globalMetadata[message.id], isBaseLocale))
		}
	}

	return dictionaries
}

// ------------------------------------------------------------------------------------------------

const serializePattern = (pattern: Pattern, metadataForLocale: Record<string, ParameterMetadata | undefined>, isBaseLocale: boolean): string => {
	return pattern.map((patternElement) => serializePatternElement(patternElement, metadataForLocale, isBaseLocale)).join("")
}

const serializePatternElement = (
	element: Pattern[number],
	metadataForLocale: Record<string, ParameterMetadata | undefined>,
	isReferenceLanguage: boolean
): string => {
	switch (element.type) {
		case "Text":
			return element.value
		case "VariableReference":
			return serializeParameter(element, metadataForLocale, isReferenceLanguage)
	}
}

const serializeParameter = ({ name }: VariableReference, metadataForLocale: Record<string, ParameterMetadata | undefined>, isReferenceLanguage: boolean): string => {
	let str = name

	const metadata = (metadataForLocale || {})[name]
	if (isReferenceLanguage && metadata) {
		if (metadata.optional) str += "?"
		if (metadata.types?.length > 0) {
			if (!(metadata.types.length === 3
				&& metadata.types.includes("string")
				&& metadata.types.includes("number")
				&& metadata.types.includes("boolean"))
			) {
				str += `:${metadata.types[0]}`
			}
		}
	}
	if (metadata?.transforms?.length > 0) {
		str += `|${metadata.transforms.map(({ name }: any) => name).join("|")}`
	}
	return `{${str}}`
}