import { afterEach, beforeAll, describe, expect, onTestFinished, test, vi } from "vitest"

import type { EmbedFrameMessage, EmbedInvoiceState } from "#/common/integrations/embed/protocol"

import type { BitcartCheckoutElement, CheckoutEventMap } from "./element"
import type { startFrameSession } from "./frame-session"
import { registerBitcartCheckout } from "./register"

const { sessions, navigateTo, injected } = vi.hoisted(() => ({
  sessions: [] as { options: Parameters<typeof startFrameSession>[0]; stop: () => void }[],
  navigateTo: vi.fn<(url: string) => void>(),
  injected: { checkoutUrl: null as string | null },
}))

vi.mock("./frame-session", () => ({
  startFrameSession: (options: Parameters<typeof startFrameSession>[0]) => {
    const session = { options, stop: vi.fn() }

    sessions.push(session)

    return session
  },
}))

vi.mock("./navigation", () => ({ navigateTo }))

vi.mock("./injected-checkout-url", () => ({
  get injectedCheckoutUrl() {
    return injected.checkoutUrl
  },
}))

const CHECKOUT_URL = "https://pay.example.com"

const STATE: EmbedInvoiceState = {
  invoice_id: "inv-1",
  status: "pending",
  exception_status: "none",
  sent_amount: "0",
  paid_currency: "",
  payment_id: "",
}

const EVENT_TYPES = [
  "bitcart:ready",
  "bitcart:status",
  "bitcart:expired",
  "bitcart:complete",
  "bitcart:close",
  "bitcart:error",
] as const satisfies (keyof CheckoutEventMap)[]

beforeAll(() => {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "")
    },

    close(this: HTMLDialogElement) {
      this.removeAttribute("open")
    },
  })

  registerBitcartCheckout(CHECKOUT_URL)
})

afterEach(() => {
  sessions.length = 0
  navigateTo.mockClear()
  document.body.replaceChildren()
  document.documentElement.style.overflow = ""
})

const record = (checkout: BitcartCheckoutElement) => {
  const events: [string, unknown][] = []

  for (const type of EVENT_TYPES) {
    checkout.addEventListener(type, (event) => events.push([type, (event as CustomEvent).detail]))
  }

  return events
}

const parts = (checkout: BitcartCheckoutElement) => {
  const root = checkout.shadowRoot as ShadowRoot
  const dialog = root.querySelector("dialog") as HTMLDialogElement

  return {
    dialog,
    frame: () => root.querySelector("iframe"),
    fallback: root.querySelector(".fallback") as HTMLParagraphElement,
    fallbackLink: root.querySelector(".fallback a") as HTMLAnchorElement,
    closeButton: root.querySelector(".close") as HTMLButtonElement,
    isFrameShown: () => dialog.dataset.state === "shown",
  }
}

const currentSession = () => {
  const session = sessions.at(-1)

  if (!session) throw new Error("No session was started")

  return session
}

const receive = (message: EmbedFrameMessage) => currentSession().options.onMessage(message)

const openCheckout = (invoiceId = "inv-1") => {
  const checkout = window.Bitcart!.open(invoiceId)

  return { checkout, events: record(checkout), ...parts(checkout) }
}

const mount = () => {
  const checkout = document.createElement("bitcart-checkout")

  checkout.setAttribute("invoice-id", "inv-1")
  document.body.append(checkout)

  return { checkout, events: record(checkout), ...parts(checkout) }
}

