import { expect } from "@playwright/test"

import type { WithRoute } from "@/common"

import type { GenericE2ETestTemplate } from "../types"
import { waitUntilHydrated } from "../utils"

const LATIN_FONT_FILE_PATTERN = /inter-latin-opsz-normal/
const CYRILLIC_FONT_FILE_PATTERN = /inter-cyrillic-opsz-normal/

/**
 * A page split into `unicode-range` font subsets must preload the Latin file and no other: a
 * preload downloads a subset whether the page's text needs it or not.
 */
export const createLatinFontPreloadTest: GenericE2ETestTemplate<WithRoute> =
  ({ route = "/" } = {}) =>
  async ({ page }) => {
    await page.goto(route)

    const preloads = page.locator('link[rel="preload"][as="font"]')

    await expect(preloads).toHaveCount(1)
    await expect(preloads).toHaveAttribute("href", LATIN_FONT_FILE_PATTERN)
  }

/**
 * A subset other than Latin must stay undownloaded until text needs it, then arrive on demand. The
 * text is injected, so that the test holds without translated catalogs.
 */
export const createNonLatinFontOnDemandTest: GenericE2ETestTemplate<WithRoute> =
  ({ route = "/" } = {}) =>
  async ({ page }) => {
    const fontUrls: string[] = []

    page.on("request", (request) => {
      if (request.resourceType() === "font") fontUrls.push(request.url())
    })

    await page.goto(route)
    await waitUntilHydrated(page)

    expect(fontUrls.some((url) => CYRILLIC_FONT_FILE_PATTERN.test(url))).toBe(false)

    const cyrillicFontResponse = page.waitForResponse(CYRILLIC_FONT_FILE_PATTERN)

    await page.evaluate(() => {
      const paragraph = document.createElement("p")

      paragraph.textContent = "Привет"
      paragraph.style.fontFamily = "InterVariable"
      document.body.append(paragraph)
    })

    expect((await cyrillicFontResponse).ok()).toBe(true)
  }
