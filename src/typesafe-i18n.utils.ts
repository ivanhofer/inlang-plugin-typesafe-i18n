import type { NodeishFilesystemSubset } from '@inlang/plugin'
import type { readdir } from "node:fs/promises"

// ------------------------------------------------------------------------------------------------

// TODO: test
export const getDictionaryForLocale = async (
	$fs: NodeishFilesystemSubset,
	outputPath: string,
	locale: string
) => {
	// TODO: create a better, less hacky version
	const baseDictionary = await $fs.readFile(resolve(outputPath, `${locale}/index.ts`), { encoding: "utf-8" }).catch(() => undefined) as string
	if (!baseDictionary) return

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

// ------------------------------------------------------------------------------------------------

export const patchFs = (fs: NodeishFilesystemSubset) => {
	return {
		...fs,
		readdir: async (path: string, options?: Parameters<typeof readdir>[1]) => {
			const result = await fs.readdir(path)
			if (!options?.withFileTypes) return result

			return result.map(name => ({
				name,
				isDirectory: () => !(name.endsWith('.ts') || name.endsWith('.js')),
			}))
		},
		readFile: async (path: string) => {
			const result = await fs.readFile(path)

			return Buffer.from(result as unknown as string).toString()
		},
	} as unknown as NodeishFilesystemSubset
}

// ------------------------------------------------------------------------------------------------

export const resolve = (...parts: string[]): string =>
	parts
		.map((p) => {
			while (p.startsWith("/")) {
				p = p.substring(1)
			}
			while (p.endsWith("/")) {
				p = p.substring(0, p.length - 1)
			}
			return p
		})
		.join("/")