describe("Bitcart.open", () => {
  test("frames the invoice in embed mode from the checkout the script came from", () => {
    const { checkout, dialog, frame } = openCheckout("inv/1 ?")

    expect(checkout.isConnected).toBe(true)
    expect(dialog.open).toBe(true)
    expect(frame()?.src).toBe(`${CHECKOUT_URL}/i/inv%2F1%20%3F?embed=v1`)
    expect(currentSession().options.origins).toEqual([CHECKOUT_URL])
  })

  test("frames a transparent checkout allowed to copy", () => {
    const { frame } = openCheckout()

    expect(frame()?.allow).toBe("clipboard-write")
    expect(frame()?.hasAttribute("sandbox")).toBe(false)
  })

  test("frames another checkout when told to", () => {
    const checkout = window.Bitcart!.open("inv-1", {
      checkoutUrl: "https://other.example.com/pay/",
    })

    expect(parts(checkout).frame()?.src).toBe("https://other.example.com/pay/i/inv-1?embed=v1")
    expect(currentSession().options.origins).toEqual(["https://other.example.com"])
  })

  test("also trusts the injected checkout, where a redirected checkout URL lands", () => {
    injected.checkoutUrl = "https://checkout.example.com"

    onTestFinished(() => {
      injected.checkoutUrl = null
    })

    const checkout = window.Bitcart!.open("inv-1", { checkoutUrl: "https://admin.example.com" })

    expect(parts(checkout).frame()?.src).toBe("https://admin.example.com/i/inv-1?embed=v1")

    expect(currentSession().options.origins).toEqual([
      "https://admin.example.com",
      "https://checkout.example.com",
    ])
  })

  test("removes the checkout it made once closed", () => {
    const { checkout } = openCheckout()

    checkout.close()

    expect(checkout.isConnected).toBe(false)
  })
})

describe("<bitcart-checkout>", () => {
  test("opens and closes in place", () => {
    const { checkout, dialog, frame } = mount()

    checkout.open()
    expect(checkout.isOpen).toBe(true)

    checkout.close()
    expect(checkout.isOpen).toBe(false)
    expect(checkout.isConnected).toBe(true)
    expect(dialog.open).toBe(false)
    expect(frame()).toBeNull()
  })

  test("opens once while open", () => {
    const { checkout } = mount()

    checkout.open()
    checkout.open()

    expect(sessions).toHaveLength(1)
  })

  test("refuses to open without an invoice", () => {
    const checkout = document.createElement("bitcart-checkout")

    document.body.append(checkout)

    expect(() => checkout.open()).toThrow(/invoice-id/u)
  })

  test("refuses to open outside the document, leaving the page as it was", () => {
    const checkout = document.createElement("bitcart-checkout")

    checkout.setAttribute("invoice-id", "inv-1")

    expect(() => checkout.open()).toThrow(/document/u)
    expect(checkout.isOpen).toBe(false)
    expect(sessions).toEqual([])
    expect(document.documentElement.style.overflow).toBe("")
  })

  test("locks the page scroll while open, and restores it", () => {
    document.documentElement.style.overflow = "scroll"

    const { checkout } = mount()

    checkout.open()
    expect(document.documentElement.style.overflow).toBe("hidden")

    checkout.close()
    expect(document.documentElement.style.overflow).toBe("scroll")
  })

  test("tears down without an event when removed while open", () => {
    const { checkout, events } = mount()

    checkout.open()
    checkout.remove()

    expect(currentSession().stop).toHaveBeenCalledOnce()
    expect(document.documentElement.style.overflow).toBe("")
    expect(events).toEqual([])
  })
})

