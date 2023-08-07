import type { Message, Plugin } from "@inlang/plugin"
import type { Pattern, Text, VariableReference } from "@inlang/messages"
import { getConfig } from 'typesafe-i18n/config'
import type { BaseTranslation } from 'typesafe-i18n'
import { getDictionaryForLocale, patchFs } from './utils/typesafe-i18n.utils.js'
import { experimentalParseMessage, type ParameterPart, type PluralPart } from 'typesafe-i18n/parser'

type DictionaryMetadata = {
	languageTag: string
	dictionary: BaseTranslation
}

export const loadMessages = (async ({ nodeishFs, languageTags }) => {
	const $fs = patchFs(nodeishFs)

	// @ts-expect-error - the types slightly differ; should work regardless
	const typesafeI18nConfig = await getConfig($fs)

	const dictionaries = (await Promise.all<DictionaryMetadata | undefined>(languageTags
		.map(async languageTag => {
			const dictionary = await getDictionaryForLocale(
				$fs,
				typesafeI18nConfig.outputPath,
				languageTag,
			)

			if (!dictionary) return

			return {
				languageTag,
				dictionary,
			}
		})
	)).filter(Boolean) as DictionaryMetadata[]

	return getMessagesFromDictionaries(dictionaries, typesafeI18nConfig.baseLocale)
}) satisfies Plugin['loadMessages']

// ------------------------------------------------------------------------------------------------

const getMessagesFromDictionaries = (dictionaries: DictionaryMetadata[], baseLocale: string): Message[] => {
	const messages: Message[] = []
	for (const { languageTag, dictionary } of dictionaries) {
		const entries = getFlatDictionary(dictionary)
		for (const entry of entries) {
			let foundMessage = messages.find(({ id }) => id === entry.id)
			if (!foundMessage) {
				foundMessage = { id: entry.id, selectors: [], body: {} }
				messages.push(foundMessage)
			}

			const isBaseLocale = languageTag === baseLocale
			foundMessage.body[languageTag] = [{ match: {}, pattern: parsePattern(entry.value, globalMetadata[entry.id] ??= {}, isBaseLocale) }]
		}
	}

	return messages
}

type FlattenedDictionaryMetadata = { id: string, value: string }[]

const getFlatDictionary = (dictionary: BaseTranslation): FlattenedDictionaryMetadata => {
	return Object.entries(dictionary).map(([id, value]) => getFlatDictionaryEntry(id, value)).flat()
}

const getFlatDictionaryEntry = (id: string, value: BaseTranslation): FlattenedDictionaryMetadata => {
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([entryId, entryValue]) => getFlatDictionaryEntry(`${id}.${entryId}`, entryValue))
			.flat()
	}

	return [{ id, value }]
}

// ------------------------------------------------------------------------------------------------

export type ParameterMetadata = any

export const globalMetadata: Record<string, Record<string, ParameterMetadata>> = {}

const parsePattern = (value: string, metadataForLocale: Record<string, ParameterMetadata | undefined>, isBaseLocale: boolean): Pattern => {
	const parsedMessage = experimentalParseMessage(value)

	return parsedMessage.map(part => {
		switch (part.kind) {
			case 'parameter':
				return parseParameter(part, metadataForLocale, isBaseLocale)
			case 'text':
				return { type: "Text", value: part.content }
			case 'plural':
				return parsePlural(part)
		}
	})

}

const parseParameter = (parameterPart: ParameterPart, metadataForLocale: Record<string, ParameterMetadata | undefined>, isBaseLocale: boolean): VariableReference => {

	if (isBaseLocale) {
		metadataForLocale[parameterPart.key] = {
			types: parameterPart.types,
			optional: parameterPart.optional,
			transforms: parameterPart.transforms,
		}
	}

	return {
		type: 'VariableReference',
		name: parameterPart.key,
	}
}

// TODO: make this more robust
const parsePlural = (pluralPart: PluralPart): Text => {
	return {
		type: "Text",
		value: `{{${[pluralPart.zero, pluralPart.one, pluralPart.two, pluralPart.few, pluralPart.many, pluralPart.other]
			.filter(Boolean)
			.join('|')
			}}}`
	}
}