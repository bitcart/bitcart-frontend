#!/usr/bin/env node
//* Screenshots production beside the local previews. Usage:
//*   node capture.ts apps --out <dir> [--mode light|dark] [--only pages|states]
//*   node capture.ts checkout --out <dir> --invoice <id> --phase email|payment [--mode light|dark]
//*   node capture.ts colors [--mode light|dark] [--invoice <id>]
//*   node capture.ts submit-email --invoice <id> --email <address>
//* `colors` prints every theme token's color on production and local, as hex, probing checkout only
//* when given an invoice id.
//! Every request other than GET, HEAD and OPTIONS is aborted, except under `submit-email`.

import { mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"

import type { Page } from "@playwright/test"

import {
  APPS,
  CHECKOUT,
  CHECKOUT_STEPS,
  STATES,
  VIEWPORTS,
  pageSlug,
  type CheckoutPhase,
  type Mode,
  type Site,
} from "./targets.ts"

const require = createRequire(resolve(import.meta.dirname, "../../../../package.json"))
const { chromium } = require("@playwright/test") as typeof import("@playwright/test")

const { positionals, values } = parseArgs({
  allowPositionals: true,

  options: {
    out: { type: "string" },
    mode: { type: "string", multiple: true },
    only: { type: "string" },
    invoice: { type: "string" },
    phase: { type: "string" },
    email: { type: "string" },
  },
})

const command = positionals[0]
const modes = (values.mode ?? ["light", "dark"]) as Mode[]
const sites: Site[] = ["prod", "local"]
const browser = await chromium.launch()

const openPage = async (
  mode: Mode,
  viewport: { width: number; height: number },
  allowWrites = false,
) => {
  const context = await browser.newContext({
    viewport,
    colorScheme: mode,
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  })

  await context.addInitScript((theme: Mode) => localStorage.setItem("theme", theme), mode)

  await context.route("**/*", (route) => {
    const request = route.request()

    if (["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      return route.continue()
    } else if (allowWrites) {
      console.log("  write", request.method(), request.url())

      return route.continue()
    } else {
      console.log("  blocked", request.method(), request.url())

      return route.abort()
    }
  })

  return { context, page: await context.newPage() }
}

//* Scrolling through the page first triggers lazy images and scroll-driven reveals.
const settle = async (page: Page, viewportHeight: number) => {
  await page.waitForSelector('[data-is-hydrated="true"]', { timeout: 15_000 }).catch(() => null)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)

  for (let top = 0; top < height; top += viewportHeight / 2) {
    await page.evaluate((y: number) => window.scrollTo(0, y), top)
    await page.waitForTimeout(100)
  }

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1200)
}

const attempt = async (file: string, shoot: () => Promise<unknown>) => {
  try {
    await shoot()
    console.log("ok", file)
  } catch (error) {
    console.log("FAIL", file, String(error).slice(0, 300))
  }
}

const captureApps = async (out: string, mode: Mode) => {
  if (values.only !== "states") {
    for (const [app, { pages, ...origins }] of Object.entries(APPS)) {
      mkdirSync(join(out, mode, app), { recursive: true })

      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        const { context, page } = await openPage(mode, viewport)

        for (const path of pages) {
          for (const site of sites) {
            const file = join(out, mode, app, `${pageSlug(path)}-${viewportName}-${site}.png`)

            await attempt(file, async () => {
              await page.goto(origins[site] + path, { waitUntil: "load", timeout: 90_000 })
              await settle(page, viewport.height)
              await page.screenshot({ path: file, fullPage: true, animations: "disabled" })
            })
          }
        }

        await context.close()
      }
    }
  }

  if (values.only !== "pages") {
    mkdirSync(join(out, mode, "states"), { recursive: true })

    for (const state of STATES) {
      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        if (state.viewports && !state.viewports.includes(viewportName as keyof typeof VIEWPORTS)) {
          continue
        }

        for (const site of sites) {
          const file = join(
            out,
            mode,
            "states",
            `${state.app}-${state.name}-${viewportName}-${site}.png`,
          )

          const { context, page } = await openPage(mode, viewport)

          await attempt(file, async () => {
            await page.goto(APPS[state.app][site] + state.path, {
              waitUntil: "load",
              timeout: 90_000,
            })

            await settle(page, viewport.height)
            const clip = await state.run(page)
            await page.screenshot({ path: file, clip, animations: "disabled", caret: "initial" })
          })

          await context.close()
        }
      }
    }
  }
}

