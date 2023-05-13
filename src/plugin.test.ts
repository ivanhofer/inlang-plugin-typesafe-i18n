import * as module from '../inlang.config.js'
import { describe, test, expect } from "vitest"
import nodeFs from "node:fs/promises"
import { query } from "@inlang/core/query"
import { setupConfig } from '@inlang/core/config'
import type { Placeholder, Resource } from '@inlang/core/ast'
import { mockEnvironment, testConfig } from "@inlang/core/test"
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

test("inlang's config validation should pass", async () => {
  const [isOk, error] = await testConfig({ config })
  if (error) {
    throw error
  }
  expect(isOk).toBe(true)
})

describe("plugin", async () => {
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

  describe("writeResources()", async () => {
    test("should serialize the resources", async () => {
      const [updatedReferenceResource] = query(referenceResource)
        .create({
          message: {
            id: { type: "Identifier", name: "new-message" },
            type: "Message",
            pattern: {
              type: "Pattern",
              elements: [
                { type: "Text", value: "Newly created message with " },
                { type: "Placeholder", body: { type: 'VariableReference', name: "variable" } },
                { type: "Text", value: "!" },
              ],
            },
          },
        })
      const updatedResources = [updatedReferenceResource as Resource]
      await config.writeResources({ config, resources: updatedResources })
      const module =
        (await env.$fs.readFile(
          `./example/i18n/${config.referenceLanguage}/index.ts`,
          { encoding: "utf-8" }
        )) as string

      expect(module.includes('"new-message": "Newly created message with {variable}!"')).toBeTruthy()
    })

    test("should serialize a nested resource", async () => {
      const [updatedReferenceResource] = query(referenceResource)
        .create({
          message: {
            id: { type: "Identifier", name: "nested.plural.message" },
            type: "Message",
            pattern: {
              type: "Pattern",
              elements: [
                { type: "Text", value: "{{Banane|Bananen}}" },
              ],
            },
          },
        })
      const updatedResources = [updatedReferenceResource as Resource]
      await config.writeResources({ config, resources: updatedResources })
      const module =
        (await env.$fs.readFile(
          `./example/i18n/${config.referenceLanguage}/index.ts`,
          { encoding: "utf-8" }
        )) as string

      expect(module.includes('"nested": {')).toBeTruthy()
      expect(module.includes('"plural": {')).toBeTruthy()
      expect(module.includes('message": "{{Banane|Bananen}}"')).toBeTruthy()
    })
  })
})
