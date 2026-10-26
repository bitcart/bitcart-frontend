import { describe, expect, onTestFinished, test, vi } from "vitest"

import type { EmbedInvoiceState } from "#/common/integrations/embed/protocol"

import type { BitcartCheckoutElement, CheckoutCloseReason, CheckoutEventMap } from "./element"
import { createLegacyBitcart } from "./legacy"

const CHECKOUT_URL = "https://pay.example.com"

const STATE: EmbedInvoiceState = {
  invoice_id: "inv-1",
  status: "pending",
  exception_status: "none",
  sent_amount: "0",
  paid_currency: "",
  payment_id: "",
}

const createFakeCheckout = () => {
  const checkout = new EventTarget()

  const emit = <Type extends keyof CheckoutEventMap>(
    type: Type,
    detail: CheckoutEventMap[Type]["detail"],
  ) => checkout.dispatchEvent(new CustomEvent(type, { detail }))

  let isOpen = true

  const closeWith = (reason: CheckoutCloseReason) => {
    if (isOpen) {
      isOpen = false
      emit("bitcart:close", { reason })
    }
  }

  return Object.assign(checkout, {
    emit,
    closeWith,
    close: vi.fn(() => closeWith("api")),
  })
}

type FakeCheckout = ReturnType<typeof createFakeCheckout>

const setup = ({ checkoutUrl = CHECKOUT_URL as string | null } = {}) => {
  const opened: FakeCheckout[] = []

  const openCheckout = vi.fn((_invoiceId: string, _options?: { checkoutUrl?: string }) => {
    const checkout = createFakeCheckout()

    opened.push(checkout)

    return checkout as unknown as BitcartCheckoutElement
  })

  const bitcart = createLegacyBitcart({ checkoutUrl, openCheckout })
  const calls: string[] = []
  const received: MessageEvent[] = []
  const onWindow: MessageEvent[] = []

  const windowListener = (event: MessageEvent) => onWindow.push(event)

  window.addEventListener("message", windowListener)
  onTestFinished(() => window.removeEventListener("message", windowListener))

  bitcart.onModalWillEnter(() => calls.push("enter"))
  bitcart.onModalWillLeave(() => calls.push("leave"))

  bitcart.onModalReceiveMessage((event) => {
    calls.push(`message:${typeof event.data === "string" ? event.data : event.data.status}`)
    received.push(event)
  })

  const current = (): FakeCheckout => {
    const checkout = opened.at(-1)

    if (!checkout) throw new Error("No checkout was opened")

    return checkout
  }

  return { bitcart, openCheckout, opened, current, calls, received, onWindow }
}

describe("createLegacyBitcart", () => {
  test("opens an invoice from the checkout the script came from", () => {
    const { bitcart, openCheckout } = setup()

    bitcart.showInvoice("inv-1")

    expect(openCheckout).toHaveBeenCalledExactlyOnceWith("inv-1", { checkoutUrl: CHECKOUT_URL })
  })

  test("opens invoices from the admin URL prefix once set", () => {
    const { bitcart, openCheckout } = setup()

    bitcart.setAdminUrlPrefix("https://other.example.com/pay//")
    bitcart.showInvoice("inv-1")

    expect(openCheckout).toHaveBeenCalledWith("inv-1", {
      checkoutUrl: "https://other.example.com/pay",
    })
  })

  test("refuses to open without a checkout URL", () => {
    const { bitcart } = setup({ checkoutUrl: null })

    expect(() => bitcart.showInvoice("inv-1")).toThrow(/setAdminUrlPrefix/u)
  })

  test("says loaded once the checkout is ready, after entering", () => {
    const { bitcart, current, calls, received } = setup()

    bitcart.showInvoice("inv-1")
    current().emit("bitcart:ready", STATE)

    expect(calls).toEqual(["enter", "message:loaded"])
    expect(received[0]?.origin).toBe(CHECKOUT_URL)
  })

  test("posts the legacy status object on status changes only", () => {
    const { bitcart, current, received } = setup()
    const paid = { ...STATE, status: "paid", sent_amount: "0.0015" } as const

    bitcart.showInvoice("inv-1")
    current().emit("bitcart:ready", STATE)

    current().emit("bitcart:status", {
      ...STATE,
      sent_amount: "0.0005",
      exception_status: "paid_partial",
    })

    current().emit("bitcart:status", paid)
    current().emit("bitcart:status", { ...paid, payment_id: "method-btc" })

    expect(received.map(({ data }) => data)).toEqual([
      "loaded",
      {
        invoice_id: "inv-1",
        status: "paid",
        exception_status: "none",
        sent_amount: "0.0015",
        paid_currency: "",
        payment_id: "",
      },
    ])
  })

  test("delivers every message on the window too, as legacy did", () => {
    const { bitcart, current, received, onWindow } = setup()

    bitcart.showInvoice("inv-1")
    current().emit("bitcart:ready", STATE)
    current().emit("bitcart:status", { ...STATE, status: "complete" })

    expect(onWindow).toEqual(received)
    expect(onWindow.map(({ origin }) => origin)).toEqual([CHECKOUT_URL, CHECKOUT_URL])
  })

  test.each(["checkout", "button", "escape", "fallback"] as const)(
    "leaves, then says close, when the buyer closes it (%s)",
    (reason) => {
      const { bitcart, current, calls } = setup()

      bitcart.showInvoice("inv-1")
      current().closeWith(reason)

      expect(calls).toEqual(["leave", "message:close"])
    },
  )

  test("hides the frame by leaving and closing, without a close message", () => {
    const { bitcart, current, calls } = setup()

    bitcart.showInvoice("inv-1")
    bitcart.hideFrame()

    expect(current().close).toHaveBeenCalledOnce()
    expect(calls).toEqual(["leave"])
  })

  test("replaces an open invoice, closing it first, without leaving", () => {
    const { bitcart, opened, openCheckout, calls } = setup()

    bitcart.showInvoice("inv-1")

    openCheckout.mockImplementationOnce(() => {
      expect(opened[0]?.close).toHaveBeenCalledOnce()

      const checkout = createFakeCheckout()

      opened.push(checkout)

      return checkout as unknown as BitcartCheckoutElement
    })

    bitcart.showInvoice("inv-2")

    expect(openCheckout).toHaveBeenLastCalledWith("inv-2", { checkoutUrl: CHECKOUT_URL })
    expect(calls).toEqual([])
  })

  test("reopens the last invoice when shown again after it closed", () => {
    const { bitcart, current, openCheckout, calls } = setup()

    bitcart.showInvoice("inv-1")
    current().closeWith("checkout")
    calls.length = 0
    bitcart.showFrame()

    expect(openCheckout).toHaveBeenCalledTimes(2)
    expect(openCheckout).toHaveBeenLastCalledWith("inv-1", { checkoutUrl: CHECKOUT_URL })
    expect(calls).toEqual(["enter"])
  })

  test("only enters when shown while open", () => {
    const { bitcart, openCheckout, calls } = setup()

    bitcart.showInvoice("inv-1")
    bitcart.showFrame()

    expect(openCheckout).toHaveBeenCalledOnce()
    expect(calls).toEqual(["enter"])
  })
})
