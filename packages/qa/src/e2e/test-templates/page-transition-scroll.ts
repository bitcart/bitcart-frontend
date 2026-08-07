import { expect } from "@playwright/test"

import type { GenericE2ETestTemplate } from "../types"
import {
  clickNavLinkByHref,
  expectClientSideNavigation,
  markClientNavigationSentinel,
  waitUntilHydrated,
} from "../utils"

const SCROLL_SETTLE_TIMEOUT_MS = 10_000

/**
 * Tolerance, in CSS pixels, for "scrolled to the top":
 * sub-pixel residue can remain after a smooth scroll lands.
 */
const SCROLL_TOP_TOLERANCE_PX = 2

/**
 * Needed to resolve relative hrefs without depending on the test's base URL.
 */
const HREF_RESOLUTION_BASE = "http://localhost"

export interface ScrollResetOnNavigationParams {
  /**
   * Path of the page to start on. Must be tall enough to scroll vertically.
   */
  fromPath: string

  /**
   * Cross-pathname nav link href to click. Must not contain a hash.
   */
  toLinkHref: string
}

export interface ScrollToHashOnNavigationParams {
  /**
   * Path of the page to start on. Its pathname must differ from
   * {@link toLinkHref}'s so the click is a real cross-page transition.
   */
  fromPath: string

  /**
   * Cross-pathname nav link href ending in a hash fragment. The fragment must
   * target an element id that sits beyond the initial viewport on the
   * destination page (only visible after scrolling), so scrolling to it is
   * observable.
   */
  toLinkHref: string
}

/**
 * Asserts that a client-side (SPA) navigation to a different pathname, with no
 * hash, leaves the destination page scrolled back to the top.
 */
export const createScrollResetOnNavigationTest: GenericE2ETestTemplate<
  ScrollResetOnNavigationParams
> =
  ({ fromPath, toLinkHref }) =>
  async ({ page }) => {
    const { pathname: toPathname } = new URL(toLinkHref, HREF_RESOLUTION_BASE)

    await page.goto(fromPath)
    await waitUntilHydrated(page)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await markClientNavigationSentinel(page)
    await clickNavLinkByHref(page, toLinkHref)
    await page.waitForURL((url) => url.pathname === toPathname)
    await expectClientSideNavigation(page)

    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: SCROLL_SETTLE_TIMEOUT_MS })
      .toBeLessThanOrEqual(SCROLL_TOP_TOLERANCE_PX)
  }

/**
 * Asserts that a client-side (SPA) navigation to a different pathname, with a
 * hash, scrolls the destination page to the anchor named by that hash.
 */
export const createScrollToHashOnNavigationTest: GenericE2ETestTemplate<
  ScrollToHashOnNavigationParams
> =
  ({ fromPath, toLinkHref }) =>
  async ({ page }) => {
    const { pathname: toPathname, hash: anchorHash } = new URL(toLinkHref, HREF_RESOLUTION_BASE)
    const anchorId = anchorHash.slice(1)

    await page.goto(fromPath)
    await waitUntilHydrated(page)
    await markClientNavigationSentinel(page)
    await clickNavLinkByHref(page, toLinkHref)
    await page.waitForURL((url) => url.pathname === toPathname && url.hash === anchorHash)
    await expectClientSideNavigation(page)

    //* The anchor sits beyond the initial viewport, so it can only be in view
    //* if the navigation scrolled to it.
    await expect(page.locator(`#${anchorId}`)).toBeInViewport()

    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: SCROLL_SETTLE_TIMEOUT_MS })
      .toBeGreaterThan(0)
  }
