import type { Plugin } from "@inlang/plugin"
import { loadMessages } from './loadMessages.js'
import { saveMessages } from './saveMessages.js'

export const plugin = {
  meta: {
    id: "ivanhofer.inlang-plugin-typesafe-i18n",
    displayName: { en: "typesafe-i18n plugin" },
    description: { en: "A plugin for inlang that uses typesafe-i18n to read and write messages" },
    keywords: ["inlang", "plugin", "typesafe-i18n", "TypeScript"],
  },
  loadMessages,
  saveMessages,
} satisfies Plugin
