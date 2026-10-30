import { CHECKOUT_CLOSE_TESTID } from "@bitcart/qa"
import { expect, test, type BrowserContext, type Page, type WebSocketRoute } from "@playwright/test"

import { makeInvoice, makePolicies, makeStore } from "#/checkout/fixtures"
import { CHECKOUT_URL_PLACEHOLDER } from "#/embed/injected-checkout-url"

const INVOICE_ID = "e2e-embed"
const CHECKOUT_ORIGIN = "http://localhost:4002"
const MERCHANT_ORIGIN = "http://127.0.0.1:4002"
const REDIRECT_URL = `${MERCHANT_ORIGIN}/thanks`
const LEGACY_ADMIN_ORIGIN = "http://admin.bitcart.test"

type HostEvent = [type: string, detail: unknown]

declare global {
  interface Window {
    hostEvents: HostEvent[]
  }
}

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
}

const mockCheckoutApi = async (context: BrowserContext) => {
  let invoice = makeInvoice({ id: INVOICE_ID, redirect_url: REDIRECT_URL })
  const sockets: WebSocketRoute[] = []

  const serve = (pattern: RegExp, body: () => unknown) =>
    context.route(pattern, (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: CORS_HEADERS })
        : route.fulfill({ json: body(), headers: CORS_HEADERS }),
    )

  await serve(new RegExp(`/invoices/${INVOICE_ID}(?:\\?.*)?$`, "u"), () => invoice)
  await serve(/\/stores\/store-1(?:\?.*)?$/u, () => makeStore())
  await serve(/\/manage\/policies(?:\?.*)?$/u, () => makePolicies())

  await context.routeWebSocket(new RegExp(`/ws/invoices/${INVOICE_ID}$`, "u"), (socket) => {
    sockets.push(socket)
  })

  return {
    pay: () => {
      invoice = { ...invoice, status: "complete", sent_amount: invoice.price, paid_currency: "BTC" }

      for (const socket of sockets) {
        socket.send(JSON.stringify({ status: invoice.status, exception_status: "none" }))
      }
    },
  }
}

const moveCheckoutOffAdminHost = async (context: BrowserContext) => {
  await context.route(`${LEGACY_ADMIN_ORIGIN}/**`, async (route) => {
    const { pathname, search } = new URL(route.request().url())
    const checkoutUrl = `${CHECKOUT_ORIGIN}${pathname}${search}`

    if (pathname === "/modal/bitcart.js") {
      const response = await route.fetch({ url: checkoutUrl })
      const body = (await response.text()).replace(CHECKOUT_URL_PLACEHOLDER, CHECKOUT_ORIGIN)

      await route.fulfill({ response, body })
    } else await route.fulfill({ status: 302, headers: { location: checkoutUrl } })
  })
}

//! A document fulfilled by `page.route` never finishes loading a script from the preview, so the
//! merchant page is written into a document the preview serves on a second loopback origin.
const openMerchantPage = async (
  page: Page,
  script: "embed/v1.js" | "modal/bitcart.js",
  scriptOrigin = CHECKOUT_ORIGIN,
) => {
  await page.goto(`${MERCHANT_ORIGIN}/${script}`)

  await page.setContent(`
    <!doctype html>
    <html>
      <head><title>Merchant</title></head>
      <body>
        <h1>Merchant</h1>
        <script>window.hostEvents = []</script>
        <script src="${scriptOrigin}/${script}"></script>
      </body>
    </html>
  `)
}

const hostEvents = (page: Page) => page.evaluate(() => window.hostEvents)

const hostEventTypes = async (page: Page) => (await hostEvents(page)).map(([type]) => type)

const checkoutDialog = (page: Page) => page.locator("bitcart-checkout dialog")

const checkoutFrame = (page: Page) => page.frameLocator("bitcart-checkout iframe")

const openWithLoader = async (page: Page, { cancelsComplete = false } = {}) => {
  await openMerchantPage(page, "embed/v1.js")

  await page.evaluate(
    ({ invoiceId, isCompleteCanceled }) => {
      const checkout = window.Bitcart!.open(invoiceId)

      for (const type of ["ready", "status", "expired", "complete", "close", "error"]) {
        checkout.addEventListener(`bitcart:${type}`, (event) => {
          window.hostEvents.push([type, (event as CustomEvent).detail])

          if (type === "complete" && isCompleteCanceled) event.preventDefault()
        })
      }
    },
    { invoiceId: INVOICE_ID, isCompleteCanceled: cancelsComplete },
  )
}

const returnToStore = async (page: Page, api: Awaited<ReturnType<typeof mockCheckoutApi>>) => {
  await expect.poll(() => hostEventTypes(page)).toContain("ready")
  api.pay()

  await checkoutFrame(page)
    .getByRole("button", { name: /Return to Store/u })
    .click()
}

