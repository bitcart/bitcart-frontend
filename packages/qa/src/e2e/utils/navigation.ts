import { readdirSync } from "node:fs"
import { relative, sep } from "node:path"

import type { Page } from "@playwright/test"

import {
  MOBILE_MENU_CONTENT_TESTID,
  MOBILE_MENU_TOGGLE_TESTID,
  NAVBAR_TESTID,
  NAV_DROPDOWN_CONTENT_TESTID,
  NAV_DROPDOWN_TOGGLE_TESTID,
  type PageRegistryParams,
  type PageRegistry,
  type PageRegistryEntry,
  type PageCatalog,
} from "@/common"

export const getLinkHrefSelector = (href: string): string => `a[href="${href}"]`

/**
 * Scans a pages directory and builds a {@link PageRegistry} from the
 * filesystem, deriving route paths from directory structure and names from
 * the immediate parent directory of each matched page file.
 *
 * Directories prefixed with `_` are excluded.
 */
export const createPageRegistry = ({
  pagesSrcDir,
  pageFileName,
}: PageRegistryParams): PageRegistry => {
  const isMatch: (name: string) => boolean =
    typeof pageFileName === "string"
      ? (name) => name === pageFileName
      : (name) => pageFileName.test(name)

  const registry: PageRegistry = {}

  for (const entry of readdirSync(pagesSrcDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !isMatch(entry.name)) continue

    const pageSubdirPath = relative(pagesSrcDir, entry.parentPath)
    const pageSubdirPathSegments = pageSubdirPath ? pageSubdirPath.split(sep) : []

    //* Skip private directories (e.g. _error, _layout)
    if (pageSubdirPathSegments.some((s) => s.startsWith("_"))) continue

    const path =
      pageSubdirPathSegments.length === 0 || pageSubdirPathSegments[0] === "index"
        ? "/"
        : `/${pageSubdirPathSegments.join("/")}`

    registry[path] = { path, name: pageSubdirPathSegments.at(-1) ?? "/" }
  }

  return registry
}

export const isNotHomepage = ({ path }: PageRegistryEntry) => path !== "/"

/**
 * Returns the path of the first non-index page in the catalog.
 *
 * If no non-index pages are found, returns `"/404"`.
 */
export const nonHomepagePath = ({ from: pageCatalog }: { from: PageCatalog }): string =>
  pageCatalog.find(isNotHomepage)?.path ?? "/404"

/**
 * Clicks a link by its `href`, preferring nav UI for the current viewport
 * (mobile menu → desktop nav bar → desktop overflow dropdown).
 * If the link is absent from the nav, falls back to the first matching link on the page.
 */
export const clickNavLinkByHref = async (page: Page, href: string): Promise<void> => {
  const mobileToggle = page.getByTestId(MOBILE_MENU_TOGGLE_TESTID)

  if (await mobileToggle.isVisible()) {
    const mobileMenu = page.getByTestId(MOBILE_MENU_CONTENT_TESTID)

    if (!(await mobileMenu.isVisible())) {
      await mobileToggle.click()
    }

    await mobileMenu.locator(getLinkHrefSelector(href)).click()
  } else {
    const navBarLink = page.getByTestId(NAVBAR_TESTID).locator(getLinkHrefSelector(href))

    if (await navBarLink.isVisible()) {
      await navBarLink.click()
    } else {
      //* Check page content first, as opening the dropdown
      //* creates an inert overlay that blocks other clicks
      const pageLink = page.locator(getLinkHrefSelector(href))

      if ((await pageLink.count()) > 0) {
        await pageLink.first().click()
      } else {
        const dropdownTrigger = page.getByTestId(NAV_DROPDOWN_TOGGLE_TESTID)

        if (await dropdownTrigger.isVisible()) {
          await dropdownTrigger.click()

          const dropdownContent = page.getByTestId(NAV_DROPDOWN_CONTENT_TESTID)

          await dropdownContent.waitFor({ state: "visible" })

          const dropdownLink = dropdownContent.locator(getLinkHrefSelector(href))

          if ((await dropdownLink.count()) > 0) {
            await dropdownLink.click()
          } else {
            //* Not found anywhere — fall back to direct navigation
            await page.goto(href)
          }
        }
      }
    }
  }
}
