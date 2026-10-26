import { fireEvent, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import { CheckoutFooter } from "../parts/footer"
import { SenderAddressForm } from "../parts/sender-address-form"
import { renderCheckout } from "../testing/render-checkout"
import { ExtensionSlot } from "./slot"
import {
  defineExtensionSlotContribution,
  type ExtensionSlotContribution,
} from "./slot-contributions"

const PaymentScreen = () => (
  <>
    <p>Pay with BTC</p>
    <ExtensionSlot name="checkout:payment-extra" />
  </>
)

const textContribution = (pluginId: string, text: string, options: { order?: number } = {}) =>
  defineExtensionSlotContribution({
    pluginId,
    slot: "checkout:payment-extra",
    ...options,
    load: () => Promise.resolve({ default: () => <p>{text}</p> }),
  })

const renderPaymentSlot = (slots: ExtensionSlotContribution[]) =>
  renderCheckout({ screens: { Payment: PaymentScreen }, appConfig: { slots } })

const slotTexts = () =>
  [...document.querySelectorAll('[data-extension-slot="checkout:payment-extra"] p')].map(
    (paragraph) => paragraph.textContent,
  )

describe("ExtensionSlot", () => {
  beforeEach(() => {
    //* The payment screen above leaves out the content a template must show, so the required
    //* content guard warns about it on every render.
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  test("renders a contribution in its position once it loads", async () => {
    renderCheckout({
      screens: { Payment: PaymentScreen },

      appConfig: {
        slots: [
          defineExtensionSlotContribution({
            pluginId: "loyalty",
            slot: "checkout:payment-extra",

            load: () =>
              Promise.resolve({
                default: ({ context }) => <p>Earn points paying with {context.payment.name}</p>,
              }),
          }),
        ],
      },
    })

    expect(await screen.findByText("Earn points paying with BTC")).toBeInTheDocument()
  })

  describe("method context", () => {
    const eth = makePayment({
      id: "method-eth",
      name: "ETH",
      wallet: { network: "eip155:1", sender_address_required: true, links: [] },
    })

    const btc = makePayment({ id: "method-btc", name: "BTC" })

    const FooterScreen = () => <CheckoutFooter />

    const AddressScreen = () => (
      <>
        <SenderAddressForm />
        <ExtensionSlot name="checkout:address-extra" />
      </>
    )

    const footerContribution = defineExtensionSlotContribution<"checkout:footer-extra">({
      pluginId: "eth-plugin",
      slot: "checkout:footer-extra",
      load: () =>
        Promise.resolve({
          default: ({ context }) => <p>Footer method: {context.method?.name ?? "none"}</p>,
        }),
    })

    const addressContribution = defineExtensionSlotContribution<"checkout:address-extra">({
      pluginId: "eth-plugin",
      slot: "checkout:address-extra",
      load: () =>
        Promise.resolve({
          default: ({ context }) => (
            <p>
              {context.method.name} address, {context.view} view
            </p>
          ),
        }),
    })

    test.each([
      ["pays with", [btc], "BTC"],
      ["is addressing", [eth], "ETH"],
    ])("gives the footer the method the buyer %s", async (_case, payments, name) => {
      renderCheckout({
        source: { invoice: makeInvoice({ payments }) },
        screens: { Payment: FooterScreen, Address: FooterScreen },
        appConfig: { slots: [footerContribution] },
      })

      expect(await screen.findByText(`Footer method: ${name}`)).toBeInTheDocument()
    })

    test("gives the footer no method while the buyer chooses one", async () => {
      renderCheckout({
        source: { invoice: makeInvoice({ payments: [btc, eth] }) },
        screens: { Payment: FooterScreen, Select: FooterScreen, selection: "explicit" },
        appConfig: { slots: [footerContribution] },
      })

      expect(await screen.findByText("Footer method: none")).toBeInTheDocument()
    })

    test("tells the address slot whether the ETH plugin offer is shown", async () => {
      renderCheckout({
        source: { invoice: makeInvoice({ payments: [eth] }) },
        screens: { Payment: FooterScreen, Address: AddressScreen },
        appConfig: { slots: [addressContribution] },
      })

      expect(await screen.findByText("ETH address, form view")).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: "Skip" }))

      expect(await screen.findByText("ETH address, upsell view")).toBeInTheDocument()
    })
  })

  test("orders contributions by their order, then by plugin id", async () => {
    renderPaymentSlot([
      textContribution("zeta", "Zeta", { order: 1 }),
      textContribution("beta", "Beta"),
      textContribution("alpha", "Alpha", { order: 1 }),
    ])

    await screen.findByText("Zeta")

    expect(slotTexts()).toStrictEqual(["Beta", "Alpha", "Zeta"])
  })

  test("skips a contribution its predicate rules out, without loading it", async () => {
    const loadLightningTip = vi.fn(() => Promise.resolve({ default: () => <p>Lightning tip</p> }))

    renderPaymentSlot([
      defineExtensionSlotContribution({
        pluginId: "lightning-tips",
        slot: "checkout:payment-extra",
        when: ({ payment }) => payment.lightning,
        load: loadLightningTip,
      }),

      textContribution("loyalty", "Loyalty"),
    ])

    await screen.findByText("Loyalty")

    expect(screen.queryByText("Lightning tip")).not.toBeInTheDocument()
    expect(loadLightningTip).not.toHaveBeenCalled()
  })

  test.each([
    [
      "crashes",
      () =>
        Promise.resolve({
          default: () => {
            throw new Error("Broken contribution")
          },
        }),
    ],
    [
      "fails to load",
      () => Promise.reject(new Error("Failed to fetch dynamically imported module")),
    ],
  ])("keeps the checkout and other contributions when one %s", async (_failure, load) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderPaymentSlot([
      defineExtensionSlotContribution({ pluginId: "broken", slot: "checkout:payment-extra", load }),
      textContribution("loyalty", "Loyalty"),
    ])

    expect(await screen.findByText("Loyalty")).toBeInTheDocument()
    expect(screen.getByText("Pay with BTC")).toBeInTheDocument()

    await vi.waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('"broken"'),
        expect.any(Error),
        expect.anything(),
      ),
    )
  })

  test("rules out a contribution whose predicate throws, keeping the others", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)

    renderPaymentSlot([
      defineExtensionSlotContribution({
        pluginId: "broken",
        slot: "checkout:payment-extra",

        when: () => {
          throw new Error("Broken predicate")
        },

        load: () => Promise.resolve({ default: () => <p>Broken</p> }),
      }),

      textContribution("loyalty", "Loyalty"),
    ])

    expect(await screen.findByText("Loyalty")).toBeInTheDocument()
    expect(screen.queryByText("Broken")).not.toBeInTheDocument()

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('"broken"'),
      expect.any(Error),
    )
  })
})