const captureCheckout = async (out: string, mode: Mode, invoice: string, phase: CheckoutPhase) => {
  mkdirSync(join(out, mode, "checkout"), { recursive: true })
  const [first, second, third] = CHECKOUT_STEPS[phase].map(({ name }) => name)

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const site of sites) {
      const { context, page } = await openPage(mode, viewport)

      const fileFor = (step: string) =>
        join(out, mode, "checkout", `${step}-${viewportName}-${site}.png`)

      const shoot = async (step: string) => {
        await page.mouse.move(0, 0)
        await page.waitForTimeout(600)

        await attempt(fileFor(step), () =>
          page.screenshot({ path: fileFor(step), fullPage: true, animations: "disabled" }),
        )
      }

      await page.goto(CHECKOUT[site] + invoice, { waitUntil: "load", timeout: 90_000 })
      await page.waitForTimeout(4000)

      if (phase === "email") {
        const input = page.locator('input[type="email"]')
        await shoot(first)
        await input.focus()
        await page.waitForTimeout(300)
        await shoot(second)
        await input.fill("not-an-email")
        await page.getByRole("button", { name: /Continue to payment/ }).click()
        await page.waitForTimeout(800)
        await shoot(third)
      } else {
        const method = page.getByRole("button", { name: /BTC|Bitcoin/ }).first()
        await shoot(first)
        await method.hover()
        await page.waitForTimeout(300)

        await attempt(fileFor(second), () =>
          page.screenshot({ path: fileFor(second), fullPage: true }),
        )

        await method.click()
        await page.waitForTimeout(4000)
        await shoot(third)
      }

      await context.close()
    }
  }
}

//* Reads the custom properties holding bare oklch triplets (`--primary: 0.54 0.28 300.7`), the format
//* both sides store their palette in, and converts each to hex through a canvas.
const readTokens = async (mode: Mode, url: string) => {
  const { context, page } = await openPage(mode, VIEWPORTS.desktop)
  await page.goto(url, { waitUntil: "load", timeout: 90_000 })
  await settle(page, VIEWPORTS.desktop.height)

  const tokens = await page.evaluate(() => {
    const names = new Set<string>()

    const collect = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          for (const property of rule.style) if (property.startsWith("--")) names.add(property)
        }

        if ("cssRules" in rule) collect(rule.cssRules as CSSRuleList)
      }
    }

    for (const sheet of document.styleSheets) {
      try {
        collect(sheet.cssRules)
      } catch {
        //* A cross-origin stylesheet refuses to list its rules; the tokens live in same-origin ones.
      }
    }

    const computed = getComputedStyle(document.body)
    const canvas = new OffscreenCanvas(1, 1).getContext("2d", { willReadFrequently: true })!
    const triplet = /^-?[\d.]+%?\s+-?[\d.]+\s+-?[\d.]+(?:deg)?$/

    return Object.fromEntries(
      [...names]
        .map((name) => [name, computed.getPropertyValue(name).trim()] as const)
        .filter(([, value]) => triplet.test(value))
        .map(([name, value]) => {
          canvas.clearRect(0, 0, 1, 1)
          canvas.fillStyle = `oklch(${value})`
          canvas.fillRect(0, 0, 1, 1)
          const [r, g, b] = canvas.getImageData(0, 0, 1, 1).data

          return [
            name,
            `#${[r, g, b]
              .map((channel) => channel.toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase()}`,
          ]
        }),
    )
  })

  await context.close()

  return tokens
}

const describeChange = (prod: string | undefined, local: string | undefined) => {
  if (prod === local) {
    return ""
  } else if (prod && local) {
    return "  changed"
  } else return "  only one side"
}

const printColors = async (invoice?: string) => {
  const targets = Object.values(APPS).map(({ title, prod, local }) => ({
    title,
    urls: { prod: `${prod}/`, local: `${local}/` },
  }))

  if (invoice) {
    targets.push({
      title: "Checkout",
      urls: { prod: CHECKOUT.prod + invoice, local: CHECKOUT.local + invoice },
    })
  }

  for (const mode of modes) {
    for (const { title, urls } of targets) {
      const [prod, local] = [await readTokens(mode, urls.prod), await readTokens(mode, urls.local)]
      const names = [...new Set([...Object.keys(prod), ...Object.keys(local)])].sort()

      console.log(`\n${title} · ${mode}`)
      console.log(`  ${"token".padEnd(30)} ${"production".padEnd(10)} local`)

      for (const name of names) {
        const marker = describeChange(prod[name], local[name])

        console.log(
          `  ${name.padEnd(30)} ${(prod[name] ?? "–").padEnd(10)} ${local[name] ?? "–"}${marker}`,
        )
      }
    }
  }
}

const submitEmail = async (invoice: string, email: string) => {
  const { context, page } = await openPage("light", VIEWPORTS.desktop, true)
  await page.goto(CHECKOUT.prod + invoice, { waitUntil: "load", timeout: 90_000 })
  await page.locator('input[type="email"]').fill(email)
  await page.getByRole("button", { name: /Continue to payment/ }).click()
  await page.waitForTimeout(5000)
  console.log((await page.locator("body").innerText()).replaceAll("\n", " | ").slice(0, 400))
  await context.close()
}

const out = values.out && resolve(values.out, "shots")

if (command === "apps" && out) {
  for (const mode of modes) await captureApps(out, mode)
} else if (
  command === "checkout" &&
  out &&
  values.invoice &&
  (values.phase === "email" || values.phase === "payment")
) {
  for (const mode of modes) await captureCheckout(out, mode, values.invoice, values.phase)
} else if (command === "colors") {
  await printColors(values.invoice)
} else if (command === "submit-email" && values.invoice && values.email) {
  await submitEmail(values.invoice, values.email)
} else {
  console.error("Usage: see the header of capture.ts")
  process.exitCode = 2
}

await browser.close()
