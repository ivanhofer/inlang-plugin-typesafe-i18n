import { describe, test, expect } from "vitest"
import { query } from "@inlang/core/query"
import type { Resource } from '@inlang/core/ast'
import { setupEnvironment } from './test-util.js'

const [config, env] = await setupEnvironment()

const resources = await config.readResources({ config })

const referenceResource = resources.find(
  (resource) => resource.languageTag.name === config.referenceLanguage
)!

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
