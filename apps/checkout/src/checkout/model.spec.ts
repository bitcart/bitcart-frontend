import type { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import { describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment, makePolicies, makeSource, makeStore } from "./fixtures"
import {
  deriveCheckoutModel,
  type CheckoutDeriveContext,
  type CheckoutModel,
  type CheckoutSource,
} from "./model"
import { createCheckoutControl } from "./runtime/control-store"

//* `derive` reads the control's current state, as the view does after every action.
const setup = (
  source: Partial<CheckoutSource> = {},
  context: Partial<CheckoutDeriveContext> = {},
) => {
  const control = createCheckoutControl()

  const derive = (current: Partial<CheckoutSource> = source) =>
    deriveCheckoutModel(makeSource(current), control.state, control.actions, {
      selection: "preselect",
      mode: "light",
      ...context,
    })

  return { control, derive }
}

describe("deriveCheckoutModel", () => {
  describe("phase", () => {
    test.each(["complete", "expired", "invalid", "refunded"] as const)(
      "is status once the invoice is %s",
      (status) => {
        const { derive } = setup({ invoice: makeInvoice({ status }) })

        expect(derive()).toMatchObject({ phase: "status", status })
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
      const { derive } = setup({ invoice: partialInvoice() })

      expect(derive()).toMatchObject({
        phase: "payment",
        payment: { amount: "0.75000000", partial: { paid: "0.50000000", total: "1.25000000" } },
      })
    })

    test("drops the payment URI that still encodes the full amount", () => {
      const { derive } = setup({ invoice: partialInvoice() })

      expect(derive()).toMatchObject({
        payment: { address: "ltc1qpartial", paymentUrl: null },
      })

      expect(JSON.stringify(derive())).not.toContain("litecoin:")
    })

    test.each([
      ["0.30000000", 0.1, 8, "0.20000000"],
      ["0.012345678901234567", 0.002, 18, "0.010345678901234567"],
      ["1.00000000", 1.5, 8, "0.00000000"],
    ])("subtracts %s − %s exactly at %i decimals", (amount, sentAmount, divisibility, expected) => {
      const { derive } = setup({
        invoice: partialInvoice({
          sent_amount: sentAmount,
          payments: [{ ...ltc, amount, divisibility }],
        }),
      })

      expect(derive()).toMatchObject({ payment: { amount: expected } })
    })

    test("locks the checkout to the method that received the funds", () => {
      const { derive } = setup({ invoice: partialInvoice() }, { selection: "explicit" })

      derive().selectMethod("method-btc")

      const model = derive()

      expect(model).toMatchObject({
        phase: "payment",
        methods: [{ id: "method-ltc" }],
        payment: { id: "method-ltc" },
      })

      expect(model.phase === "payment" && model.changeMethod).toBeUndefined()
    })
  })

  describe("payment detected", () => {
    test.each(["paid", "unconfirmed", "confirmed"] as const)(
      "waits for confirmations once the invoice is %s, without payment details",
      (status) => {
        const { derive } = setup({
          invoice: makeInvoice({
            status,
            buyer_email: "",
            payment_id: "method-btc",
            payments: [makePayment({ confirmations: 1 })],
          }),
          store: makeStore({ email_required: true, transaction_speed: 3 }),
        })

        expect(derive()).toMatchObject({
          phase: "confirming",
          confirmations: { received: 1, required: 3 },
        })

        expect(JSON.stringify(derive())).not.toContain("bc1qexampleaddress")
      },
    )
  })

  describe("unavailable", () => {
    test("is unavailable when an open invoice has no payment methods", () => {
      const { derive } = setup({ invoice: makeInvoice({ payments: [] }) })

      expect(derive().phase).toBe("unavailable")
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
      const { derive } = setup({
        invoice: makeInvoice({ buyer_email: "", shipping_address: "", payments }),
        store: makeStore(settings),
      })

      expect(derive()).toMatchObject({ phase: "details", details: { fields } })
    })

    test("leaves out notes the invoice already has, as they can be set only once", () => {
      const { derive } = setup({
        invoice: makeInvoice({ shipping_address: "", notes: "Leave at the door", payments }),
        store: makeStore({ email_required: false, ask_address: true }),
      })

      expect(derive()).toMatchObject({ phase: "details", details: { fields: ["address"] } })
    })

    test("advances to payment once the refetched invoice includes the details", () => {
      const store = makeStore({ email_required: true })
      const { derive } = setup({ invoice: makeInvoice({ buyer_email: "" }), store })

      expect(derive({ invoice: makeInvoice({ buyer_email: "a@b.co" }), store }).phase).toBe(
        "payment",
      )
    })

    test("submits only the details the store asks for", async () => {
      const submitCustomerDetails = vi.fn(() => Promise.resolve())

      const { derive } = setup({
        invoice: makeInvoice({ buyer_email: "" }),
        store: makeStore({ email_required: true }),
        submitCustomerDetails,
      })

      const model = derive()

      if (model.phase === "details") {
        await model.details.submit({ email: "a@b.co", address: "Main St 1" })
      }

      expect(submitCustomerDetails).toHaveBeenCalledWith({ buyer_email: "a@b.co" })
    })

    test("submits notes together with the shipping address", async () => {
      const submitCustomerDetails = vi.fn(() => Promise.resolve())

      const { derive } = setup({
        invoice: makeInvoice({ shipping_address: "", notes: "" }),
        store: makeStore({ email_required: false, ask_address: true }),
        submitCustomerDetails,
      })

      const model = derive()

      if (model.phase === "details") {
        await model.details.submit({ address: "Main St 1", notes: "Ring twice" })
      }

      expect(submitCustomerDetails).toHaveBeenCalledWith({
        shipping_address: "Main St 1",
        notes: "Ring twice",
      })
    })

    test("is skipped for an invoice in a terminal status", () => {
      const { derive } = setup({
        invoice: makeInvoice({ buyer_email: "", status: "expired", payments: [] }),
        store: makeStore({ email_required: true }),
      })

      expect(derive().phase).toBe("status")
    })

    test("never exposes payment details before the gate is passed", () => {
      const { derive } = setup({
        invoice: makeInvoice({ buyer_email: "", payments }),
        store: makeStore({ email_required: true, ask_address: true }),
      })

      const serialized = JSON.stringify(derive())

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
        const { derive } = setup({ invoice: makeInvoice({ payments: [btc, ltc, eth] }) })

        expect(derive()).toMatchObject({
          phase: "payment",
          selectedMethodId: "method-btc",
          payment: { id: "method-btc", address: "bc1qbtc" },
        })
      })

      test("starts on the method a partial payment was already made with", () => {
        const { derive } = setup({
          invoice: makeInvoice({ payments: [btc, ltc, eth], payment_id: "method-eth" }),
        })

        expect(derive()).toMatchObject({ phase: "payment", selectedMethodId: "method-eth" })
      })

      test("switches the active payment in place", () => {
        const { derive } = setup({ invoice: makeInvoice({ payments: [btc, ltc, eth] }) })

        derive().selectMethod("method-ltc")

        expect(derive()).toMatchObject({
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
        const { derive } = setup(
          { invoice: makeInvoice({ buyer_email: "", payments: [btc, ltc] }), store },
          { selection },
        )

        expect(derive()).toMatchObject({
          phase,
          methods: [
            { id: "method-btc", name: "BTC", amount: btc.amount },
            { id: "method-ltc", name: "LTC", amount: ltc.amount },
          ],
        })
      })

      test("never carries an address or payment URL", () => {
        const { derive } = setup(
          { invoice: makeInvoice({ payments: [btc, ltc] }) },
          { selection: "explicit" },
        )

        const serialized = JSON.stringify(derive())

        expect(serialized).not.toContain(btc.payment_address)
        expect(serialized).not.toContain(ltc.payment_url)
      })
    })

    describe("across refetches", () => {
      const refetched = (payments: bitcartInvoices.InvoicePayment[]) => ({
        invoice: makeInvoice({ payments }),
      })

      test("keeps the chosen method when the list is reordered", () => {
        const { derive } = setup(refetched([btc, ltc, eth]))

        derive().selectMethod("method-ltc")

        expect(derive(refetched([eth, ltc, btc]))).toMatchObject({ selectedMethodId: "method-ltc" })
      })

      test("falls back to the default when the chosen method disappears", () => {
        const { derive } = setup(refetched([btc, ltc, eth]))

        derive().selectMethod("method-ltc")

        expect(derive(refetched([eth, btc]))).toMatchObject({ selectedMethodId: "method-eth" })
      })
    })

    describe("explicit", () => {
      test("asks for a method before showing payment details", () => {
        const { derive } = setup(
          { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
          { selection: "explicit" },
        )

        expect(derive().phase).toBe("select")
      })

      test("shows payment details for the chosen method", () => {
        const { derive } = setup(
          { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
          { selection: "explicit" },
        )

        derive().selectMethod("method-eth")

        expect(derive()).toMatchObject({ phase: "payment", payment: { id: "method-eth" } })
      })

      test("offers no method change when there is a single method", () => {
        const { derive } = setup({ invoice: makeInvoice({ payments: [btc] }) })
        const model = derive()

        expect(model.phase === "payment" && model.changeMethod).toBeUndefined()
      })

      test("ignores a method change requested by a host when there is a single method", () => {
        const { control, derive } = setup({ invoice: makeInvoice({ payments: [btc] }) })

        control.actions.changeMethod()

        expect(derive()).toMatchObject({ phase: "payment", payment: { id: "method-btc" } })
      })

      test("skips the choice when there is a single method", () => {
        const { derive } = setup(
          { invoice: makeInvoice({ payments: [btc] }) },
          { selection: "explicit" },
        )

        expect(derive()).toMatchObject({ phase: "payment", payment: { id: "method-btc" } })
      })

      test("skips the choice when a partial payment was already made", () => {
        const { derive } = setup(
          { invoice: makeInvoice({ payments: [btc, ltc, eth], payment_id: "method-ltc" }) },
          { selection: "explicit" },
        )

        expect(derive()).toMatchObject({ phase: "payment", payment: { id: "method-ltc" } })
      })

      describe("changing the method", () => {
        const setupChosen = () => {
          const chosen = setup(
            { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
            { selection: "explicit" },
          )

          chosen.derive().selectMethod("method-ltc")

          return chosen
        }

        const changeMethod = (model: CheckoutModel) => {
          if (model.phase === "payment") model.changeMethod?.()
        }

        test("returns to the method choice", () => {
          const { derive } = setupChosen()

          changeMethod(derive())

          expect(derive().phase).toBe("select")
        })

        test("can be cancelled, restoring the previous method", () => {
          const { derive } = setupChosen()

          changeMethod(derive())

          const choosing = derive()

          if (choosing.phase === "select") choosing.cancelChange?.()

          expect(derive()).toMatchObject({ phase: "payment", payment: { id: "method-ltc" } })
        })

        test("switches to the newly chosen method", () => {
          const { derive } = setupChosen()

          changeMethod(derive())
          derive().selectMethod("method-btc")

          expect(derive()).toMatchObject({ phase: "payment", payment: { id: "method-btc" } })
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
        const { derive } = setup({
          invoice: makeInvoice({ payments: [makePayment({ recommended_fee: fee })] }),
          store: makeStore({ show_recommended_fee: show }),
        })

        expect(derive()).toMatchObject({ payment: { recommendedFee: expected } })
      },
    )

    test.each([true, false])("shows the powered-by badge only when the policy is %s", (allowed) => {
      const { derive } = setup({
        policies: makePolicies({ allow_powered_by_bitcart: allowed }),
      })

      expect(derive().branding.showPoweredBy).toBe(allowed)
    })

    describe("logo", () => {
      const LIGHT_LOGO = "https://example.com/logo-light.svg"
      const DARK_LOGO = "https://example.com/logo-dark.svg"

      test.each([
        ["light", { light: LIGHT_LOGO, dark: DARK_LOGO }, { url: LIGHT_LOGO, backdrop: null }],
        ["dark", { light: LIGHT_LOGO, dark: DARK_LOGO }, { url: DARK_LOGO, backdrop: null }],
        ["dark", { light: LIGHT_LOGO }, { url: LIGHT_LOGO, backdrop: "light" }],
        ["light", { dark: DARK_LOGO }, { url: DARK_LOGO, backdrop: "dark" }],
        ["light", {}, null],
      ] as const)("in %s mode resolves the logos %o to %o", (mode, logos, expected) => {
        const { derive } = setup({ appearance: { logos } }, { mode })

        expect(derive().branding.logo).toStrictEqual(expected)
      })

      test.each([
        [false, { url: LIGHT_LOGO, backdrop: null }],
        [true, { url: LIGHT_LOGO, backdrop: "dark" }],
      ] as const)(
        "assigns the store's custom logo to the mode set by use_dark_mode=%s",
        (useDarkMode, expected) => {
          const { derive } = setup({
            store: makeStore({ custom_logo_link: LIGHT_LOGO, use_dark_mode: useDarkMode }),
          })

          expect(derive().branding.logo).toStrictEqual(expected)
        },
      )

      test("shows no logo when the store has no custom logo", () => {
        const { derive } = setup({ store: makeStore({ custom_logo_link: "" }) })

        expect(derive().branding.logo).toBeNull()
      })
    })
  })

  describe("summary", () => {
    test("describes the invoice and store without the raw invoice", () => {
      const { derive } = setup({
        invoice: makeInvoice({
          id: "invoice-42",
          price: "25.5",
          currency: "EUR",
          order_id: "order-7",
          redirect_url: "https://shop.example.com/thanks",
          buyer_email: "",
          time_left: 125,
        }),
      })

      expect(derive().invoice).toStrictEqual({
        id: "invoice-42",
        price: "25.5",
        currency: "EUR",
        orderId: "order-7",
        redirectUrl: "https://shop.example.com/thanks",
        timeLeft: 125,
      })

      expect(derive().store).toStrictEqual({ name: "Example Store" })
    })

    test("drops an empty redirect URL", () => {
      const { derive } = setup({ invoice: makeInvoice({ redirect_url: "" }) })

      expect(derive().invoice.redirectUrl).toBeNull()
    })
  })
})
