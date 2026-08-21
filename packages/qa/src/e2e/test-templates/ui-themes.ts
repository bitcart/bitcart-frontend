import { expect } from "@playwright/test"

import {
  UI_THEME_TOGGLE_TESTID,
  UI_THEME_ICON_DARK_TESTID,
  UI_THEME_ICON_LIGHT_TESTID,
  UI_THEME_ICON_SYSTEM_TESTID,
  type WithPageCatalog,
  UI_THEME_MOBILE_TOGGLE_TESTID,
} from "@/common"

import type { GenericE2ETestTemplate, E2ETestTemplate } from "../types"
import { getTestIdSelector, nonHomepagePath, waitUntilHydrated } from "../utils"

/**
 * The theme toggle trigger must allow switching between themes in a cycle on every click.
 */
export const themeCycleToggleTest: E2ETestTemplate = async ({ page }) => {
  await page.goto("/")
  await waitUntilHydrated(page)

  const themeToggleTrigger = page
    .getByTestId(UI_THEME_TOGGLE_TESTID)
    .or(page.getByTestId(UI_THEME_MOBILE_TOGGLE_TESTID))

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

/**
 * A theme value the app does not recognize must not wedge the UI.
 *
 * Every app on an origin persists under the same `theme` key, and next-themes applies whatever
 * it finds there verbatim as a class on `<html>`, making a stale or foreign value leak into the
 * document class with no stylesheet to back it and a toggle that no longer responded to clicks.
 */
export const foreignThemeRecoveryTest: E2ETestTemplate = async ({ page }) => {
  //* "dark mode" carries whitespace, which `classList.add` rejects. Left unrepaired it throws
  //* inside next-themes' apply effect and aborts hydration, `waitUntilHydrated` covers it.
  const FOREIGN_THEMES = ["auto", "dark mode"]

  for (const foreignTheme of FOREIGN_THEMES) {
    await page.goto("/")
    await page.evaluate((theme) => localStorage.setItem("theme", theme), foreignTheme)
    await page.reload()
    await waitUntilHydrated(page)

    const themeToggleTrigger = page
      .getByTestId(UI_THEME_TOGGLE_TESTID)
      .or(page.getByTestId(UI_THEME_MOBILE_TOGGLE_TESTID))

    //* The foreign value is discarded
    await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBe("system")

    //* ...and the toggle responds to clicks again
    await themeToggleTrigger.click()

    await expect(
      themeToggleTrigger.locator(getTestIdSelector(UI_THEME_ICON_LIGHT_TESTID)),
    ).toBeVisible()

    await expect(page.locator("html")).not.toHaveClass(/dark/)
  }
}

export const createThemePersistenceTest: GenericE2ETestTemplate<WithPageCatalog> =
  ({ pageCatalog }) =>
  async ({ page }) => {
    await page.goto("/")
    await waitUntilHydrated(page)

    const themeToggleTrigger = page.getByTestId(UI_THEME_TOGGLE_TESTID)

    //* Set to light first, then dark (system -> light -> dark)
    await themeToggleTrigger.click()

    await expect(
      themeToggleTrigger.locator(getTestIdSelector(UI_THEME_ICON_LIGHT_TESTID)),
    ).toBeVisible()

    await themeToggleTrigger.click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    //* Navigate to a different page
    await page.goto(nonHomepagePath({ from: pageCatalog }))
    await waitUntilHydrated(page)
    await expect(page.locator("html")).toHaveClass(/dark/)
  }
