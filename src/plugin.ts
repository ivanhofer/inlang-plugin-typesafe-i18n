import { getLocaleInformation } from "typesafe-i18n/config"
import { createPlugin } from "@inlang/core/plugin"
import { readResources } from './readResources.js'
import { writeResources } from './writeResources.js'
import { patchFs } from './utils.js'

// issues:
//  - real typescript compilation does not work

export const plugin = createPlugin(({ env }) => ({
  id: "ivanhofer.inlang-plugin-typesafe-i18n",
  async config() {
    // @ts-expect-error - the types slightly differ; should work regardless
    const { base, locales } = await getLocaleInformation(patchFs(env.$fs))

    return {
      referenceLanguage: base,
      languages: locales,
      readResources: ({ config }) => readResources({ config, ...env }),
      writeResources: ({ config, resources }) => writeResources({ config, resources, ...env }),
    }
  },
}))
