import { CHECKOUT_STATUS_TESTID } from "@bitcart/qa"
import { act, fireEvent, screen, within } from "@testing-library/react"
import confetti from "canvas-confetti"
import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest"

import { makeInvoice, makePayment, makeRefund, makeStore } from "../fixtures"
import { useCheckout } from "../hooks"
import type { CheckoutAppConfig } from "../runtime/context"
import { installFakeTerminal, type FakeTerminalOptions } from "../terminal"
import { renderCheckout } from "../testing/render-checkout"
import { REDIRECT_DELAY_SECONDS } from "./return-to-store"
import { StatusOverlay } from "./status-overlay"

afterEach(() => {
  vi.useRealTimers()
})

describe("StatusOverlay", () => {
  const renderStatus = (
    overrides: Parameters<typeof makeInvoice>[0],
    store: Parameters<typeof makeStore>[0] = {},
    appConfig: CheckoutAppConfig = {},
  ) =>
    renderCheckout({
      source: {
        invoice: makeInvoice({ id: "invoice-42", payment_id: "method-btc", ...overrides }),
        store: makeStore(store),
      },

      screens: { Payment: () => null },
      appConfig,
    })

  const contactLink = () => screen.queryByRole("link", { name: "Contact store" })
  const returnToStore = () => screen.getByRole("button", { name: "Return to Store" })

  test("explains a payment that failed to confirm", () => {
    renderStatus({
      status: "invalid",
      exception_status: "failed_confirm",
      sent_amount: "0.00150000",
    })

    expect(screen.getByText("Payment failed to confirm")).toBeInTheDocument()
    expect(screen.getByText(/dropped from the network/)).toBeInTheDocument()
  })

  test.each([
    ["complete", "Paid to Example Store"],
    ["refunded", "Paid to Example Store"],
    ["expired", "Example Store"],
    ["invalid", "Example Store"],
    ["unknown", "Example Store"],
  ] as const)("names the store on a %s invoice as %s", (status, storeLine) => {
    renderStatus({ status })

    expect(screen.getByTestId(CHECKOUT_STATUS_TESTID)).toHaveTextContent(storeLine)
  })

  test("tells the buyer how much they sent before a partially paid invoice expired", () => {
    renderStatus({ status: "expired", exception_status: "paid_partial", sent_amount: "0.00050000" })

    expect(screen.getByText("Invoice expired")).toBeInTheDocument()

    expect(
      screen.getByText(/You sent 0\.00050000 BTC, but not the full amount/),
    ).toBeInTheDocument()
  })

  test("links to the store's support page when the buyer is told to contact the store", () => {
    renderStatus({ status: "unknown" }, { support_url: "https://help.example.com" })

    expect(contactLink()).toHaveAttribute("href", "https://help.example.com")
  })

  test("emails the store's support address with the invoice in the subject", () => {
    renderStatus({ status: "unknown" }, { support_email: "help@example.com" })

    expect(contactLink()).toHaveAttribute(
      "href",
      "mailto:help@example.com?subject=Invoice%20invoice-42",
    )
  })

  test.each([{ support_url: "https://help.example.com" }, { support_email: "help@example.com" }])(
    "offers no contact that would leave a terminal (%o)",
    (support) => {
      onTestFinished(installFakeTerminal())
      renderStatus({ status: "unknown" }, support)

      expect(contactLink()).not.toBeInTheDocument()
    },
  )

  test("offers no contact when the store has no support settings", () => {
    renderStatus({ status: "unknown" })

    expect(contactLink()).not.toBeInTheDocument()
  })

  test("offers no contact on a screen that doesn't ask for it", () => {
    renderStatus({ status: "complete" }, { support_email: "help@example.com" })

    expect(contactLink()).not.toBeInTheDocument()
  })

  test("links to the receipt of a paid invoice", () => {
    renderStatus({ status: "complete", sent_amount: "0.00150000" })

    expect(screen.getByRole("link", { name: "View Receipt" })).toHaveAttribute(
      "href",
      "/i/invoice-42/receipt",
    )
  })

  test("opens the receipt in place when the app shows it there", () => {
    const openPage = vi.fn()

    renderStatus({ status: "complete", sent_amount: "0.00150000" }, {}, { openPage })
    fireEvent.click(screen.getByRole("button", { name: "View Receipt" }))

    expect(openPage).toHaveBeenCalledExactlyOnceWith("/i/invoice-42/receipt")
    expect(screen.queryByRole("link", { name: "View Receipt" })).not.toBeInTheDocument()
  })

  test("offers no receipt for an invoice that expired unpaid", () => {
    renderStatus({ status: "expired" })

    expect(screen.queryByRole("link", { name: "View Receipt" })).not.toBeInTheDocument()
  })

  test("says nothing about an overpayment", () => {
    renderStatus({ status: "complete", exception_status: "paid_over", sent_amount: "0.00200000" })

    expect(screen.getByText("Payment complete")).toBeInTheDocument()
    expect(screen.queryByText(/0\.00200000/)).not.toBeInTheDocument()
  })

  describe("on an invoice that accepts any amount", () => {
    const anyAmount = (overrides: Parameters<typeof makeInvoice>[0]) =>
      renderStatus({
        price: "0.00",
        payments: [makePayment({ amount: "0.00000000" })],
        ...overrides,
      })

    test("shows what was received instead of the zero price", () => {
      anyAmount({
        status: "complete",
        exception_status: "paid_over",
        sent_amount: "0.00420000",
        sent_price: "280.00",
      })

      expect(screen.getByText("0.00420000 BTC")).toBeInTheDocument()
      expect(screen.getByText("$280.00")).toBeInTheDocument()
      expect(screen.queryByText(/\$0\.00/u)).not.toBeInTheDocument()
    })

    test("shows no amount when nothing was received", () => {
      anyAmount({ status: "expired", payment_id: null })

      expect(screen.queryByText(/\$0\.00/u)).not.toBeInTheDocument()
    })
  })

  test("shows the price the buyer paid after a discount", () => {
    renderStatus({ status: "complete", price: "100.00", effective_price: "90.00" })

    expect(screen.getByText("$90.00")).toBeInTheDocument()
    expect(screen.queryByText(/100\.00/u)).not.toBeInTheDocument()
  })

  test("doesn't pretend to know a status it can't recognise", () => {
    renderStatus({ status: "unknown" })

    expect(screen.getByText("Invoice status unavailable")).toBeInTheDocument()
  })

  test("doesn't celebrate a page opened on a complete invoice", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "Date"] })
    vi.mocked(confetti).mockClear()

    renderStatus({ status: "complete" })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByText("Payment complete")).toBeInTheDocument()
    expect(confetti).not.toHaveBeenCalled()
  })

  test("celebrates a completion seen live, and stops once it leaves the screen", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "Date"] })

    const paidInvoice = makeInvoice({ status: "paid" })

    const { refetch, unmount } = renderCheckout({
      source: { invoice: paidInvoice },
      screens: { Payment: () => null },
    })

    refetch({ invoice: { ...paidInvoice, status: "complete" } })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(confetti).toHaveBeenCalled()

    unmount()
    vi.mocked(confetti).mockClear()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(confetti).not.toHaveBeenCalled()
    expect(confetti.reset).toHaveBeenCalled()
  })

  describe("on a terminal", () => {
    const PAID = {
      status: "complete",
      sent_amount: "0.00150000",
      redirect_url: "https://shop.example.com/thanks",
    } as const

    const onTerminal = (
      options: FakeTerminalOptions,
      overrides: Parameters<typeof makeInvoice>[0] = PAID,
    ) => {
      onTestFinished(installFakeTerminal(options))
      renderStatus(overrides)
    }

    const printButton = () => screen.getByRole("button", { name: /Print/ })

    test("prints the receipt instead of linking to it", async () => {
      const onInvoke = vi.fn()
      onTerminal({ onInvoke })

      expect(screen.queryByRole("link", { name: "View Receipt" })).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Print receipt" }))

      expect(printButton()).toHaveTextContent("Printing…")
      expect(printButton()).toBeDisabled()
      expect(await screen.findByRole("button", { name: "Print again" })).toBeEnabled()

      expect(onInvoke).toHaveBeenCalledWith(
        "printer.print",
        expect.objectContaining({
          blocks: expect.arrayContaining([
            {
              kind: "field",
              label: "Total",
              value: { text: expect.any(String), style: "title" },
              bold: true,
            },

            { kind: "qr", data: `${window.location.origin}/i/invoice-42/receipt` },
          ]) as unknown,
        }),
      )
    })

    test("explains how to fix a failed print, without the shell's diagnostic", async () => {
      onTerminal({ failWith: "PRINTER_OUT_OF_PAPER" })

      fireEvent.click(printButton())

      expect(await screen.findByRole("alert")).toHaveTextContent(
        /^Out of paperLoad a new roll, then print again\.$/,
      )

      expect(printButton()).toBeEnabled()
    })

    test("shows the shell's diagnostic when the copy can't name a fix", async () => {
      onTerminal({ failWith: "PRINTER_HARDWARE_FAULT" })

      fireEvent.click(printButton())

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Printer faultRestart the terminal. If it keeps failing, contact support.fake",
      )
    })

    test("stops offering a print that can't succeed", async () => {
      onTerminal({ failWith: "PERMISSION_DENIED" })

      fireEvent.click(printButton())

      expect(await screen.findByRole("alert")).toHaveTextContent("Printing isn't permitted")
      expect(printButton()).toBeDisabled()
    })

    test("links to the receipt on a terminal without a printer", () => {
      onTerminal({ printer: false })

      expect(screen.getByRole("link", { name: "View Receipt" })).toBeInTheDocument()
    })

    test("offers no print for an invoice without a receipt", () => {
      onTerminal({}, { status: "expired" })

      expect(screen.queryByRole("button", { name: /Print/ })).not.toBeInTheDocument()
    })

    test("keeps the buyer on the terminal instead of returning to the store", () => {
      onTerminal({})

      expect(screen.queryByRole("button", { name: "Return to Store" })).not.toBeInTheDocument()
    })
  })

  test("returns to the store outside a terminal", () => {
    const redirect = vi.fn()

    renderStatus(
      { status: "complete", redirect_url: "https://shop.example.com/thanks" },
      {},
      { redirect },
    )

    fireEvent.click(returnToStore())

    expect(redirect).toHaveBeenCalledExactlyOnceWith("https://shop.example.com/thanks")
  })

  describe("in a modal", () => {
    const closeAction = () =>
      within(screen.getByTestId(CHECKOUT_STATUS_TESTID)).queryByRole("button", { name: "Close" })

    test("offers to close it when there's no store to return to", () => {
      const close = vi.fn()

      renderStatus({ status: "complete", redirect_url: "" }, {}, { close })
      fireEvent.click(closeAction()!)

      expect(close).toHaveBeenCalledOnce()
    })

    test("returns to the store instead of closing when it can", () => {
      renderStatus(
        { status: "complete", redirect_url: "https://shop.example.com/thanks" },
        {},
        { close: vi.fn() },
      )

      expect(returnToStore()).toBeInTheDocument()
      expect(closeAction()).not.toBeInTheDocument()
    })
  })

  describe("redirect", () => {
    const REDIRECT_URL = "https://shop.example.com/thanks"

    const completeLive = () => {
      vi.useFakeTimers()

      const redirect = vi.fn()
      const paidInvoice = makeInvoice({ status: "paid", redirect_url: REDIRECT_URL })

      const { refetch } = renderCheckout({
        source: { invoice: paidInvoice },
        screens: { Payment: () => null },
        appConfig: { redirect },
      })

      refetch({ invoice: { ...paidInvoice, status: "complete" } })

      return redirect
    }

    const waitOutDelay = () =>
      act(() => {
        vi.advanceTimersByTime(REDIRECT_DELAY_SECONDS * 1000)
      })

    const statusScreen = () => screen.getByTestId(CHECKOUT_STATUS_TESTID)

    test("counts down to the store after a completion seen live", () => {
      const redirect = completeLive()

      expect(screen.getByRole("alert")).toHaveTextContent(
        `Returning to Example Store in ${REDIRECT_DELAY_SECONDS} seconds.`,
      )

      expect(returnToStore()).toHaveTextContent(`Return to Store· ${REDIRECT_DELAY_SECONDS}`)

      act(() => {
        vi.advanceTimersByTime((REDIRECT_DELAY_SECONDS - 1) * 1000)
      })

      expect(redirect).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(redirect).toHaveBeenCalledExactlyOnceWith(REDIRECT_URL)
    })

    test("returns to the store at once on request", () => {
      const redirect = completeLive()

      fireEvent.pointerDown(returnToStore())
      fireEvent.click(returnToStore())

      expect(redirect).toHaveBeenCalledExactlyOnceWith(REDIRECT_URL)
    })

    test.each([
      [
        "the pointer travels over it",
        () => {
          fireEvent.pointerMove(statusScreen(), { clientX: 100, clientY: 100 })
          fireEvent.pointerMove(statusScreen(), { clientX: 108, clientY: 100 })
        },
      ],
      ["the buyer presses on it", () => fireEvent.pointerDown(statusScreen())],
      [
        "focus moves into it",
        () => fireEvent.focus(screen.getByRole("link", { name: "View Receipt" })),
      ],
      ["the buyer presses Escape", () => fireEvent.keyDown(window, { key: "Escape" })],
    ])("stays on the page once %s", (_case, engage) => {
      const redirect = completeLive()

      engage()
      waitOutDelay()

      expect(redirect).not.toHaveBeenCalled()
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      expect(returnToStore()).toHaveTextContent(/^Return to Store$/)
    })

    test("marks the Escape that stops it as handled, so it closes nothing else", () => {
      completeLive()

      expect(fireEvent.keyDown(window, { key: "Escape" })).toBe(false)
      expect(fireEvent.keyDown(window, { key: "Escape" })).toBe(true)
    })

    test("keeps counting down under a pointer that barely moves", () => {
      const redirect = completeLive()

      fireEvent.pointerMove(statusScreen(), { clientX: 100, clientY: 100 })
      fireEvent.pointerMove(statusScreen(), { clientX: 103, clientY: 102 })
      waitOutDelay()

      expect(redirect).toHaveBeenCalledExactlyOnceWith(REDIRECT_URL)
    })

    test("leaves the choice to the buyer when the page opens on a complete invoice", () => {
      renderStatus({ status: "complete", redirect_url: REDIRECT_URL })

      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      expect(returnToStore()).toHaveTextContent(/^Return to Store$/)
    })
  })

  describe("in a template's own status screen", () => {
    const TemplateStatus = () => {
      const { status, exception, store, invoice } = useCheckout("status")

      return (
        <StatusOverlay
          status={status}
          exception={exception}
          storeName={store.name}
          storeSupport={store.support}
          invoiceId={invoice.id}
          price={null}
          receiptHref="/i/invoice-42/receipt"
          redirectUrl="https://shop.example.com/thanks"
        />
      )
    }

    const renderTemplateStatus = (overrides: Parameters<typeof makeInvoice>[0]) =>
      renderCheckout({
        source: {
          invoice: makeInvoice({ id: "invoice-42", payment_id: "method-btc", ...overrides }),
          store: makeStore({ support_email: "help@example.com" }),
        },

        screens: { Payment: () => null, Status: TemplateStatus },
      })

    test("links to the receipt and back to the store without a printer passed in", () => {
      renderTemplateStatus({ status: "complete", sent_amount: "0.00150000" })

      expect(screen.getByRole("link", { name: "View Receipt" })).toBeInTheDocument()
      expect(returnToStore()).toBeInTheDocument()
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    test("keeps the terminal's rules about leaving the checkout", () => {
      onTestFinished(installFakeTerminal())
      renderTemplateStatus({ status: "unknown" })

      expect(screen.queryByRole("button", { name: "Return to Store" })).not.toBeInTheDocument()
      expect(contactLink()).not.toBeInTheDocument()
    })
  })
})