describe("frame messages", () => {
  test("shows the frame once the checkout is ready, and reports it", () => {
    const { events, isFrameShown } = openCheckout()

    expect(isFrameShown()).toBe(false)

    receive({ v: 1, type: "ready", payload: STATE })

    expect(isFrameShown()).toBe(true)
    expect(events).toEqual([["bitcart:ready", STATE]])
  })

  test("shows the frame on an error, which the checkout itself explains, and stays open", () => {
    const { checkout, events, isFrameShown } = openCheckout()
    const error = { invoice_id: "inv-1", reason: "not_found" } as const

    receive({ v: 1, type: "error", payload: error })

    expect(isFrameShown()).toBe(true)
    expect(checkout.isOpen).toBe(true)
    expect(events).toEqual([["bitcart:error", error]])
  })

  test("reports status changes and expiry", () => {
    const { events } = openCheckout()
    const expired = { ...STATE, status: "expired" } as const

    receive({ v: 1, type: "status", payload: expired })
    receive({ v: 1, type: "expired", payload: expired })

    expect(events).toEqual([
      ["bitcart:status", expired],
      ["bitcart:expired", expired],
    ])
  })

  test("closes when the checkout asks to", () => {
    const { checkout, events } = openCheckout()

    receive({ v: 1, type: "close" })

    expect(checkout.isOpen).toBe(false)
    expect(currentSession().stop).toHaveBeenCalledOnce()
    expect(events).toEqual([["bitcart:close", { reason: "checkout" }]])
  })

  describe("complete", () => {
    const complete = (redirect_url: string) =>
      receive({
        v: 1,
        type: "complete",
        payload: {
          ...STATE,
          status: "complete",
          redirect_url: redirect_url as `https://${string}`,
        },
      })

    test("returns to the store by default", () => {
      const { events } = openCheckout()

      complete("https://shop.example.com/thanks")

      expect(events.map(([type]) => type)).toEqual(["bitcart:complete"])
      expect(navigateTo).toHaveBeenCalledExactlyOnceWith("https://shop.example.com/thanks")
    })

    test("leaves returning to the page when it cancels the event", () => {
      const { checkout } = openCheckout()

      checkout.addEventListener("bitcart:complete", (event) => event.preventDefault())
      complete("https://shop.example.com/thanks")

      expect(navigateTo).not.toHaveBeenCalled()
      expect(checkout.isOpen).toBe(true)
    })

    test("never navigates the page to a URL other than a web one", () => {
      openCheckout()

      complete("javascript:alert(document.domain)")

      expect(navigateTo).not.toHaveBeenCalled()
    })
  })

  test("other events can't be canceled", () => {
    const { checkout } = openCheckout()
    let isCancelable: boolean | null = null

    checkout.addEventListener("bitcart:ready", (event) => {
      isCancelable = event.cancelable
    })

    receive({ v: 1, type: "ready", payload: STATE })

    expect(isCancelable).toBe(false)
  })
})

describe("while the checkout loads", () => {
  test.each([
    [
      "the close button",
      "button",
      ({ closeButton }: ReturnType<typeof parts>) => closeButton.click(),
    ],

    [
      "Escape",
      "escape",
      ({ dialog }: ReturnType<typeof parts>) =>
        dialog.dispatchEvent(new Event("cancel", { cancelable: true })),
    ],
  ])("closes on %s", (_case, reason, act) => {
    const opened = openCheckout()

    act(opened)

    expect(opened.checkout.isConnected).toBe(false)
    expect(opened.events).toEqual([["bitcart:close", { reason }]])
  })

  test("stays open on a press on the backdrop", () => {
    const { checkout, events, dialog } = openCheckout()

    dialog.dispatchEvent(new Event("pointerdown", { bubbles: true }))
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }))

    expect(checkout.isOpen).toBe(true)
    expect(events).toEqual([])
  })

  test("offers the invoice in a new tab once it stalls", () => {
    const { fallback, fallbackLink } = openCheckout()

    expect(fallback.hidden).toBe(true)

    currentSession().options.onStall()

    expect(fallback.hidden).toBe(false)
    expect(fallbackLink.href).toBe(`${CHECKOUT_URL}/i/inv-1`)
  })

  test("opens the new tab and closes when the buyer takes it", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    const { checkout, events, fallbackLink } = openCheckout()

    currentSession().options.onStall()
    fallbackLink.click()

    expect(open).toHaveBeenCalledExactlyOnceWith(`${CHECKOUT_URL}/i/inv-1`, "_blank", "noopener")
    expect(checkout.isConnected).toBe(false)
    expect(events).toEqual([["bitcart:close", { reason: "fallback" }]])
  })

  test("starts over with the fallback hidden on the next open", () => {
    const { checkout, fallback } = mount()

    checkout.open()
    currentSession().options.onStall()
    checkout.close()
    checkout.open()

    expect(fallback.hidden).toBe(true)
  })
})
