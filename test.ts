import { initialize$import } from '@inlang/core/environment'
import * as module from './inlang.config.js'
import { setupConfig, type InlangConfig } from '@inlang/core/config'
import fs from "node:fs/promises"

const $import = initialize$import({
  fs,
  fetch,
})


const env = {
  $fs: fs,
  $import,
}

const config = (await setupConfig({ module: module, env })) as InlangConfig
console.log(1, config);

const resources = await config.readResources({ config })

console.log(11, resources);
