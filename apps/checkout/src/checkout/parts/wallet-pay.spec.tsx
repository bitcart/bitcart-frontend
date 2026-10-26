import { CHECKOUT_WALLET_SENT_TESTID } from "@bitcart/qa"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { beforeAll, describe, expect, onTestFinished, test, vi } from "vitest"

import { makeInvoice, makePayment, makePolicies } from "../fixtures"
import type { CheckoutSource } from "../model"
import {
  createFakeEvmProvider,
  FAKE_EVM_ACCOUNT,
  FAKE_TX_HASH,
  type FakeEvmOptions,
} from "../testing/fake-wallets"
import { renderCheckout } from "../testing/render-checkout"
import { WalletButton } from "./wallet-button"

const MERCHANT = "0x5a3b9c2d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b"
const ETH_URI = `ethereum:${MERCHANT}@1?value=500000000000000000`
const METAMASK_LINK = "https://link.metamask.io/dapp/checkout.example.com/i/invoice-1"

const ethPayment = (overrides: Parameters<typeof makePayment>[0] = {}) =>
  makePayment({
    id: "method-eth",
    symbol: "eth",
    currency: "eth",
    name: "ETH",
    chain_id: 1,

    divisibility: 8,

    amount: "0.5",
    payment_address: MERCHANT,
    payment_url: ETH_URI,

    wallet: {
      network: "eip155:1",
      sender_address_required: false,
      links: [{ id: "metamask", name: "MetaMask", url: METAMASK_LINK }],
    },

    ...overrides,
  })

const POLICIES = makePolicies({ explorer_urls: { eth: "https://explorer.example.com/tx/{}" } })

const injectWallet = (options: FakeEvmOptions = {}) => {
  const fake = createFakeEvmProvider(options)

  const announce = () =>
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: {
          info: { uuid: "test-wallet", name: "Test Wallet", icon: null, rdns: "test" },
          provider: fake.provider,
        },
      }),
    )

  window.addEventListener("eip6963:requestProvider", announce)
  onTestFinished(() => window.removeEventListener("eip6963:requestProvider", announce))

  return fake
}

const emulateTouchDevice = () => {
  const matchMedia = window.matchMedia.bind(window)

  window.matchMedia = (query) =>
    Object.defineProperty(matchMedia(query), "matches", { value: query === "(pointer: coarse)" })

  onTestFinished(() => void (window.matchMedia = matchMedia))
}

const renderWalletPay = (source: Partial<CheckoutSource> = {}) =>
  renderCheckout({
    source: { invoice: makeInvoice({ payments: [ethPayment()] }), policies: POLICIES, ...source },
    screens: { Payment: WalletButton },
  })

const openSheet = () => {
  fireEvent.click(screen.getByRole("button", { name: "Pay with wallet" }))

  return screen.getByRole("dialog", { name: "Pay with a wallet" })
}

beforeAll(async () => {
  await import("../wallet-pay/engine")
})

