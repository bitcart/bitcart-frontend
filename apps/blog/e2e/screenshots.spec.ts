import { resolve } from "node:path"

import { test } from "@playwright/test"

import { E2E_DIRNAME, PAGE_CATALOG } from "./constants"

for (const { name, path } of PAGE_CATALOG) {
  test(`capture ${name} screenshot`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" })

    //! A full-page capture never scrolls, so lazy images below the fold would stay blank.
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images, (image) => {
          image.loading = "eager"

          return image.decode().catch(() => undefined)
        }),
      ),
    )

    await page.screenshot({
      path: resolve(E2E_DIRNAME, `./screenshots/pages${path === "/" ? "/index" : path}.png`),
      fullPage: true,
    })
  })
}
