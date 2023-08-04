// import type { InlangConfig } from "@inlang/core/config"
// import type { InlangEnvironment } from "@inlang/core/environment"
// import type * as ast from "@inlang/core/ast"
// import { getConfig } from "typesafe-i18n/config"
// import { patchFs, resolve } from './utils.js'

// type WriteResourcesArgs = Parameters<InlangConfig["writeResources"]>[0] &
// 	InlangEnvironment

// export async function writeResources({
// 	$fs: rawFs,
// 	config,
// 	resources,
// }: WriteResourcesArgs): ReturnType<InlangConfig["writeResources"]> {
// 	const $fs = patchFs(rawFs)

// 	// @ts-expect-error - the types slightly differ; should work regardless
// 	const typesafeI18nConfig = await getConfig($fs)

// 	for (const resource of resources) {
// 		const locale = resource.languageTag.name
// 		const isReferenceLanguage = locale === config.referenceLanguage
// 		const dictionary = serializeResource(resource, isReferenceLanguage)

// 		const type = isReferenceLanguage ? "BaseTranslation" : "Translation"
// 		// TODO: path could be wrong if esmImports=true
// 		// TODO: write correct path for namespaces
// 		// TODO: export utility type from `typesafe-i18n` to get correct string e.g. with `satisfies`
// 		const template = `import type { ${type} } from '../${typesafeI18nConfig.typesFileName}'
// const ${locale}: ${type} = ${dictionary}

// export default ${locale}`

// 		await $fs.writeFile(
// 			resolve(typesafeI18nConfig.outputPath, `${locale}/index.ts`),
// 			template
// 		)
// 	}
// }

// const serializeResource = (resource: ast.Resource, isReferenceLanguage: boolean): string => {
// 	const json = {} as Record<string, any>

// 	resource.body.map((message) => serializeMessage(message, isReferenceLanguage)).forEach(([id, value]) => {
// 		const idParts = id.split('.')
// 		let current = json
// 		for (let i = 0; i < idParts.length; i++) {
// 			const part = idParts[i]
// 			if (i === idParts.length - 1) {
// 				current[part] = value
// 			} else {
// 				if (!current[part]) current[part] = {}
// 				current = current[part]
// 			}
// 		}
// 	})
// 	// stringify the object with beautification
// 	return JSON.stringify(json, null, 3)
// }

// const serializeMessage = (message: ast.Message, isReferenceLanguage: boolean): [id: string, value: string] => {
// 	return [message.id.name, serializePattern(message.pattern, isReferenceLanguage)]
// }

// const serializePattern = (pattern: ast.Pattern, isReferenceLanguage: boolean): string => {
// 	return pattern.elements.map((patternElement) => serializePatternElement(patternElement, isReferenceLanguage)).join("")
// }

// const serializePatternElement = (
// 	element: ast.Pattern["elements"][number],
// 	isReferenceLanguage: boolean
// ): string => {
// 	switch (element.type) {
// 		case "Text":
// 			return element.value
// 		case "Placeholder":
// 			return serializePlaceholder(element, isReferenceLanguage)
// 	}
// }

// const serializePlaceholder = ({ body: { name, metadata = {} } }: ast.Placeholder, isReferenceLanguage: boolean): string => {
// 	let str = name
// 	if (isReferenceLanguage) {
// 		if (metadata.optional) str += "?"
// 		if (metadata.types?.length > 0) {
// 			if (!(metadata.types.length === 3
// 				&& metadata.types.includes("string")
// 				&& metadata.types.includes("number")
// 				&& metadata.types.includes("boolean"))
// 			) {
// 				str += `:${metadata.types[0]}`
// 			}
// 		}
// 	}
// 	if (metadata.transforms?.length > 0) {
// 		str += `|${metadata.transforms.map(({ name }: any) => name).join("|")}`
// 	}
// 	return `{${str}}`
// }