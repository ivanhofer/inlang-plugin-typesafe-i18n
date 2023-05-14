import { test, expect } from "vitest"
import { parseConfig } from "@inlang/core/config"
import { setupEnvironment } from './test-util.js'

const [config] = await setupEnvironment()

test("inlang's config validation should pass", async () => {
  const [isOk, error] = await parseConfig({ config })
  if (error) {
    throw error
  }
  expect(isOk).toBeTruthy()
})