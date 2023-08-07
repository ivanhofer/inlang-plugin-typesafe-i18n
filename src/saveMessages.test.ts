import { describe, expect, test } from "vitest"
import { setupEnvironment } from './utils/test.utils.js'
import { saveMessages } from './saveMessages.js'
import type { Message, Pattern } from '@inlang/messages'

describe("saveMessages", () => {
  test("should save all dictionaries", async () => {
    const $fs = await setupEnvironment(false)

    expect($fs.readFile('/example/i18n/en/index.ts')).rejects.toThrow()
    expect($fs.readFile('/example/i18n/de/index.ts')).rejects.toThrow()
    expect($fs.readFile('/example/i18n/it/index.ts')).rejects.toThrow()

    // TOD=: test serialization of complex messages
    await saveMessages({
      nodeishFs: $fs, options: undefined, messages: [
        createMessage('test.key', {
          en: [{ type: 'Text', value: 'Hi, this is a simple message' }],
          de: [{ type: 'Text', value: 'Hallo, das ist eine einfache Nachricht' }],
        })]
    })

    const fileEn = Buffer.from(await $fs.readFile('/example/i18n/en/index.ts')).toString()
    expect(fileEn).toMatchInlineSnapshot(`
      "import type { BaseTranslation } from '../i18n-types'

      const en: BaseTranslation = {
      \\"test\\": {
         \\"key\\": \\"Hi, this is a simple message\\"
      }
      }

      export default en"
    `)

    const fileDe = Buffer.from(await $fs.readFile('/example/i18n/de/index.ts')).toString()
    expect(fileDe).toMatchInlineSnapshot(`
      "import type { Translation } from '../i18n-types'

      const de: Translation = {
      \\"test\\": {
         \\"key\\": \\"Hallo, das ist eine einfache Nachricht\\"
      }
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
  body: Object.fromEntries(
    Object.entries(patterns)
      .map(([languageTag, patterns]) =>
        ([languageTag, [{ match: {}, pattern: patterns }]])
      ))
})