describe("wallet pay", () => {
  test("opens the payment URI for a coin no browser wallet pays", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [makePayment()] }) },
      screens: { Payment: WalletButton },
    })

    expect(screen.getByRole("link", { name: "Pay with wallet" })).toHaveAttribute(
      "href",
      "bitcoin:bc1qexampleaddress?amount=0.0015",
    )
  })

  test("lists this browser's wallets, wallet apps and the payment URI", () => {
    injectWallet()
    renderWalletPay()

    const sheet = openSheet()

    expect(within(sheet).getByRole("button", { name: /Test Wallet.*Installed/u })).toBeVisible()
    expect(within(sheet).getByRole("button", { name: /MetaMask.*Scan with phone/u })).toBeVisible()

    expect(within(sheet).getByRole("link", { name: "Other wallet" })).toHaveAttribute(
      "href",
      ETH_URI,
    )
  })

  test("shows a QR code that opens the invoice in a wallet app", () => {
    renderWalletPay()

    const sheet = openSheet()

    expect(within(sheet).queryByRole("link", { name: "Open in a new tab" })).not.toBeInTheDocument()

    fireEvent.click(within(sheet).getByRole("button", { name: /MetaMask/u }))

    expect(
      screen.getByRole("img", { name: "QR code that opens this invoice in MetaMask" }),
    ).toBeVisible()

    expect(screen.getByRole("button", { name: "Copy link" })).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "All wallets" }))

    expect(screen.getByRole("link", { name: "Other wallet" })).toBeVisible()
  })

  test("pays from a browser wallet, then shows the payment as sent", async () => {
    const wallet = injectWallet()

    renderWalletPay()
    fireEvent.click(within(openSheet()).getByRole("button", { name: /Test Wallet/u }))

    expect(await screen.findByTestId(CHECKOUT_WALLET_SENT_TESTID)).toHaveTextContent("Payment sent")

    expect(screen.getByRole("link", { name: "View transaction" })).toHaveAttribute(
      "href",
      `https://explorer.example.com/tx/${FAKE_TX_HASH}`,
    )

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.queryByRole("button", { name: "Pay with wallet" })).not.toBeInTheDocument()

    const sent = wallet.calls.filter(({ method }) => method === "eth_sendTransaction")
    const [transaction] = (sent[0]?.params ?? []) as [{ value?: string }?]

    expect(sent).toHaveLength(1)
    expect(BigInt(transaction?.value ?? "0x0")).toBe(5n * 10n ** 17n)
  })

  test("pays straight away from the only wallet of a wallet app's own browser", async () => {
    emulateTouchDevice()
    injectWallet()
    renderWalletPay()

    fireEvent.click(screen.getByRole("button", { name: "Pay with Test Wallet" }))

    expect(await screen.findByTestId(CHECKOUT_WALLET_SENT_TESTID)).toBeInTheDocument()
  })

  test("offers another try after the wallet declines", async () => {
    const wallet = injectWallet({ send: "reject" })

    renderWalletPay()
    fireEvent.click(within(openSheet()).getByRole("button", { name: /Test Wallet/u }))

    expect(await screen.findByText("Request cancelled")).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Try again" }))

    await waitFor(() =>
      expect(wallet.calls.filter(({ method }) => method === "eth_sendTransaction")).toHaveLength(2),
    )
  })

  test("goes back to every way to pay from a failed attempt", async () => {
    injectWallet({ nativeBalance: 0n })
    renderWalletPay()
    fireEvent.click(within(openSheet()).getByRole("button", { name: /Test Wallet/u }))

    expect(await screen.findByText("Not enough ETH")).toBeVisible()
    expect(screen.getByText("This wallet has 0 ETH. The invoice needs 0.5 ETH.")).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Other ways to pay" }))

    expect(screen.getByRole("link", { name: "Other wallet" })).toBeVisible()
  })

  test("blocks a wallet account other than the saved sender address", async () => {
    injectWallet()

    renderWalletPay({
      invoice: makeInvoice({
        payments: [
          ethPayment({
            user_address: "0x0000000000000000000000000000000000000001",
            wallet: { network: "eip155:1", sender_address_required: true, links: [] },
          }),
        ],
      }),
    })

    fireEvent.click(within(openSheet()).getByRole("button", { name: /Test Wallet/u }))

    expect(await screen.findByText("Switch to your saved address")).toBeVisible()
    expect(screen.getByRole("button", { name: "Choose account" })).toBeVisible()
  })

  test("offers only wallet apps and the payment URI on an invoice of any amount", () => {
    injectWallet()
    renderWalletPay({ invoice: makeInvoice({ price: "0", payments: [ethPayment()] }) })

    const sheet = openSheet()

    expect(within(sheet).queryByRole("button", { name: /Test Wallet/u })).not.toBeInTheDocument()
    expect(within(sheet).getByRole("link", { name: "Other wallet" })).toBeVisible()
  })

  test("suggests a new tab inside a frame where no wallet reached the checkout", () => {
    vi.spyOn(window, "top", "get").mockReturnValue({} as Window)
    onTestFinished(() => void vi.restoreAllMocks())
    renderWalletPay()

    expect(within(openSheet()).getByRole("link", { name: "Open in a new tab" })).toHaveAttribute(
      "href",
      "/i/invoice-1",
    )
  })

  test("drops the sent notice once a partial payment arrives", async () => {
    injectWallet()

    const { refetch } = renderWalletPay()

    fireEvent.click(within(openSheet()).getByRole("button", { name: /Test Wallet/u }))
    await screen.findByTestId(CHECKOUT_WALLET_SENT_TESTID)

    act(() =>
      refetch({
        invoice: makeInvoice({
          exception_status: "paid_partial",
          payment_id: "method-eth",
          sent_amount: "0.2",
          payments: [ethPayment({ due: "0.3" })],
        }),
      }),
    )

    expect(screen.queryByTestId(CHECKOUT_WALLET_SENT_TESTID)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pay with wallet" })).toBeVisible()
  })

  describe("in the address phase", () => {
    const addressInvoice = (userAddress: string | null) =>
      makeInvoice({
        payments: [
          ethPayment({
            user_address: userAddress,
            wallet: {
              network: "eip155:1",
              sender_address_required: true,
              links: [{ id: "metamask", name: "MetaMask", url: METAMASK_LINK }],
            },
          }),
        ],
      })

    test("saves the wallet's account as the sender address, then pays", async () => {
      injectWallet()

      const submitSenderAddress = vi.fn((_methodId: string, address: string) => {
        setTimeout(() => refetch({ invoice: addressInvoice(address), submitSenderAddress }))

        return Promise.resolve("accepted" as const)
      })

      const { refetch } = renderWalletPay({ invoice: addressInvoice(null), submitSenderAddress })
      const sheet = openSheet()

      expect(within(sheet).queryByRole("link", { name: "Other wallet" })).not.toBeInTheDocument()

      fireEvent.click(within(sheet).getByRole("button", { name: /Test Wallet/u }))

      expect(await screen.findByTestId(CHECKOUT_WALLET_SENT_TESTID)).toBeInTheDocument()
      expect(submitSenderAddress).toHaveBeenCalledWith("method-eth", FAKE_EVM_ACCOUNT)
    })

    test("leaves out the wallet option when no wallet could fill the address", () => {
      renderWalletPay({
        invoice: makeInvoice({
          payments: [
            ethPayment({
              wallet: { network: "eip155:1", sender_address_required: true, links: [] },
            }),
          ],
        }),
      })

      expect(screen.getByRole("textbox", { name: /Your ETH address/u })).toBeVisible()
      expect(screen.queryByRole("button", { name: "Pay with wallet" })).not.toBeInTheDocument()
      expect(screen.queryByText("or")).not.toBeInTheDocument()
    })
  })
})