describe("StatusOverlay refund action", () => {
  const renderRefund = (
    refund: ReturnType<typeof makeRefund>,
    {
      status = "complete",
      appConfig = {},
    }: { status?: "complete" | "refunded"; appConfig?: CheckoutAppConfig } = {},
  ) =>
    renderCheckout({
      source: {
        invoice: makeInvoice({
          id: "invoice-42",
          status,
          payment_id: "method-btc",
          sent_amount: "0.00150000",
          refund_id: refund.id,
        }),

        refund,
      },

      screens: { Payment: () => null },
      appConfig,
    })

  test("asks the buyer to claim an unclaimed refund", () => {
    renderRefund(makeRefund({ id: "refund-7" }))

    expect(screen.getByRole("link", { name: "Claim refund" })).toHaveAttribute(
      "href",
      "/refunds/refund-7",
    )
  })

  test.each([
    ["complete", "pending"],
    ["refunded", "complete"],
  ] as const)("links a %s invoice to its refund once claimed", (status, payout_status) => {
    renderRefund(makeRefund({ id: "refund-7", payout_id: "payout-1", payout_status }), { status })

    expect(screen.getByRole("link", { name: "View refund" })).toHaveAttribute(
      "href",
      "/refunds/refund-7",
    )

    expect(screen.queryByRole("link", { name: "Claim refund" })).not.toBeInTheDocument()
  })

  test("opens the refund through the app when it opens pages itself", () => {
    const openPage = vi.fn()

    renderRefund(makeRefund({ id: "refund-7" }), { appConfig: { openPage } })
    fireEvent.click(screen.getByRole("button", { name: "Claim refund" }))

    expect(openPage).toHaveBeenCalledExactlyOnceWith("/refunds/refund-7")
  })

  test("offers no refund at a terminal", () => {
    onTestFinished(installFakeTerminal())
    renderRefund(makeRefund({ id: "refund-7" }))

    expect(screen.queryByText("Claim refund")).not.toBeInTheDocument()
  })

  test("offers no refund on an invoice without one", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ status: "complete", payment_id: "method-btc" }) },
      screens: { Payment: () => null },
    })

    expect(screen.queryByText(/refund/iu)).not.toBeInTheDocument()
  })
})
