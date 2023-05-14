import { describe, test, expect } from "vitest"
import { query } from "@inlang/core/query"
import type { Placeholder } from '@inlang/core/ast'
import { setupEnvironment } from './test-util.js'

const [config] = await setupEnvironment()

const resources = await config.readResources({ config })

const referenceResource = resources.find(
  (resource) => resource.languageTag.name === config.referenceLanguage
)!

describe("readResources()", async () => {
  test("should return an array of resources that matches config.languages", () => {
    expect(resources.length).toBe(config.languages.length)
    for (const resource of resources) {
      expect(config.languages.includes(resource.languageTag.name))
    }
  })

  test("should be possible to query a message", () => {
    const message = query(referenceResource).get({ id: "HI" })
    expect(message).toBeDefined()
    expect(message!.pattern.elements[0].value).toBe("Hi ")
    expect((message!.pattern.elements[1].body as Placeholder)!.name).toBe(
      "name"
    )
    expect(message!.pattern.elements[2].value).toBe(
      "! Please leave a star if you like this project: https://github.com/ivanhofer/typesafe-i18n"
    )
  })

  test("should be possible to query a message with plural part", () => {
    const message = query(referenceResource).get({ id: "PLURAL_FULL" })
    expect(message).toBeDefined()
    expect(message!.pattern.elements[0].value).toBe("{{zero|one|two|few|many|other}}")
  })

  test("should be possible to query a nested message with plural part", () => {
    const message = query(referenceResource).get({ id: "nested.PLURAL" })
    expect(message).toBeDefined()
    expect(message!.pattern.elements[0].value).toBe("hello banana")
    expect(message!.pattern.elements[1].value).toBe("{{s}}")
  })
})
