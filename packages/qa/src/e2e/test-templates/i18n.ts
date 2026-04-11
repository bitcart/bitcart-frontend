import { WithLocaleId, getLocaleDisplayName } from "@bitcart/core/utils"
import { expect } from "@playwright/test"

import { LOCALE_SELECTOR_TRIGGER_TESTID, type WithPageCatalog } from "@/common"

import type { E2ETestTemplate, GenericE2ETestTemplate } from "../types"
import {
  clickNavLinkByHref,
  expectNoUncompiledLocaleMessageIds,
  isNotHomepage,
  nonHomepagePath,
  setupUncompiledLocaleMessageTracking,
  waitUntilHydrated,
} from "../utils"

/**
 * The locale selector must be visible and the default locale must be English.
 */
export const testLocaleSelectorVisibilityWithDefaultLocale: E2ETestTemplate = async ({ page }) => {
  await page.goto("/")
  await waitUntilHydrated(page)

  const localeSelectorTrigger = page.getByTestId(LOCALE_SELECTOR_TRIGGER_TESTID)

  await expect(localeSelectorTrigger).toBeVisible()
  await expect(localeSelectorTrigger).toContainText("English")
}

/**
 * Switching to a given locale via the locale selector
 * must update the URL to include the locale prefix.
 */
export const createLocaleSwitchTest: GenericE2ETestTemplate<WithLocaleId> =
  ({ localeId }) =>
  async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    const localeSelectorTrigger = page.getByTestId(LOCALE_SELECTOR_TRIGGER_TESTID)
    const targetLocaleDisplayName = getLocaleDisplayName(localeId)

    await localeSelectorTrigger.click()
    await page.getByRole("menuitem", { name: targetLocaleDisplayName }).click()
    await page.waitForURL(`**/${localeId}*`, { waitUntil: "commit" })
    await expect(localeSelectorTrigger).toHaveText(targetLocaleDisplayName)
    expect(new URL(page.url()).pathname).toBe(`/${localeId}`)
  }

/**
 * The selected locale must persist across page navigation,
 * keeping the URL prefix and locale selector display consistent.
 */
export const createLocalePersistenceTest: GenericE2ETestTemplate<WithLocaleId & WithPageCatalog> =
  ({ localeId, pageCatalog }) =>
  async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    const localeSelectorTrigger = page.getByTestId(LOCALE_SELECTOR_TRIGGER_TESTID)
    const targetLocaleDisplayName = getLocaleDisplayName(localeId)

    await localeSelectorTrigger.click()
    await page.getByRole("menuitem", { name: targetLocaleDisplayName }).click()
    await page.waitForURL(`**/${localeId}*`, { waitUntil: "commit" })

    const nextPagePath = nonHomepagePath({ from: pageCatalog })

    await clickNavLinkByHref(page, `/${localeId}${nextPagePath}`)
    await page.waitForURL(`**/${localeId}${nextPagePath}*`, { waitUntil: "commit" })
    expect(page.url()).toContain(`/${localeId}${nextPagePath}`)

    await expect(localeSelectorTrigger).toHaveText(targetLocaleDisplayName)
  }

/**
 * Every page in the catalog must render pseudo-localized text (accented characters),
 * not raw Lingui message ID hashes that appear when the catalog fails to load.
 * Navigation to each page is performed via the actual nav UI.
 */
export const createPseudoLocalizationRenderTest: GenericE2ETestTemplate<WithPageCatalog> =
  ({ pageCatalog }) =>
  async ({ page }) => {
    await setupUncompiledLocaleMessageTracking(page)
    await page.goto("/pseudo/")
    await waitUntilHydrated(page)
    await expectNoUncompiledLocaleMessageIds(page)

    for (const { path } of pageCatalog.filter(isNotHomepage)) {
      const localizedPath = `/pseudo${path}`

      await clickNavLinkByHref(page, localizedPath)
      await page.waitForURL(`**${localizedPath}*`, { waitUntil: "commit" })
      await waitUntilHydrated(page)
      await expectNoUncompiledLocaleMessageIds(page)
      await page.goto("/pseudo/")
      await waitUntilHydrated(page)
    }
  }
