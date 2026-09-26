import type { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { useCheckoutModel, type CheckoutModelOptions, type CheckoutSource } from "./model"
import { makeInvoice, makePayment, makePolicies, makeSource, makeStore } from "./testing/fixtures"

const renderModel = (
  source: Partial<CheckoutSource> = {},
  options: CheckoutModelOptions = { selection: "preselect" },
) =>
  renderHook(
    (props: { source: CheckoutSource; options: CheckoutModelOptions }) =>
      useCheckoutModel(props.source, props.options),
    {
      initialProps: {
        source: makeSource(source),
        options,
      },
    },
  )

describe("useCheckoutModel", () => {
  describe("phase", () => {
    test.each(["complete", "expired", "invalid", "refunded"] as const)(
      "is status once the invoice is %s",
      (status) => {
        const { result } = renderModel({ invoice: makeInvoice({ status }) })

        expect(result.current).toMatchObject({ phase: "status", status })
      },
    )
  })

  describe("partial payment", () => {
    const btc = makePayment({ id: "method-btc", name: "BTC" })

    const ltc = makePayment({
      id: "method-ltc",
      name: "LTC",
      amount: "1.25000000",
      payment_address: "ltc1qpartial",
      payment_url: "litecoin:ltc1qpartial?amount=1.25",
    })

    const partialInvoice = (overrides: Partial<bitcartInvoices.Invoice> = {}) =>
      makeInvoice({
        payments: [btc, ltc],
        payment_id: "method-ltc",
        exception_status: "paid_partial",
        sent_amount: 0.5,
        ...overrides,
      })

    test("asks only for the remainder", () => {
      const { result } = renderModel({ invoice: partialInvoice() })

      expect(result.current).toMatchObject({
        phase: "payment",
        payment: { amount: "0.75000000", partial: { paid: "0.50000000", total: "1.25000000" } },
      })
    })

    test("drops the payment URI that still encodes the full amount", () => {
      const { result } = renderModel({ invoice: partialInvoice() })

      expect(result.current).toMatchObject({
        payment: { address: "ltc1qpartial", paymentUrl: null },
      })

      expect(JSON.stringify(result.current)).not.toContain("litecoin:")
    })

    test.each([
      ["0.30000000", 0.1, 8, "0.20000000"],
      ["0.012345678901234567", 0.002, 18, "0.010345678901234567"],
      ["1.00000000", 1.5, 8, "0.00000000"],
    ])("subtracts %s − %s exactly at %i decimals", (amount, sentAmount, divisibility, expected) => {
      const { result } = renderModel({
        invoice: partialInvoice({
          sent_amount: sentAmount,
          payments: [{ ...ltc, amount, divisibility }],
        }),
      })

      expect(result.current).toMatchObject({ payment: { amount: expected } })
    })

    test("locks the checkout to the method that received the funds", () => {
      const { result } = renderModel({ invoice: partialInvoice() }, { selection: "explicit" })

      act(() => result.current.selectMethod("method-btc"))

      expect(result.current).toMatchObject({
        phase: "payment",
        methods: [{ id: "method-ltc" }],
        payment: { id: "method-ltc" },
      })

      expect(result.current.phase === "payment" && result.current.changeMethod).toBeUndefined()
    })
  })

  describe("payment detected", () => {
    test.each(["paid", "unconfirmed", "confirmed"] as const)(
      "waits for confirmations once the invoice is %s, without payment details",
      (status) => {
        const { result } = renderModel({
          invoice: makeInvoice({
            status,
            buyer_email: "",
            payment_id: "method-btc",
            payments: [makePayment({ confirmations: 1 })],
          }),
          store: makeStore({ email_required: true, transaction_speed: 3 }),
        })

        expect(result.current).toMatchObject({
          phase: "confirming",
          confirmations: { received: 1, required: 3 },
        })

        expect(JSON.stringify(result.current)).not.toContain("bc1qexampleaddress")
      },
    )
  })

  describe("unavailable", () => {
    test("is unavailable when an open invoice has no payment methods", () => {
      const { result } = renderModel({ invoice: makeInvoice({ payments: [] }) })

      expect(result.current.phase).toBe("unavailable")
    })
  })

  describe("details gate", () => {
    const address = "bc1qsecretaddress"
    const paymentUrl = `bitcoin:${address}?amount=0.0015`
    const payments = [makePayment({ payment_address: address, payment_url: paymentUrl })]

    test.each([
      [{ email_required: true, ask_address: false }, ["email"]],
      [{ email_required: false, ask_address: true }, ["address", "notes"]],
      [{ email_required: true, ask_address: true }, ["email", "address", "notes"]],
    ])("asks only for the missing fields required by %o", (settings, fields) => {
      const { result } = renderModel({
        invoice: makeInvoice({ buyer_email: "", shipping_address: "", payments }),
        store: makeStore(settings),
      })

      expect(result.current).toMatchObject({ phase: "details", details: { fields } })
    })

    test("leaves out notes the invoice already has, as they can be set only once", () => {
      const { result } = renderModel({
        invoice: makeInvoice({ shipping_address: "", notes: "Leave at the door", payments }),
        store: makeStore({ email_required: false, ask_address: true }),
      })

      expect(result.current).toMatchObject({ phase: "details", details: { fields: ["address"] } })
    })

    test("advances to payment once the refetched invoice includes the details", () => {
      const store = makeStore({ email_required: true })
      const { result, rerender } = renderModel({ invoice: makeInvoice({ buyer_email: "" }), store })

      rerender({
        source: makeSource({ invoice: makeInvoice({ buyer_email: "a@b.co" }), store }),
        options: { selection: "preselect" },
      })

      expect(result.current.phase).toBe("payment")
    })

    test("submits only the details the store asks for", async () => {
      const submitCustomerDetails = vi.fn(() => Promise.resolve())

      const { result } = renderModel({
        invoice: makeInvoice({ buyer_email: "" }),
        store: makeStore({ email_required: true }),
        submitCustomerDetails,
      })

      await act(async () => {
        if (result.current.phase === "details") {
          await result.current.details.submit({ email: "a@b.co", address: "Main St 1" })
        }
      })

      expect(submitCustomerDetails).toHaveBeenCalledWith({ buyer_email: "a@b.co" })
    })

    test("submits notes together with the shipping address", async () => {
      const submitCustomerDetails = vi.fn(() => Promise.resolve())

      const { result } = renderModel({
        invoice: makeInvoice({ shipping_address: "", notes: "" }),
        store: makeStore({ email_required: false, ask_address: true }),
        submitCustomerDetails,
      })

      await act(async () => {
        if (result.current.phase === "details") {
          await result.current.details.submit({ address: "Main St 1", notes: "Ring twice" })
        }
      })

      expect(submitCustomerDetails).toHaveBeenCalledWith({
        shipping_address: "Main St 1",
        notes: "Ring twice",
      })
    })

    test("is skipped for an invoice in a terminal status", () => {
      const { result } = renderModel({
        invoice: makeInvoice({ buyer_email: "", status: "expired", payments: [] }),
        store: makeStore({ email_required: true }),
      })

      expect(result.current.phase).toBe("status")
    })

    test("never exposes payment details before the gate is passed", () => {
      const { result } = renderModel({
        invoice: makeInvoice({ buyer_email: "", payments }),
        store: makeStore({ email_required: true, ask_address: true }),
      })

      const serialized = JSON.stringify(result.current)

      expect(serialized).not.toContain(address)
      expect(serialized).not.toContain(paymentUrl)
    })
  })

  describe("selection", () => {
    const btc = makePayment({ id: "method-btc", name: "BTC", payment_address: "bc1qbtc" })
    const ltc = makePayment({ id: "method-ltc", name: "LTC", payment_address: "ltc1qltc" })
    const eth = makePayment({ id: "method-eth", name: "ETH", payment_address: "0xeth" })

    describe("preselect", () => {
      test("starts on the first payment method", () => {
        const { result } = renderModel({ invoice: makeInvoice({ payments: [btc, ltc, eth] }) })

        expect(result.current).toMatchObject({
          phase: "payment",
          selectedMethodId: "method-btc",
          payment: { id: "method-btc", address: "bc1qbtc" },
        })
      })

      test("starts on the method a partial payment was already made with", () => {
        const { result } = renderModel({
          invoice: makeInvoice({ payments: [btc, ltc, eth], payment_id: "method-eth" }),
        })

        expect(result.current).toMatchObject({ phase: "payment", selectedMethodId: "method-eth" })
      })

      test("switches the active payment in place", () => {
        const { result } = renderModel({ invoice: makeInvoice({ payments: [btc, ltc, eth] }) })

        act(() => result.current.selectMethod("method-ltc"))

        expect(result.current).toMatchObject({
          phase: "payment",
          selectedMethodId: "method-ltc",
          payment: { id: "method-ltc", address: "ltc1qltc" },
        })
      })
    })

    describe("methods", () => {
      test.each([
        ["details", makeStore({ email_required: true }), "preselect"],
        ["select", makeStore(), "explicit"],
        ["payment", makeStore(), "preselect"],
      ] as const)("lists every method in the %s phase", (phase, store, selection) => {
        const { result } = renderModel(
          { invoice: makeInvoice({ buyer_email: "", payments: [btc, ltc] }), store },
          { selection },
        )

        expect(result.current).toMatchObject({
          phase,
          methods: [
            { id: "method-btc", name: "BTC", amount: btc.amount },
            { id: "method-ltc", name: "LTC", amount: ltc.amount },
          ],
        })
      })

      test("never carries an address or payment URL", () => {
        const { result } = renderModel(
          { invoice: makeInvoice({ payments: [btc, ltc] }) },
          { selection: "explicit" },
        )

        const serialized = JSON.stringify(result.current)

        expect(serialized).not.toContain(btc.payment_address)
        expect(serialized).not.toContain(ltc.payment_url)
      })
    })

    describe("across refetches", () => {
      const rerenderWith = (
        rerender: (props: { source: CheckoutSource; options: CheckoutModelOptions }) => void,
        payments: bitcartInvoices.InvoicePayment[],
      ) =>
        rerender({
          source: makeSource({ invoice: makeInvoice({ payments }) }),
          options: { selection: "preselect" },
        })

      test("keeps the chosen method when the list is reordered", () => {
        const { result, rerender } = renderModel({
          invoice: makeInvoice({ payments: [btc, ltc, eth] }),
        })

        act(() => result.current.selectMethod("method-ltc"))
        rerenderWith(rerender, [eth, ltc, btc])

        expect(result.current).toMatchObject({ selectedMethodId: "method-ltc" })
      })

      test("falls back to the default when the chosen method disappears", () => {
        const { result, rerender } = renderModel({
          invoice: makeInvoice({ payments: [btc, ltc, eth] }),
        })

        act(() => result.current.selectMethod("method-ltc"))
        rerenderWith(rerender, [eth, btc])

        expect(result.current).toMatchObject({ selectedMethodId: "method-eth" })
      })
    })

    describe("explicit", () => {
      test("asks for a method before showing payment details", () => {
        const { result } = renderModel(
          { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
          { selection: "explicit" },
        )

        expect(result.current.phase).toBe("select")
      })

      test("shows payment details for the chosen method", () => {
        const { result } = renderModel(
          { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
          { selection: "explicit" },
        )

        act(() => result.current.selectMethod("method-eth"))

        expect(result.current).toMatchObject({ phase: "payment", payment: { id: "method-eth" } })
      })

      test("offers no method change when there is a single method", () => {
        const { result } = renderModel({ invoice: makeInvoice({ payments: [btc] }) })

        expect(result.current.phase === "payment" && result.current.changeMethod).toBeUndefined()
      })

      test("skips the choice when there is a single method", () => {
        const { result } = renderModel(
          { invoice: makeInvoice({ payments: [btc] }) },
          { selection: "explicit" },
        )

        expect(result.current).toMatchObject({ phase: "payment", payment: { id: "method-btc" } })
      })

      test("skips the choice when a partial payment was already made", () => {
        const { result } = renderModel(
          { invoice: makeInvoice({ payments: [btc, ltc, eth], payment_id: "method-ltc" }) },
          { selection: "explicit" },
        )

        expect(result.current).toMatchObject({ phase: "payment", payment: { id: "method-ltc" } })
      })

      describe("changing the method", () => {
        const renderChosen = () => {
          const rendered = renderModel(
            { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
            { selection: "explicit" },
          )

          act(() => rendered.result.current.selectMethod("method-ltc"))

          return rendered
        }

        test("returns to the method choice", () => {
          const { result } = renderChosen()

          act(() => {
            if (result.current.phase === "payment") result.current.changeMethod?.()
          })

          expect(result.current.phase).toBe("select")
        })

        test("can be cancelled, restoring the previous method", () => {
          const { result } = renderChosen()

          act(() => {
            if (result.current.phase === "payment") result.current.changeMethod?.()
          })

          act(() => {
            if (result.current.phase === "select") result.current.cancelChange?.()
          })

          expect(result.current).toMatchObject({ phase: "payment", payment: { id: "method-ltc" } })
        })

        test("switches to the newly chosen method", () => {
          const { result } = renderChosen()

          act(() => {
            if (result.current.phase === "payment") result.current.changeMethod?.()
          })

          act(() => result.current.selectMethod("method-btc"))

          expect(result.current).toMatchObject({ phase: "payment", payment: { id: "method-btc" } })
        })
      })
    })
  })

  describe("resolved settings", () => {
    test.each([
      [true, 12, 12],
      [false, 12, null],
      [true, 0, null],
    ])(
      "with show_recommended_fee=%s and a fee of %i the recommended fee is %s",
      (show, fee, expected) => {
        const { result } = renderModel({
          invoice: makeInvoice({ payments: [makePayment({ recommended_fee: fee })] }),
          store: makeStore({ show_recommended_fee: show }),
        })

        expect(result.current).toMatchObject({ payment: { recommendedFee: expected } })
      },
    )

    test.each([true, false])("shows the powered-by badge only when the policy is %s", (allowed) => {
      const { result } = renderModel({
        policies: makePolicies({ allow_powered_by_bitcart: allowed }),
      })

      expect(result.current.branding.showPoweredBy).toBe(allowed)
    })

    test.each([
      ["https://example.com/logo.svg", "https://example.com/logo.svg"],
      ["", null],
    ])("resolves the custom logo %j to %j", (link, expected) => {
      const { result } = renderModel({ store: makeStore({ custom_logo_link: link }) })

      expect(result.current.branding.logoUrl).toBe(expected)
    })
  })

  describe("summary", () => {
    test("describes the invoice and store without the raw invoice", () => {
      const { result } = renderModel({
        invoice: makeInvoice({
          id: "invoice-42",
          price: "25.5",
          currency: "EUR",
          order_id: "order-7",
          redirect_url: "https://shop.example.com/thanks",
          buyer_email: "",
        }),
      })

      expect(result.current.invoice).toStrictEqual({
        id: "invoice-42",
        price: "25.5",
        currency: "EUR",
        orderId: "order-7",
        redirectUrl: "https://shop.example.com/thanks",
      })

      expect(result.current.store).toStrictEqual({ name: "Example Store" })
    })

    test("drops an empty redirect URL", () => {
      const { result } = renderModel({ invoice: makeInvoice({ redirect_url: "" }) })

      expect(result.current.invoice.redirectUrl).toBeNull()
    })
  })

  describe("countdown", () => {
    test("formats the time left on the invoice", () => {
      const { result } = renderModel({ invoice: makeInvoice({ time_left: 125 }) })

      expect(result.current.countdown).toMatchObject({ formatted: "02:05", isExpired: false })
    })
  })
})
