import * as module from '../inlang.config.js'
import nodeFs from "node:fs/promises"
import { setupConfig } from '@inlang/core/config'
import { mockEnvironment } from "@inlang/core/test"
import fs from "node:fs/promises"

const env = await mockEnvironment({
	copyDirectory: {
		fs,
		paths: ["./dist", "./example"],
	},
})

await env.$fs.writeFile(
	'./.typesafe-i18n.json',
	await nodeFs.readFile('./.typesafe-i18n.json', { encoding: 'utf-8' })
)

const config = await setupConfig({ module, env })

export const setupEnvironment = async () => {

	return [config, env] as const
}