test.describe("Checkout: Embed loader", () => {
  test("shows the checkout once it's ready, and reports it", async ({ page, context }) => {
    await mockCheckoutApi(context)
    await openWithLoader(page)

    await expect(checkoutDialog(page)).toHaveAttribute("data-state", "shown")
    await expect(checkoutFrame(page).getByTestId(CHECKOUT_CLOSE_TESTID)).toBeVisible()

    expect(await hostEvents(page)).toEqual([
      [
        "ready",
        {
          invoice_id: INVOICE_ID,
          status: "pending",
          exception_status: "none",
          sent_amount: "0",
          sent_price: "0",
          currency: "USD",
          paid_currency: null,
          payment_id: null,
        },
      ],
    ])
  })

  test("closes from the checkout's close button", async ({ page, context }) => {
    await mockCheckoutApi(context)
    await openWithLoader(page)

    await checkoutFrame(page).getByTestId(CHECKOUT_CLOSE_TESTID).click()

    await expect(page.locator("bitcart-checkout")).toHaveCount(0)
    expect(await hostEvents(page)).toContainEqual(["close", { reason: "checkout" }])
  })

  test("stays open on a click outside the checkout's card", async ({ page, context }) => {
    await mockCheckoutApi(context)
    await openWithLoader(page)
    await expect(checkoutDialog(page)).toHaveAttribute("data-state", "shown")

    await page.mouse.click(8, 8)

    //* A close would arrive over the port asynchronously, so give it time to arrive.
    await page.waitForTimeout(500)

    await expect(page.locator("bitcart-checkout")).toHaveCount(1)
    expect(await hostEventTypes(page)).toEqual(["ready"])
  })

  test("returns the page to the store once paid", async ({ page, context }) => {
    const api = await mockCheckoutApi(context)

    await context.route(REDIRECT_URL, (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>Thanks</title>" }),
    )

    await openWithLoader(page)
    await returnToStore(page, api)

    await page.waitForURL(REDIRECT_URL)
  })

  test("stays on the page when it cancels the return", async ({ page, context }) => {
    const api = await mockCheckoutApi(context)

    await openWithLoader(page, { cancelsComplete: true })
    await returnToStore(page, api)

    await expect.poll(() => hostEventTypes(page)).toContain("complete")
    expect(page.url()).toBe(`${MERCHANT_ORIGIN}/embed/v1.js`)
  })

  test("offers a new tab when the checkout never answers", async ({ page, context }) => {
    await context.route(`${CHECKOUT_ORIGIN}/i/**`, (route) => route.abort())
    await page.clock.install()
    await openWithLoader(page)

    const fallback = page.getByRole("link", { name: "Open in new tab" })

    await expect(page.getByText("Loading checkout…")).toBeAttached()
    await expect(fallback).toBeHidden()

    await page.clock.fastForward(8000)

    await expect(fallback).toBeVisible()
    await expect(fallback).toHaveAttribute("href", `${CHECKOUT_ORIGIN}/i/${INVOICE_ID}`)
  })
})

test.describe("Checkout: Legacy modal shim", () => {
  test("keeps bitcart-store's flow: loaded, the status object, then hideFrame", async ({
    page,
    context,
  }) => {
    const api = await mockCheckoutApi(context)

    await openMerchantPage(page, "modal/bitcart.js")

    await page.evaluate((invoiceId) => {
      const { bitcart } = window

      bitcart!.onModalReceiveMessage(({ data, origin }) => {
        window.hostEvents.push(["message", { data, origin }])

        if (typeof data === "object") bitcart!.hideFrame()
      })

      bitcart!.showInvoice(invoiceId)
    }, INVOICE_ID)

    await expect
      .poll(() => hostEvents(page))
      .toEqual([["message", { data: "loaded", origin: CHECKOUT_ORIGIN }]])

    api.pay()

    await expect(page.locator("bitcart-checkout")).toHaveCount(0)

    expect(await hostEvents(page)).toContainEqual([
      "message",
      {
        origin: CHECKOUT_ORIGIN,

        data: {
          invoice_id: INVOICE_ID,
          status: "complete",
          exception_status: "none",
          sent_amount: "100",
          paid_currency: "BTC",
          payment_id: null,
        },
      },
    ])
  })

  test("keeps WHMCS's flow: the status object reaches the window", async ({ page, context }) => {
    const api = await mockCheckoutApi(context)

    await openMerchantPage(page, "modal/bitcart.js")

    await page.evaluate((invoiceId) => {
      window.addEventListener("message", ({ data }) => {
        if ((data as { status?: string }).status === "complete") {
          window.hostEvents.push(["complete", null])
        }
      })

      window.bitcart!.showInvoice(invoiceId)
    }, INVOICE_ID)

    await expect(checkoutDialog(page)).toHaveAttribute("data-state", "shown")
    api.pay()

    await expect.poll(() => hostEventTypes(page)).toEqual(["complete"])
  })

  test("follows a script loaded from the admin host to the checkout's own host", async ({
    page,
    context,
  }) => {
    await mockCheckoutApi(context)
    await moveCheckoutOffAdminHost(context)
    await openMerchantPage(page, "modal/bitcart.js", LEGACY_ADMIN_ORIGIN)

    await page.evaluate((invoiceId) => {
      window.bitcart!.onModalReceiveMessage(({ data, origin }) => {
        window.hostEvents.push(["message", { data, origin }])
      })

      window.bitcart!.showInvoice(invoiceId)
    }, INVOICE_ID)

    await expect
      .poll(() => hostEvents(page))
      .toEqual([["message", { data: "loaded", origin: CHECKOUT_ORIGIN }]])

    await expect(page.locator("bitcart-checkout iframe")).toHaveAttribute(
      "src",
      `${CHECKOUT_ORIGIN}/i/${INVOICE_ID}?embed=v1`,
    )
  })

  test("connects when an integration still sets the admin URL", async ({ page, context }) => {
    await mockCheckoutApi(context)
    await moveCheckoutOffAdminHost(context)
    await openMerchantPage(page, "modal/bitcart.js", LEGACY_ADMIN_ORIGIN)

    await page.evaluate(
      ({ invoiceId, adminOrigin }) => {
        window.bitcart!.onModalReceiveMessage(({ data }) => {
          window.hostEvents.push(["message", data])
        })

        window.bitcart!.setAdminUrlPrefix(adminOrigin)
        window.bitcart!.showInvoice(invoiceId)
      },
      { invoiceId: INVOICE_ID, adminOrigin: LEGACY_ADMIN_ORIGIN },
    )

    await expect(checkoutDialog(page)).toHaveAttribute("data-state", "shown")
    expect(await hostEvents(page)).toEqual([["message", "loaded"]])
  })
})
