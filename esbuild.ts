/**
 * This is the build script for the project.
 *
 * It takes the source code and bundles it into a single file
 * that can be imported into an inlang project.
 */

import { context } from 'esbuild'
import { pluginBuildConfig } from "@inlang/plugin"

const isDev = !!process.env.DEV

const options = await pluginBuildConfig({
	entryPoints: ["./src/index.js"],
	outfile: "./dist/index.js",
	minify: !isDev,
	sourcemap: true,
	plugins: [
		{
			name: "logger",
			setup: ({ onEnd }) => onEnd(() => console.info("🎉 changes processed")),
		},
	],
})

const ctx = await context(options)

if (isDev) {
	await ctx.watch()
	console.info("👀 watching for changes...")
	process.on('exit', async () => {
		console.info('🙈 process killed')
		await ctx.dispose()
	})
} else {
	await ctx.rebuild()
	console.info("✅ build complete")
	await ctx.dispose()
}
