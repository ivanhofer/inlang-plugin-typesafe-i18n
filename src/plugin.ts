import type { Plugin } from "@inlang/plugin"
import { loadMessages } from './loadMessages.js'
import { saveMessages } from './saveMessages.js'

export const plugin = {
  meta: {
    id: "ivanhofer.plugin.typesafe-i18n",
    displayName: { en: "typesafe-i18n plugin" },
    description: { en: "A plugin for inlang that uses typesafe-i18n to read and write messages" },
    marketplace: {
      publisherName: 'ivanhofer',
      publisherIcon: 'https://github.com/ivanhofer.png',
      linkToReadme: { en: 'https://github.com/ivanhofer/inlang-plugin-typesafe-i18n#readme' },
      icon: 'https://raw.githubusercontent.com/ivanhofer/typesafe-i18n/main/website/static/launchericon-512-512.png',
      keywords: ["inlang", "plugin", "typesafe-i18n", "TypeScript"],
    }
  },
  loadMessages,
  saveMessages,
} satisfies Plugin
