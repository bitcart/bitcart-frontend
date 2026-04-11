import { expect } from "@playwright/test"

import {
  THEME_TOGGLE_TESTID,
  UI_THEME_ICON_DARK_TESTID,
  UI_THEME_ICON_LIGHT_TESTID,
  UI_THEME_ICON_SYSTEM_TESTID,
  type WithPageCatalog,
} from "@/common"

import type { GenericE2ETestTemplate, E2ETestTemplate } from "../types"
import { getTestIdSelector, nonHomepagePath, waitUntilHydrated } from "../utils"

/**
 * The theme toggle trigger must allow switching between themes in a cycle on every click.
 */
export const themeCycleToggleTest: E2ETestTemplate = async ({ page }) => {
  await page.goto("/")
  await waitUntilHydrated(page)

  const themeToggleTrigger = page.getByTestId(THEME_TOGGLE_TESTID)

  await expect(themeToggleTrigger).toBeVisible()

  await expect(
    themeToggleTrigger.locator(getTestIdSelector(UI_THEME_ICON_SYSTEM_TESTID)),
  ).toBeVisible()

  //* Click to switch from system -> light
  await themeToggleTrigger.click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)

  await expect(
    themeToggleTrigger.locator(getTestIdSelector(UI_THEME_ICON_LIGHT_TESTID)),
  ).toBeVisible()

  //* Click to switch from light -> dark
  await themeToggleTrigger.click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  await expect(
    themeToggleTrigger.locator(getTestIdSelector(UI_THEME_ICON_DARK_TESTID)),
  ).toBeVisible()

  //* Click to switch from dark -> system
  await themeToggleTrigger.click()

  await expect(
    themeToggleTrigger.locator(getTestIdSelector(UI_THEME_ICON_SYSTEM_TESTID)),
  ).toBeVisible()
}

export const createThemePersistenceTest: GenericE2ETestTemplate<WithPageCatalog> =
  ({ pageCatalog }) =>
  async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    const themeToggleTrigger = page.getByTestId(THEME_TOGGLE_TESTID)

    //* Set to light first, then dark (system -> light -> dark)
    await themeToggleTrigger.click()
    await themeToggleTrigger.click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    //* Navigate to a different page
    await page.goto(nonHomepagePath({ from: pageCatalog }))
    await waitUntilHydrated(page)
    await expect(page.locator("html")).toHaveClass(/dark/)
  }
