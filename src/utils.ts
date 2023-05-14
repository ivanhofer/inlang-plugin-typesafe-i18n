import type { InlangEnvironment } from '@inlang/core/environment'
import type { readdir } from "node:fs/promises"

export const patchFs = (fs: InlangEnvironment["$fs"]) => {
	return {
		...fs,
		readdir: async (path: string, options?: Parameters<typeof readdir>[1]) => {
			const result = await fs.readdir(path)
			if (!options?.withFileTypes) return result

			return result.map(name => ({
				name,
				isDirectory: () => !(name.endsWith('.ts') || name.endsWith('.js')),
			}))
		}
	} as unknown as InlangEnvironment["$fs"]
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

