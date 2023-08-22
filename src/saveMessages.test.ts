import { describe, expect, test } from "vitest"
import { setupEnvironment } from './utils/test.utils.js'
import { saveMessages } from './saveMessages.js'
import type { Message, Pattern } from '@inlang/plugin'
import { globalMetadata } from './loadMessages.js'

describe("saveMessages", () => {
  test("should save all dictionaries", async () => {
    const $fs = await setupEnvironment(false)

    expect($fs.readFile('/example/i18n/en/index.ts')).rejects.toThrow()
    expect($fs.readFile('/example/i18n/de/index.ts')).rejects.toThrow()
    expect($fs.readFile('/example/i18n/it/index.ts')).rejects.toThrow()

    globalMetadata['variable-with-types-and-formatters'] = {
      0: {
        types: ['Date'],
        transforms: [{ name: 'simpleDate' }],
      }
    }

    await saveMessages({
      nodeishFs: $fs, settings: undefined, messages: [
        createMessage('key', {
          en: [{ type: 'Text', value: 'Welcome!' }],
          de: [{ type: 'Text', value: 'Willkommen!' }],
        }),
        createMessage('nested.key', {
          en: [{ type: 'Text', value: 'Hi, this is a simple message' }],
          de: [{ type: 'Text', value: 'Hallo, das ist eine einfache Nachricht' }],
        }),
        createMessage('missing.message.in.de', {
          en: [{ type: 'Text', value: 'Oops' }],
        }),
        createMessage('PLURAL', {
          en: [{ type: 'Text', value: '{{zero|one|two|few|many|other}}' }],
          de: [{ type: 'Text', value: '{{zero|one|two|few|many|other}}' }],
        }),
        createMessage('basic-variable', {
          en: [{ type: 'VariableReference', name: '0' }],
          de: [{ type: 'VariableReference', name: '0' }],
        }),
        createMessage('variable-with-types-and-formatters', {
          en: [{ type: 'VariableReference', name: '0' }],
          de: [{ type: 'VariableReference', name: '0' }],
        }),
      ]
    })

    const fileEn = Buffer.from(await $fs.readFile('/example/i18n/en/index.ts')).toString()
    expect(fileEn).toMatchInlineSnapshot(`
      "import type { BaseTranslation } from '../i18n-types'

      const en: BaseTranslation =    {
         \\"key\\": \\"Welcome!\\",
         \\"nested\\": {
            \\"key\\": \\"Hi, this is a simple message\\"
         },
         \\"missing\\": {
            \\"message\\": {
               \\"in\\": {
                  \\"de\\": \\"Oops\\"
               }
            }
         },
         \\"PLURAL\\": \\"{{zero|one|two|few|many|other}}\\",
         \\"basic-variable\\": \\"{0}\\",
         \\"variable-with-types-and-formatters\\": \\"{0:Date|simpleDate}\\"
      }

      export default en"
    `)

    const fileDe = Buffer.from(await $fs.readFile('/example/i18n/de/index.ts')).toString()
    expect(fileDe).toMatchInlineSnapshot(`
      "import type { Translation } from '../i18n-types'

      const de: Translation =    {
         \\"key\\": \\"Willkommen!\\",
         \\"nested\\": {
            \\"key\\": \\"Hallo, das ist eine einfache Nachricht\\"
         },
         \\"PLURAL\\": \\"{{zero|one|two|few|many|other}}\\",
         \\"basic-variable\\": \\"{0}\\",
         \\"variable-with-types-and-formatters\\": \\"{0|simpleDate}\\"
      }

      export default de"
    `)

    expect($fs.readFile('/example/i18n/it/index.ts')).rejects.toThrow()
  })
})

// ------------------------------------------------------------------------------------------------

const createMessage = (id: string, patterns: Record<string, Pattern>): Message => ({
  id,
  selectors: [],
  variants: Object.entries(patterns)
    .map(([languageTag, patterns]) =>
      ({ languageTag, match: {}, pattern: patterns })
    )
})