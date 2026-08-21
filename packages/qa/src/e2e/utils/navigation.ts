import { readdirSync } from "node:fs"
import { join, relative, sep } from "node:path"

import { expect, type Page } from "@playwright/test"

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

/**
 * Window flag that distinguishes a client-side (SPA) transition,
 * which keeps the flag, from a full document reload, which wipes it.
 */
const CLIENT_NAVIGATION_SENTINEL_KEY = "__clientNavigationSentinel"

const ROUTE_FILE_EXTENSION_PATTERN = /\.[jt]sx?$/

export const getLinkHrefSelector = (href: string): string => `a[href="${href}"]`

/**
 * Marks `window` so a later check can distinguish a client-side (SPA)
 * transition from a full document reload. Set this after the initial load and
 * before triggering the navigation under test, then assert with
 * {@link expectClientSideNavigation} once the destination has loaded.
 */
export const markClientNavigationSentinel = (page: Page): Promise<void> =>
  page.evaluate((key) => {
    const globalScope = window as unknown as Record<string, unknown>

    globalScope[key] = true
  }, CLIENT_NAVIGATION_SENTINEL_KEY)

/**
 * Asserts that the most recent navigation was client-side, i.e. the sentinel
 * set by {@link markClientNavigationSentinel} survived (a full reload would
 * have wiped it).
 */
export const expectClientSideNavigation = async (page: Page): Promise<void> => {
  const wasClientSide = await page.evaluate(
    (key) => (window as unknown as Record<string, unknown>)[key] === true,
    CLIENT_NAVIGATION_SENTINEL_KEY,
  )

  expect(wasClientSide, "Expected a client-side navigation, but the page fully reloaded").toBe(true)
}

const isRouteGroupSegment = (segment: string): boolean =>
  segment.startsWith("(") && segment.endsWith(")")

/**
 * Derives a {@link PageRegistryEntry} from a Vike page file, whose route comes
 * from the directories above it (the file name itself is always the same).
 *
 * Returns `null` for pages under a private directory (e.g. `_error`, `_layout`).
 */
const deriveVikePageEntry = (pageSubdirPath: string): PageRegistryEntry | null => {
  const segments = pageSubdirPath ? pageSubdirPath.split(sep) : []

  //* Skip private directories (e.g. _error, _layout)
  if (segments.some((s) => s.startsWith("_"))) return null

  const path = segments.length === 0 || segments[0] === "index" ? "/" : `/${segments.join("/")}`

  return { path, name: segments.at(-1) ?? "/" }
}

/**
 * Derives a {@link PageRegistryEntry} from a TanStack Router route file, whose
 * route comes from the file's own path under the routes directory.
 *
 * Returns `null` for files that describe no navigable URL of their own: the root
 * route, `-` prefixed (excluded) files and directories, `.lazy` companions,
 * dynamic/splat segments, and bare layout routes.
 */
const deriveTanStackRouterPageEntry = (routeFilePath: string): PageRegistryEntry | null => {
  const rawSegments = routeFilePath
    .replace(ROUTE_FILE_EXTENSION_PATTERN, "")
    .split(sep)
    .flatMap((segment) => segment.split("."))

  const lastRawSegment = rawSegments.at(-1) ?? ""

  //* The root route wraps every match instead of owning a URL, `-` prefixed files and
  //* directories are kept out of the route tree entirely, and dynamic (`$postId`) or
  //* splat (`$`) segments have no URL that can be visited as-is
  const isOutsideRouteTree = rawSegments.some(
    (s) => s === "__root" || s.startsWith("-") || s.includes("$"),
  )

  //* `.lazy` companions re-declare a route their critical file already covers, while
  //* pathless layouts (`_auth`) and route groups (`(marketing)`) only wrap children
  const isWrapperOnly =
    lastRawSegment === "lazy" ||
    lastRawSegment.startsWith("_") ||
    isRouteGroupSegment(lastRawSegment)

  if (isOutsideRouteTree || isWrapperOnly) return null

  //* `index` and `route` files resolve to the path of their parent, and pathless
  //* layouts and route groups leave no trace in the URL
  const segments = rawSegments.filter(
    (segment, index) =>
      !(index === rawSegments.length - 1 && (segment === "index" || segment === "route")) &&
      !segment.startsWith("_") &&
      !isRouteGroupSegment(segment),
  )

  const path = segments.length === 0 ? "/" : `/${segments.join("/")}`

  return { path, name: segments.at(-1) ?? lastRawSegment }
}

/**
 * Scans a pages directory and builds a {@link PageRegistry} from the filesystem,
 * deriving each route path the way the app's file-routing convention does.
 *
 * With the default `vike` convention, paths come from the directory structure
 * and directories prefixed with `_` are excluded. With `tanstack-router`, paths
 * come from the route file's own path and only navigable leaf routes are kept.
 */
export const createPageRegistry = (params: PageRegistryParams): PageRegistry => {
  const { pagesSrcDir, convention = "vike" } = params
  const pageFileName = params.pageFileName ?? ROUTE_FILE_EXTENSION_PATTERN

  const isMatch: (name: string) => boolean =
    typeof pageFileName === "string"
      ? (name) => name === pageFileName
      : (name) => pageFileName.test(name)

  const registry: PageRegistry = {}

  for (const entry of readdirSync(pagesSrcDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !isMatch(entry.name)) continue

    const pageSubdirPath = relative(pagesSrcDir, entry.parentPath)

    const pageEntry =
      convention === "tanstack-router"
        ? deriveTanStackRouterPageEntry(join(pageSubdirPath, entry.name))
        : deriveVikePageEntry(pageSubdirPath)

    if (pageEntry) {
      registry[pageEntry.path] = pageEntry
    }
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
