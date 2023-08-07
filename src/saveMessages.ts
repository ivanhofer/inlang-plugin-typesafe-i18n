import type { Message, Pattern, Plugin, VariableReference, Variant } from "@inlang/plugin"
import { patchFs, resolve } from './utils/typesafe-i18n.utils.js'
import { getConfig } from 'typesafe-i18n/config'
import type { BaseTranslation } from 'typesafe-i18n'
import set from 'just-safe-set'
import dedent from 'dedent'

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

			const ${locale}: ${type} = ${JSON.stringify(dictionary, null, 3)}

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
		for (const languageTag in message.body) {
			const dictionary = dictionaries[languageTag] ??= {}
			const isBaseLocale = languageTag === baseLocale
			set(dictionary, message.id, serializeVariants(message.body[languageTag], isBaseLocale))
		}
	}

	return dictionaries
}

// ------------------------------------------------------------------------------------------------

const serializeVariants = (variants: Variant[], isBaseLocale: boolean): string => {
	return serializePattern(variants[0]?.pattern || [], isBaseLocale)
}

const serializePattern = (pattern: Pattern, isBaseLocale: boolean): string => {
	return pattern.map((patternElement) => serializePatternElement(patternElement, isBaseLocale)).join("")
}

const serializePatternElement = (
	element: Pattern[number],
	isReferenceLanguage: boolean
): string => {
	switch (element.type) {
		case "Text":
			return element.value
		case "VariableReference":
			return serializeParameter(element, isReferenceLanguage)
	}
}

const serializeParameter = ({ name }: VariableReference, isReferenceLanguage: boolean): string => {
	let str = name
	const metadata = {} as any // TODO: get metadata somehow
	if (isReferenceLanguage) {
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
	if (metadata.transforms?.length > 0) {
		str += `|${metadata.transforms.map(({ name }: any) => name).join("|")}`
	}
	return `{${str}}`
}