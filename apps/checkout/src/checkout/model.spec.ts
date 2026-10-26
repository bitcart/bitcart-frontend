import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { describe, expect, test, vi } from "vitest"

import {
  makeInvoice,
  makePayment,
  makePolicies,
  makeRefund,
  makeSource,
  makeStore,
} from "./fixtures"
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
      terminal: false,
      openedOnComplete: false,
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

        expect(derive()).toMatchObject({ phase: "status", status, exception: null })
      },
    )

    test("is status for a status this checkout doesn't recognise, instead of offering payment", () => {
      const { derive } = setup({ invoice: makeInvoice({ status: "unknown" }) })

      expect(derive()).toMatchObject({ phase: "status", status: "unknown" })
    })
  })

  describe("status exception", () => {
    const paid = (overrides: Partial<bitcartInvoices.Invoice>) =>
      setup({
        invoice: makeInvoice({ payment_id: "method-btc", sent_amount: "0.00150000", ...overrides }),
      }).derive()

    test("reports a payment that failed to confirm", () => {
      expect(paid({ status: "invalid", exception_status: "failed_confirm" })).toMatchObject({
        exception: { kind: "failedConfirm" },
      })
    })

    test("reports what was received before a partially paid invoice expired", () => {
      expect(
        paid({ status: "expired", exception_status: "paid_partial", sent_amount: "0.00050000" }),
      ).toMatchObject({
        exception: { kind: "expiredPartiallyPaid", paid: "0.00050000", total: "0.00150000" },
      })
    })

    test("reports nothing for an expired invoice that received no funds", () => {
      expect(paid({ status: "expired", payment_id: null, sent_amount: "0" })).toMatchObject({
        exception: null,
      })
    })

    test("reports an overpayment", () => {
      expect(
        paid({ status: "complete", exception_status: "paid_over", sent_amount: "0.00200000" }),
      ).toMatchObject({
        exception: { kind: "overpaid", paid: "0.00200000", total: "0.00150000", symbol: "btc" },
      })
    })

    test("ignores the overpaid flag on a zero-price invoice, which accepts any amount", () => {
      expect(
        paid({
          status: "complete",
          exception_status: "paid_over",
          payments: [makePayment({ amount: "0.00000000" })],
        }),
      ).toMatchObject({ exception: null })
    })
  })

  describe("lightning", () => {
    const BOLT11 = "lnbc432100n1pjexample"

    const lightningPayment = (overrides: Partial<bitcartInvoices.InvoicePayment> = {}) => {
      const model = setup({
        invoice: makeInvoice({
          payments: [
            makePayment({
              lightning: true,
              payment_address: BOLT11,
              payment_url: BOLT11,
              node_id: "03abc@203.0.113.7:9735",
              ...overrides,
            }),
          ],
        }),
      }).derive()

      if (model.phase !== "payment") {
        throw new Error(`Expected the payment phase, got "${model.phase}"`)
      } else return model.payment
    }

    test("opens wallets through a lightning: URI", () => {
      expect(lightningPayment().paymentUrl).toBe(`lightning:${BOLT11}`)
    })

    test("keeps a URI that already has the lightning: scheme", () => {
      expect(lightningPayment({ payment_url: `LIGHTNING:${BOLT11}` }).paymentUrl).toBe(
        `LIGHTNING:${BOLT11}`,
      )
    })

    test("encodes the QR code in uppercase, which BOLT11 allows", () => {
      expect(lightningPayment().qrValue).toBe(`LIGHTNING:${BOLT11.toUpperCase()}`)
    })

    test("carries the node to open a channel with", () => {
      expect(lightningPayment()).toMatchObject({
        address: BOLT11,
        nodeId: "03abc@203.0.113.7:9735",
      })
    })
  })

  describe("method labels", () => {
    const methodsFor = (label: string) => {
      const model = setup({
        invoice: makeInvoice({ payments: [makePayment({ name: label || "BTC", label })] }),
      }).derive()

      if (model.phase !== "payment") {
        throw new Error(`Expected the payment phase, got "${model.phase}"`)
      } else return model.methods
    }

    test("carries the merchant's custom label", () => {
      expect(methodsFor("Main store wallet")[0]).toMatchObject({
        name: "Main store wallet",
        label: "Main store wallet",
      })
    })

    test("treats the backend's empty label as no label", () => {
      expect(methodsFor("")[0]).toMatchObject({ name: "BTC", label: null })
    })
  })

  describe("method contracts", () => {
    const methodFor = (contract: string | null) => {
      const model = setup({
        invoice: makeInvoice({ payments: [makePayment({ contract })] }),
      }).derive()

      return model.methods[0]
    }

    test("carries a token's contract", () => {
      expect(methodFor("0xdac17f958d2ee523a2206206994597c13d831ec7")).toMatchObject({
        contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      })
    })

    test.each([
      ["empty", ""],
      ["missing", null],
    ])("treats a native coin's %s contract as no contract", (_case, contract) => {
      expect(methodFor(contract)).toMatchObject({ contract: null })
    })
  })

  describe("wallet pay", () => {
    const link = (id: string, url: string) => ({ id, name: id, url })

    const derivePayment = (payment: Partial<bitcartInvoices.InvoicePayment>) => {
      const model = setup({
        invoice: makeInvoice({ payments: [makePayment(payment)] }),
        policies: makePolicies({ explorer_urls: { btc: "https://explorer.example.com/tx/{}" } }),
      }).derive()

      if (model.phase === "payment") {
        return model.payment
      } else throw new Error(`Expected the payment phase, got ${model.phase}`)
    }

    test("offers the backend's links to open the checkout in a wallet app", () => {
      const payment = derivePayment({
        wallet: {
          network: "eip155:1",
          sender_address_required: false,
          links: [
            link("metamask", "https://link.metamask.io/dapp/checkout.example.com/i/invoice-1"),
            link("tronlink", "tronlinkoutside://pull.activity?param=%7B%7D"),
          ],
        },
      })

      expect(payment.walletLinks.map(({ id }) => id)).toStrictEqual(["metamask", "tronlink"])
    })

    test.each([
      ["a script", "javascript:alert(1)"],
      ["inline data", "data:text/html,<script>alert(1)</script>"],
      ["no URL at all", "not a url"],
    ])("drops a link to %s", (_case, url) => {
      const payment = derivePayment({
        wallet: { network: "eip155:1", sender_address_required: false, links: [link("bad", url)] },
      })

      expect(payment.walletLinks).toStrictEqual([])
    })

    test("links a transaction to the method's explorer", () => {
      expect(derivePayment({}).getTransactionUrl("abc")).toBe("https://explorer.example.com/tx/abc")
    })

    test("links no transaction without an explorer for the method", () => {
      expect(derivePayment({ currency: "xmr" }).getTransactionUrl("abc")).toBeNull()
    })
  })

  describe("partial payment", () => {
    const btc = makePayment({ id: "method-btc", name: "BTC" })

    const ltc = makePayment({
      id: "method-ltc",
      name: "LTC",
      amount: "1.25000000",
      due: "0.75000000",
      due_price: "60.00",
      payment_address: "ltc1qpartial",
      payment_url: "litecoin:ltc1qpartial?amount=1.25",
    })

    const partialInvoice = (overrides: Partial<bitcartInvoices.Invoice> = {}) =>
      makeInvoice({
        payments: [btc, ltc],
        payment_id: "method-ltc",
        exception_status: "paid_partial",
        sent_amount: "0.50000000",
        ...overrides,
      })

    test("asks only for the remainder, with its value", () => {
      const { derive } = setup({ invoice: partialInvoice() })

      expect(derive()).toMatchObject({
        phase: "payment",

        payment: {
          amount: "0.75000000",
          partial: { paid: "0.50000000", total: "1.25000000", remainingPrice: "60.00" },
        },
      })
    })

    test("lists each transfer received so far", () => {
      const { derive } = setup({
        invoice: partialInvoice({
          transactions: [
            { tx_hash: "tx-1", amount: "0.20000000" },
            { tx_hash: "tx-2", amount: "0.30000000" },
          ],
        }),
      })

      expect(derive()).toMatchObject({
        payment: {
          partial: {
            received: [
              { hash: "tx-1", amount: "0.20000000" },
              { hash: "tx-2", amount: "0.30000000" },
            ],
          },
        },
      })
    })

    test("lists no transfers when one's amount is unknown", () => {
      const { derive } = setup({
        invoice: partialInvoice({
          transactions: [
            { tx_hash: "tx-1", amount: "0.20000000" },
            { tx_hash: "tx-2", amount: null },
          ],
        }),
      })

      expect(derive()).toMatchObject({ payment: { partial: { received: [] } } })
    })

    test("passes the backend's payment URI through unchanged", () => {
      const { derive } = setup({ invoice: partialInvoice() })

      expect(derive()).toMatchObject({
        payment: {
          address: "ltc1qpartial",
          paymentUrl: "litecoin:ltc1qpartial?amount=1.25",
          qrValue: "litecoin:ltc1qpartial?amount=1.25",
        },
      })
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

  describe("amount breakdown", () => {
    const breakdownOf = (payment: Partial<bitcartInvoices.InvoicePayment>) => {
      const { derive } = setup({
        invoice: makeInvoice({ price: "100.00", payments: [makePayment(payment)] }),
      })

      const model = derive()

      return model.phase === "payment" ? model.payment.breakdown : undefined
    }

    test("is the order amount alone at full price", () => {
      expect(breakdownOf({ effective_price: "100.00" })).toStrictEqual({
        orderAmount: "0.00150000",
        price: "100.00",
        discount: null,
        networkCost: null,
      })
    })

    test("shows the discounted price, with the discount and the original price", () => {
      expect(
        breakdownOf({
          effective_price: "90.00",
          amount: "0.00135000",
          applied_discount: { name: "Autumn sale", percent: 10 },
        }),
      ).toMatchObject({
        orderAmount: "0.00135000",
        price: "90.00",
        discount: { name: "Autumn sale", percent: 10, originalPrice: "100.00" },
      })
    })

    test("ignores a discount that leaves this method's price unchanged", () => {
      expect(
        breakdownOf({
          effective_price: "100.00",
          applied_discount: { name: "Autumn sale", percent: 0 },
        }),
      ).toMatchObject({ price: "100.00", discount: null })
    })

    test("separates the network fee from the order amount", () => {
      expect(
        breakdownOf({
          effective_price: "100.00",
          amount: "0.00151000",
          subtotal: "0.00150000",
          network_fee: "0.00001000",
        }),
      ).toMatchObject({ orderAmount: "0.00150000", networkCost: "0.00001000" })
    })
  })

  describe("any amount", () => {
    const anyAmount = (overrides: Partial<bitcartInvoices.Invoice> = {}) =>
      setup({
        invoice: makeInvoice({
          price: "0.00",

          payments: [
            makePayment({
              amount: "0.00000000",
              effective_price: "0.00",
              payment_url: "bitcoin:bc1qany",
            }),
          ],

          ...overrides,
        }),
      }).derive()

    test("marks a zero-price invoice", () => {
      expect(anyAmount().invoice.isAnyAmount).toBe(true)
      expect(setup().derive().invoice.isAnyAmount).toBe(false)
    })

    test("has no breakdown, but keeps the wallet link that lets the wallet pick the amount", () => {
      expect(anyAmount()).toMatchObject({
        payment: { breakdown: null, paymentUrl: "bitcoin:bc1qany", rate: "66666.67" },
      })
    })

    test("reports what was received once complete, with its value", () => {
      expect(
        anyAmount({
          status: "complete",
          exception_status: "paid_over",
          payment_id: "method-btc",
          sent_amount: "0.00420000",
          sent_price: "280.00",
        }),
      ).toMatchObject({
        received: { amount: "0.00420000", symbol: "btc", price: "280.00" },
        exception: null,
      })
    })

    test("reports nothing received for an invoice that expired unpaid", () => {
      expect(anyAmount({ status: "expired" })).toMatchObject({ received: null })
    })
  })

  describe("receipt", () => {
    const TX_HASH = "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"

    const paidInvoice = (overrides: Partial<bitcartInvoices.Invoice> = {}) =>
      makeInvoice({
        status: "complete",
        paid_date: "2026-09-24T10:06:00+00:00",
        payment_id: "method-btc",
        sent_amount: "0.00150000",
        sent_price: "100.00",
        tx_hashes: [TX_HASH],
        transactions: [{ tx_hash: TX_HASH, amount: "0.00150000" }],
        ...overrides,
      })

    const receiptOf = (source: Partial<CheckoutSource>) => {
      const model = setup(source).derive()

      if (model.phase !== "status") {
        throw new Error(`Expected the status phase, got "${model.phase}"`)
      } else return model.receipt
    }

    test("describes a paid invoice", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({
            products: ["product-1"],
            product_names: { "product-1": "Socks" },
            product_quantities: { "product-1": 2 },
          }),
        }),
      ).toStrictEqual({
        createdAt: "2026-09-24T10:00:00+00:00",
        paidAt: "2026-09-24T10:06:00+00:00",
        items: [{ id: "product-1", name: "Socks", quantity: 2 }],
        total: "100",
        discount: null,
        amountPaid: "100.00",

        payment: {
          name: "BTC",
          symbol: "btc",
          lightning: false,
          rate: "66666.67",
          amount: "0.00150000",
          networkCost: null,

          transactions: [
            {
              hash: TX_HASH,
              amount: "0.00150000",
              explorerUrl: `https://explorer.example.com/tx/${TX_HASH}`,
            },
          ],
        },

        refund: null,
      })
    })

    test.each([
      ["expired unpaid", { status: "expired" }],
      ["invalid unpaid", { status: "invalid" }],
      ["unknown unpaid", { status: "unknown" }],
    ] as const)("is absent for an invoice %s", (_name, overrides) => {
      expect(receiptOf({ invoice: makeInvoice(overrides) })).toBeNull()
    })

    test("covers the funds received before an invoice expired", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({
            status: "expired",
            paid_date: null,
            exception_status: "paid_partial",
            sent_amount: "0.00050000",
          }),
        }),
      ).toMatchObject({ paidAt: null, payment: { amount: "0.00050000" } })
    })

    test("exists without payment details for an invoice completed without a payment", () => {
      expect(receiptOf({ invoice: makeInvoice({ status: "complete" }) })).toMatchObject({
        total: "100",
        payment: null,
      })
    })

    test("shows the discount and the network cost of the paid method", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({
            price: "100.00",
            effective_price: "90.00",

            payments: [
              makePayment({
                effective_price: "90.00",
                applied_discount: { name: "Autumn sale", percent: 10 },
                network_fee: "0.00002000",
              }),
            ],
          }),
        }),
      ).toMatchObject({
        total: "90.00",
        discount: { name: "Autumn sale", percent: 10, originalPrice: "100.00" },
        payment: { networkCost: "0.00002000" },
      })
    })

    test("totals what was received on a zero-price invoice", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({
            price: "0.00",
            effective_price: "0.00",
            sent_price: "280.00",
            payments: [makePayment({ effective_price: "0.00", network_fee: "0.00002000" })],
          }),
        }),
      ).toMatchObject({ total: "280.00", discount: null, payment: { networkCost: null } })
    })

    test("keeps a transaction whose amount the API doesn't know", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({
            tx_hashes: ["tx-1", "tx-2"],

            transactions: [
              { tx_hash: "tx-1", amount: null },
              { tx_hash: "tx-2", amount: "0.00050000" },
            ],
          }),
        }),
      ).toMatchObject({
        payment: {
          transactions: [
            { hash: "tx-1", amount: null },
            { hash: "tx-2", amount: "0.00050000" },
          ],
        },
      })
    })

    test.each<[string, Partial<bitcartInvoices.Invoice>, Parameters<typeof makePolicies>[0]]>([
      ["a Lightning payment", { payments: [makePayment({ lightning: true })] }, {}],
      ["a coin without an explorer", {}, { explorer_urls: { btc: "" } }],
      ["a non-http explorer", {}, { explorer_urls: { btc: "javascript:alert('{}')" } }],
    ])("links no explorer for %s", (_name, invoiceOverrides, policyOverrides) => {
      expect(
        receiptOf({
          invoice: paidInvoice(invoiceOverrides),
          policies: makePolicies(policyOverrides),
        })?.payment?.transactions,
      ).toStrictEqual([{ hash: TX_HASH, amount: "0.00150000", explorerUrl: null }])
    })

    test("has nothing paid for an invoice completed without a payment", () => {
      expect(receiptOf({ invoice: makeInvoice({ status: "complete" }) })?.amountPaid).toBeNull()
    })

    test("reports an overpayment as paid above the total", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({ exception_status: "paid_over", sent_price: "120.00" }),
        }),
      ).toMatchObject({ total: "100", amountPaid: "120.00" })
    })

    test("describes a sent refund, linking its transaction through the payout's coin", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({ status: "refunded", refund_id: "refund-1" }),

          refund: makeRefund({
            amount: "40.00",
            payout_status: "complete",
            tx_hash: "refund-tx",
            wallet_currency: "btc",
          }),
        })?.refund,
      ).toStrictEqual({
        id: "refund-1",
        amount: "40.00",
        currency: "USD",
        createdAt: "2026-09-25T09:00:00+00:00",
        status: "sent",

        transaction: {
          hash: "refund-tx",
          explorerUrl: "https://explorer.example.com/tx/refund-tx",
        },
      })
    })

    test.each([
      [null, "unclaimed"],
      ["pending", "pending"],
      ["approved", "pending"],
      ["sent", "sent"],
      ["cancelled", "failed"],
      ["failed", "failed"],
      ["unrecognised", "pending"],
    ] as const)("reports a refund whose payout is %s as %s", (payout_status, status) => {
      expect(
        receiptOf({
          invoice: paidInvoice({ refund_id: "refund-1" }),
          refund: makeRefund({ payout_status }),
        })?.refund,
      ).toMatchObject({ status, transaction: null })
    })

    test("lists named products, a single one when no quantity is given", () => {
      expect(
        receiptOf({
          invoice: paidInvoice({
            products: ["product-1", "product-2"],
            product_names: { "product-1": "Socks" },
            product_quantities: {},
          }),
        })?.items,
      ).toStrictEqual([{ id: "product-1", name: "Socks", quantity: 1 }])
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

  describe("sender address gate", () => {
    const merchantAddress = "0xmerchant"
    const sender = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    const wallet = { network: "eip155:1", sender_address_required: true, links: [] }

    const eth = makePayment({
      id: "method-eth",
      payment_address: merchantAddress,
      payment_url: `ethereum:${merchantAddress}@1`,
      wallet,
    })

    const btc = makePayment({ id: "method-btc" })

    test("asks for the address a method credits payments from", () => {
      const { derive } = setup({ invoice: makeInvoice({ payments: [eth] }) })

      expect(derive()).toMatchObject({
        phase: "address",
        selectedMethodId: "method-eth",
        method: { id: "method-eth", network: "eip155:1" },
      })
    })

    test("is skipped for a method that needs no sender address", () => {
      const pluginEth = makePayment({
        ...eth,
        wallet: { ...wallet, sender_address_required: false },
        user_address: "unused",
      })

      const { derive } = setup({ invoice: makeInvoice({ payments: [pluginEth] }) })

      expect(derive()).toMatchObject({ phase: "payment", payment: { senderAddress: null } })
    })

    test("is skipped for a payment without wallet details", () => {
      const { derive } = setup({ invoice: makeInvoice({ payments: [{ ...eth, wallet: null }] }) })

      expect(derive()).toMatchObject({ phase: "payment", payment: { network: null } })
    })

    test("advances to payment once the refetched invoice has the address", () => {
      const { derive } = setup({ invoice: makeInvoice({ payments: [eth] }) })
      const addressed = makeInvoice({ payments: [{ ...eth, user_address: sender }] })

      expect(derive({ invoice: addressed })).toMatchObject({
        phase: "payment",
        payment: { senderAddress: sender },
      })
    })

    test("comes after the method choice", () => {
      const { derive } = setup(
        { invoice: makeInvoice({ payments: [btc, eth] }) },
        { selection: "explicit" },
      )

      expect(derive().phase).toBe("select")

      derive().selectMethod("method-eth")

      expect(derive().phase).toBe("address")
    })

    test("lets the buyer change to a method that needs no address", () => {
      const { derive } = setup({ invoice: makeInvoice({ payments: [eth, btc] }) })
      const model = derive()

      if (model.phase === "address") model.changeMethod?.()

      expect(derive().phase).toBe("select")
    })

    test("submits the address for the selected method", async () => {
      const submitSenderAddress = vi.fn(() => Promise.resolve("accepted" as const))
      const { derive } = setup({ invoice: makeInvoice({ payments: [eth] }), submitSenderAddress })
      const model = derive()

      if (model.phase === "address") await model.submitAddress(sender)

      expect(submitSenderAddress).toHaveBeenCalledWith("method-eth", sender)
    })

    test("never exposes payment details before the gate is passed", () => {
      const { derive } = setup({ invoice: makeInvoice({ payments: [eth] }) })
      const serialized = JSON.stringify(derive())

      expect(serialized).not.toContain(merchantAddress)
    })

    describe("ETH plugin offer", () => {
      const offerFor = (
        policies: Partial<CheckoutSource["policies"]> = {},
        context: Partial<CheckoutDeriveContext> = {},
      ) => {
        const model = setup(
          { invoice: makeInvoice({ payments: [eth] }), policies: makePolicies(policies) },
          context,
        ).derive()

        return model.phase === "address" ? model.ethPluginOffer : null
      }

      test("links to buying the plugin in the admin panel", () => {
        expect(offerFor({ admin_url: "https://admin.example.com/" })).toMatchObject({
          buyUrl:
            "https://admin.example.com/plugins?plugin_id=ZIDVfTVxDWQLKyhYiqifyNkhcvfufUKm&action=buy",
          isShown: false,
        })
      })

      test("has no buy link without a web admin URL", () => {
        expect(offerFor({ admin_url: "" })).toMatchObject({ buyUrl: null })
      })

      test("is absent when the server hides it", () => {
        expect(offerFor({ allow_eth_plugin_info: false })).toBeUndefined()
      })

      test("is absent on a terminal", () => {
        expect(offerFor({}, { terminal: true })).toBeUndefined()
      })

      test("opens and closes through the control", () => {
        const { derive } = setup({ invoice: makeInvoice({ payments: [eth] }) })
        const model = derive()

        if (model.phase === "address") model.ethPluginOffer?.show()

        expect(derive()).toMatchObject({ ethPluginOffer: { isShown: true } })

        const shown = derive()

        if (shown.phase === "address") shown.ethPluginOffer?.hide()

        expect(derive()).toMatchObject({ ethPluginOffer: { isShown: false } })
      })
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
      [true, "12", "12"],
      [true, "1.5", "1.5"],
      [false, "12", null],
      [true, "0", null],
    ])(
      "with show_recommended_fee=%s and a fee of %s the recommended fee is %s",
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

    describe("brand", () => {
      const LIGHT_LOGO = "https://example.com/logo-light.svg"
      const DARK_LOGO = "https://example.com/logo-dark.svg"
      const ICON = "https://example.com/icon.svg"

      test.each([
        ["light", { light: LIGHT_LOGO, dark: DARK_LOGO }, { url: LIGHT_LOGO, backdrop: null }],
        ["dark", { light: LIGHT_LOGO, dark: DARK_LOGO }, { url: DARK_LOGO, backdrop: null }],
        ["dark", { light: LIGHT_LOGO }, { url: LIGHT_LOGO, backdrop: "light" }],
        ["light", { dark: DARK_LOGO }, { url: DARK_LOGO, backdrop: "dark" }],
      ] as const)("in %s mode resolves the logos %o to %o", (mode, logos, logo) => {
        const { derive } = setup({ appearance: { logos } }, { mode })

        expect(derive().branding.brand).toStrictEqual({ kind: "logo", logo, showsName: false })
      })

      test("puts an icon made for the other mode on a backdrop of that mode", () => {
        const { derive } = setup({ appearance: { icons: { light: ICON } } }, { mode: "dark" })

        expect(derive().branding.brand).toStrictEqual({
          kind: "icon",
          icon: { url: ICON, backdrop: "light" },
          showsName: true,
        })
      })

      test.each([
        [{ logos: { light: LIGHT_LOGO }, icons: { light: ICON } }, "icon"],
        [
          { logos: { light: LIGHT_LOGO }, icons: { light: ICON }, useLogoInsteadOfIcon: true },
          "logo",
        ],
        [{ icons: { light: ICON }, useLogoInsteadOfIcon: true }, "icon"],
        [{ logos: {}, icons: {} }, "bitcart"],
      ] as const)("resolves the appearance %o to the %s", (appearance, kind) => {
        const { derive } = setup({ appearance })

        expect(derive().branding.brand.kind).toBe(kind)
      })

      test.each([
        [{}, false],
        [{ useLogoInsteadOfIcon: true }, true],
      ])("treats the logo as showing the store's name with %o", (settings, showsName) => {
        const { derive } = setup({ appearance: { logos: { light: LIGHT_LOGO }, ...settings } })

        expect(derive().branding.brand).toMatchObject({ kind: "logo", showsName })
      })

      test.each([
        [false, { url: LIGHT_LOGO, backdrop: null }],
        [true, { url: LIGHT_LOGO, backdrop: "dark" }],
      ] as const)(
        "assigns the store's custom logo to the mode set by use_dark_mode=%s",
        (useDarkMode, logo) => {
          const { derive } = setup({
            store: makeStore({ custom_logo_link: LIGHT_LOGO, use_dark_mode: useDarkMode }),
          })

          expect(derive().branding.brand).toStrictEqual({ kind: "logo", logo, showsName: false })
        },
      )

      test("shows the Bitcart wordmark when the store has no custom logo", () => {
        const { derive } = setup({ store: makeStore({ custom_logo_link: "" }) })

        expect(derive().branding.brand).toStrictEqual({ kind: "bitcart", showsName: false })
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
          created: "2026-09-24T10:00:00+00:00",
          time_left: 125,
        }),
      })

      expect(derive().invoice).toStrictEqual({
        id: "invoice-42",
        price: "25.5",
        effectivePrice: "25.5",
        currency: "EUR",
        orderId: "order-7",
        redirectUrl: "https://shop.example.com/thanks",
        isAnyAmount: false,
        timeLeft: 125,
        expirationSeconds: 900,
        expiresAt: "2026-09-24T10:15:00.000Z",
      })

      expect(derive().store).toStrictEqual({ name: "Example Store", support: null })
    })

    test.each([
      [
        { support_email: "help@example.com", support_url: "" },
        {
          kind: "email",
          address: "help@example.com",
          href: "mailto:help@example.com?subject=Invoice%20invoice-1",
        },
      ],
      [
        { support_email: "help@example.com", support_url: "https://help.example.com" },
        { kind: "url", href: "https://help.example.com" },
      ],
      [
        { support_email: "", support_url: "//help.example.com" },
        { kind: "url", href: "//help.example.com" },
      ],
      [{ support_email: "", support_url: "javascript:alert(1)" }, null],
    ] as const)("resolves the store's support settings %o to %o", (settings, expected) => {
      const { derive } = setup({ store: makeStore(settings) })

      expect(derive().store.support).toStrictEqual(expected)
    })

    test.each(["", "javascript:alert(1)", "shop.example.com"])(
      "drops the redirect URL %o, which isn't a web address",
      (redirectUrl) => {
        const { derive } = setup({ invoice: makeInvoice({ redirect_url: redirectUrl }) })

        expect(derive().invoice.redirectUrl).toBeNull()
      },
    )
  })

  describe("isCompletedLive", () => {
    const isCompletedLiveOf = (model: CheckoutModel) =>
      model.phase === "status" ? model.isCompletedLive : undefined

    test.each([
      { name: "a completion seen live", status: "complete", context: {}, expected: true },

      {
        name: "a page opened on a complete invoice",
        status: "complete",
        context: { openedOnComplete: true },
        expected: false,
      },

      { name: "a refunded invoice", status: "refunded", context: {}, expected: false },
      { name: "an expired invoice", status: "expired", context: {}, expected: false },
    ] as const)("is $expected for $name", ({ status, context, expected }) => {
      const { derive } = setup({ invoice: makeInvoice({ status }) }, context)

      expect(isCompletedLiveOf(derive())).toBe(expected)
    })
  })

  describe("redirect", () => {
    const completeInvoice = (overrides: Parameters<typeof makeInvoice>[0] = {}) =>
      makeInvoice({
        status: "complete",
        redirect_url: "https://shop.example.com/thanks",
        ...overrides,
      })

    const cancelRedirectOf = (model: CheckoutModel) =>
      model.phase === "status" ? model.cancelRedirect : undefined

    test.each([
      ["a completion seen live", {}],
      ["an overpaid completion seen live", { exception_status: "paid_over" }],
    ] as const)("counts down after %s", (_case, invoice) => {
      const { derive } = setup({ invoice: completeInvoice(invoice) })

      expect(cancelRedirectOf(derive())).toBeTypeOf("function")
    })

    test.each([
      ["a page opened on a complete invoice", {}, { openedOnComplete: true }],
      ["a terminal", {}, { terminal: true }],
      ["an invoice without a redirect URL", { redirect_url: "" }, {}],
      ["a refunded invoice", { status: "refunded" }, {}],
      ["an expired invoice", { status: "expired" }, {}],
      ["an invalid invoice", { status: "invalid" }, {}],
    ] as const)("doesn't count down on %s", (_case, invoice, context) => {
      const { derive } = setup({ invoice: completeInvoice(invoice) }, context)

      expect(cancelRedirectOf(derive())).toBeUndefined()
    })

    test.each([
      [false, "undefined"],
      [true, "function"],
    ] as const)("follows the store's auto_redirect setting %o", (autoRedirect, expected) => {
      const { derive } = setup({
        invoice: completeInvoice(),
        store: makeStore({ auto_redirect: autoRedirect }),
      })

      expect(cancelRedirectOf(derive())).toBeTypeOf(expected)
    })

    test("stops counting down once cancelled", () => {
      const { derive } = setup({ invoice: completeInvoice() })

      cancelRedirectOf(derive())?.()

      expect(cancelRedirectOf(derive())).toBeUndefined()
    })
  })
})
