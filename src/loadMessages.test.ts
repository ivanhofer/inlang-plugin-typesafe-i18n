import { describe, test, expect } from "vitest"
import { setupEnvironment } from './utils/test.utils.js'
import { globalMetadata, loadMessages } from './loadMessages.js'

const $fs = await setupEnvironment()

const defaultArgs = { nodeishFs: $fs, options: undefined }

describe("loadMessages", () => {
  test("should not fail if trying to read not present languageTag", async () => {
    expect(() => loadMessages({ ...defaultArgs, languageTags: ['it'] })).not.toThrow()
  })

  describe("should read all resources", async () => {
    const messages = await loadMessages({ ...defaultArgs, languageTags: ['en', 'de'] })

    test("should include all languageTags", async () => {
      for (const message of messages) {
        expect(Object.keys(message.body)).toEqual(['en', 'de'])
      }
    })

    test("should include all messages", async () => {
      expect(messages).toHaveLength(9)
      const foundIds = messages.map(({ id }) => id)
      const idsToBePresent = ['HI', 'PLURAL_FULL', 'nested.PLURAL', 'schedule', 'spectators', 'array.work', 'array.values.0', 'array.values.1', 'array.values.2']
      expect(foundIds).toEqual(idsToBePresent)
    })

    describe("parsing", async () => {
      test("should parse a message correctly", async () => {
        expect(messages.find(({ id }) => id === 'array.work')!.body['en'][0].pattern)
          .toEqual([{
            "type": "Text",
            "value": "too",
          }])
      })

      test("should parse parameters correctly", async () => {
        expect(messages.find(({ id }) => id === 'schedule')!.body['en'][0].pattern)
          .toEqual([
            {
              "type": "VariableReference",
              "name": "0",
            },
          ])
      })

      test("should parse plural rules correctly", async () => {
        expect(messages.find(({ id }) => id === 'PLURAL_FULL')!.body['en'][0].pattern)
          .toEqual([
            {
              "type": "Text",
              "value": "{{zero|one|two|few|many|other}}",
            },
          ])
      })

      test("should set global metadata accordingly", async () => {
        expect(globalMetadata)
          .toMatchInlineSnapshot(`
            {
              "HI": {
                "name": {
                  "optional": false,
                  "transforms": [],
                  "types": [
                    "string",
                  ],
                },
              },
              "PLURAL_FULL": {},
              "array.values.0": {},
              "array.values.1": {},
              "array.values.2": {},
              "array.work": {},
              "nested.PLURAL": {},
              "schedule": {
                "0": {
                  "optional": false,
                  "transforms": [
                    {
                      "kind": "formatter",
                      "name": "simpleDate",
                    },
                  ],
                  "types": [
                    "Date",
                  ],
                },
              },
              "spectators": {
                "0": {
                  "optional": false,
                  "transforms": [],
                  "types": [
                    "string",
                    "number",
                    "boolean",
                  ],
                },
              },
            }
          `)
      })
    })
  })
})
