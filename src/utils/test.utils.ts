import nodeFs from "node:fs/promises"
import { createMockNodeishFs } from "@inlang/plugin/test"
import fs from "node:fs/promises"

export const setupEnvironment = async (copyDictionaries = true) => {
	const $fs = await createMockNodeishFs({
		copyDirectory: {
			fs,
			paths: ["./dist", copyDictionaries && "./example"].filter(Boolean) as string[],
		}
	})

	await $fs.writeFile(
		'./.typesafe-i18n.json',
		await nodeFs.readFile('./.typesafe-i18n.json', { encoding: 'utf-8' })
	)

	return $fs
}
