import { createNoConsoleMessagesTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

test.describe("Blog: Console hygiene", () => {
  for (const { name, path } of PAGE_CATALOG) {
    test(`no console errors or warnings on ${name}`, createNoConsoleMessagesTest({ path }))
  }
})
