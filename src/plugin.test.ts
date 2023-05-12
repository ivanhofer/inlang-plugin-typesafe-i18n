import * as module from '../example/inlang.config.js'
import { describe, test, expect } from "vitest"
import nodeFs from "node:fs"
import { fs as memfs } from "memfs"
import { query } from "@inlang/core/query"
import { setupConfig, type InlangConfig } from '@inlang/core/config'
import { initialize$import, type InlangEnvironment } from '@inlang/core/environment'
import type { Resource } from '@inlang/core/ast'

const env = await initializeTestEnvironment()
const config = (await setupConfig({ module: module, env })) as InlangConfig

import { mockEnvironment, testConfig } from "@inlang/core/test"
import fs from "node:fs/promises"

test("inlang's config validation should pass", async () => {
  const env = await mockEnvironment({
    copyDirectory: {
      fs: fs,
      paths: ["./dist", "./example"],
    },
  })

  const config = await setupConfig({ module, env })

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
      expect(message?.pattern.elements[0].value).toBe(
        "Hi {name:string}! Please leave a star if you like this project: https://github.com/ivanhofer/typesafe-i18n"
      )
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
              elements: [{ type: "Text", value: "Newly created message" }],
            },
          },
        })
      const updatedResources = [
        ...resources.filter(
          (resource) =>
            resource.languageTag.name !== config.referenceLanguage
        ),
        updatedReferenceResource as Resource,
      ]
      await config.writeResources({ config, resources: updatedResources })
      const module =
        (await env.$fs.readFile(
          `./example/i18n/${config.referenceLanguage}/index.ts`,
          { encoding: "utf-8" }
        )) as string
      expect(module.includes('"new-message": "Newly created message"')).toBeTruthy()
    })
  })
})

/**
 * Initializes the environment.
 *
 * Copies files in /dist and /example to the in-memory file system.
 */
async function initializeTestEnvironment(): Promise<InlangEnvironment> {
  const $fs = memfs.promises as any

  // change the working directory to the inlang config directory to resolve relative paths
  process.cwd = () => "/example"
  const $import = initialize$import({
    fs: $fs,
    fetch,
  })

  const env = {
    $fs,
    $import,
  }

  const copyDirectory = async (path: string) => {
    // create directory
    await $fs.mkdir(path, { recursive: true })

    for (const file of await nodeFs.promises.readdir("./" + path)) {
      const isFile = file.indexOf('.') > -1
      if (isFile) {
        await $fs.writeFile(
          `${path}/${file}`,
          await nodeFs.promises.readFile(`./${path}/${file}`, "utf-8"),
          { encoding: "utf-8" }
        )
      } else {
        await copyDirectory(`${path}/${file}`)
      }
    }
  }

  // only /dist and /example are needed and therefore copied
  for (const path of ["/dist", "/example"]) {
    await copyDirectory(path)
  }

  return env
}
