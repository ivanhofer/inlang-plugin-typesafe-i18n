import { test, expect } from "vitest"
import { testConfig } from "@inlang/core/test"
import { setupEnvironment } from './test-util.js'

const [config] = await setupEnvironment()

test("inlang's config validation should pass", async () => {
  const [isOk, error] = await testConfig({ config })
  if (error) {
    throw error
  }
  expect(isOk).toBe(true)
})