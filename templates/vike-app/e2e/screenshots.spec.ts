import { resolve } from "node:path"

import { test } from "@playwright/test"

import { E2E_DIRNAME, PAGE_CATALOG } from "./constants"

for (const { name, path } of PAGE_CATALOG) {
  test(`capture ${name} page screenshot`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" })

    await page.screenshot({
      path: resolve(E2E_DIRNAME, `./screenshots/pages/${name}.png`),
      fullPage: true,
    })
  })
}
