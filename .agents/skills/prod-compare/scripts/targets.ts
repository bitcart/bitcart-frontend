//* What the comparison covers. Edit this file when pages, interactive states or checkout steps change.

import type { Locator, Page } from "@playwright/test"

export type Mode = "light" | "dark"
export type Site = "prod" | "local"
export type ViewportName = keyof typeof VIEWPORTS
export type Clip = { x: number; y: number; width: number; height: number }

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

export const APPS = {
  landing: {
    title: "Landing",
    prod: "https://bitcart.ai",
    local: "http://localhost:3000",
    pages: ["/", "/coins", "/support-us", "/plugins/privacy", "/plugins/tos", "/no-such-page"],
  },

  directory: {
    title: "Directory",
    prod: "https://directory.bitcart.ai",
    local: "http://localhost:3001",
    pages: ["/", "/submit", "/no-such-page"],
  },
}

export type AppId = keyof typeof APPS

export const pageSlug = (path: string) =>
  path === "/" ? "index" : path.slice(1).replaceAll("/", "_")

//! Testnet runs the checkout that production merchants get, against the same backend the local
//! preview uses, so one invoice id opens on both.
export const CHECKOUT = {
  prod: "https://testnet.bitcart.ai/i/",
  local: "http://localhost:3002/i/",
}

export const CHECKOUT_STEPS = {
  email: [
    { name: "1-email", title: "Email step" },
    { name: "2-email-focus", title: "Email field focused" },
    { name: "3-email-invalid", title: "Invalid email" },
  ],

  payment: [
    { name: "4-methods", title: "Choose how to pay" },
    { name: "5-method-hover", title: "BTC hovered" },
    { name: "6-pay", title: "Paying with BTC" },
  ],
}

export type CheckoutPhase = keyof typeof CHECKOUT_STEPS

export type InteractiveState = {
  app: AppId
  path: string
  name: string
  title: string
  viewports?: ViewportName[]
  run: (page: Page) => Promise<Clip | undefined>
}

const clipAround = async (page: Page, locator: Locator, pad: { x: number; y: number }) => {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error(`Nothing to clip: ${String(locator)}`)
  } else {
    const viewport = page.viewportSize() ?? VIEWPORTS.desktop
    const x = Math.max(0, box.x - pad.x)
    const y = Math.max(0, box.y - pad.y)

    return {
      x,
      y,
      width: Math.min(viewport.width - x, box.width + pad.x * 2),
      height: Math.min(viewport.height - y, box.height + pad.y * 2),
    }
  }
}

const settle = (page: Page, ms = 400) => page.waitForTimeout(ms)
const filtersButton = (page: Page) => page.getByRole("button", { name: "Filters", exact: true })
const ethereumRow = (page: Page) => page.getByRole("button", { name: /Ethereum/ }).first()

const expandEthereum = async (page: Page) => {
  const row = ethereumRow(page)
  await row.click()
  await settle(page, 900)
  await row.evaluate((element) => element.scrollIntoView({ block: "start" }))
  await page.evaluate(() => window.scrollBy(0, -90))
  await settle(page, 500)
}

export const STATES: InteractiveState[] = [
  {
    app: "directory",
    path: "/",
    name: "filters-hover",
    title: "Directory Filters button, hovered",

    run: async (page) => {
      await filtersButton(page).hover()
      await settle(page)

      return clipAround(page, filtersButton(page), { x: 360, y: 40 })
    },
  },

  {
    app: "directory",
    path: "/",
    name: "filters-focus",
    title: "Directory Filters button, keyboard focus",

    run: async (page) => {
      await filtersButton(page).focus()
      await settle(page)

      return clipAround(page, filtersButton(page), { x: 360, y: 40 })
    },
  },

  {
    app: "directory",
    path: "/",
    name: "filters-open",
    title: "Filters popover and mobile drawer",

    run: async (page) => {
      await filtersButton(page).click()
      await settle(page, 900)

      return undefined
    },
  },

  {
    app: "directory",
    path: "/",
    name: "filters-option-hover",
    title: "Filters popover, hovered row",
    viewports: ["desktop"],

    run: async (page) => {
      await filtersButton(page).click()
      await settle(page, 900)

      await page
        .getByRole("button", { name: /^Hosts\b/ })
        .first()
        .hover()

      await settle(page)

      return undefined
    },
  },

  {
    app: "directory",
    path: "/no-such-page",
    name: "try-again-hover",
    title: "404 Try Again, hovered",

    run: async (page) => {
      const button = page.getByRole("button", { name: /Try Again/ })
      await button.hover()
      await settle(page)

      return clipAround(page, button, { x: 200, y: 60 })
    },
  },

  {
    app: "directory",
    path: "/no-such-page",
    name: "try-again-focus",
    title: "404 Try Again, keyboard focus",

    run: async (page) => {
      const button = page.getByRole("button", { name: /Try Again/ })
      await button.focus()
      await settle(page)

      return clipAround(page, button, { x: 200, y: 60 })
    },
  },

  {
    app: "landing",
    path: "/coins",
    name: "coins-row-hover",
    title: "/coins row, hovered",

    run: async (page) => {
      await ethereumRow(page).hover()
      await settle(page)

      return clipAround(page, ethereumRow(page), { x: 40, y: 40 })
    },
  },

  {
    app: "landing",
    path: "/coins",
    name: "coins-expanded",
    title: "/coins Ethereum row, expanded",

    run: async (page) => {
      await expandEthereum(page)

      return undefined
    },
  },

  {
    app: "landing",
    path: "/coins",
    name: "coins-chip-hover",
    title: "/coins token chip, hovered",
    viewports: ["desktop"],

    run: async (page) => {
      await expandEthereum(page)

      await page
        .locator('[role="region"]')
        .first()
        .locator("a, button, [class*='rounded']")
        .filter({ hasText: /USDT|USDC/ })
        .first()
        .hover()

      await settle(page)

      return undefined
    },
  },

  {
    app: "landing",
    path: "/coins",
    name: "coins-search-match",
    title: "/coins search match",

    run: async (page) => {
      await page.getByPlaceholder(/Search currencies/).fill("USDT")
      await settle(page, 1500)

      return clipAround(page, page.locator("div.rounded-md", { hasText: /^USDT$/ }).first(), {
        x: 60,
        y: 80,
      })
    },
  },
]
