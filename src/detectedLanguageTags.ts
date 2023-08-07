import type { Plugin } from "@inlang/plugin"
import { patchFs } from './utils/typesafe-i18n.utils.js'
import { getLocaleInformation } from 'typesafe-i18n/config'

export const detectedLanguageTags = (async ({ nodeishFs }) => {
	// @ts-expect-error - the types slightly differ; should work regardless
	const { locales } = await getLocaleInformation(patchFs(nodeishFs))

	return locales

}) satisfies Plugin['detectedLanguageTags']
