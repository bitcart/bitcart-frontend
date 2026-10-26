import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import type { WalletLinkOutput } from "@bitcart/client-sdk/schemas"
import { fromBaseUnits, toBaseUnits, trimTrailingZeros } from "@bitcart/core/utils"
import type { CheckoutPreviewAxes, CheckoutPreviewMethod, CheckoutPreviewStatus } from "@bitcart/qa"

import { makeInvoice, makePayment, makePolicies, makeRefund, makeStore } from "../fixtures"
import type { CheckoutSource } from "../model"
import { divideRounded, percentOf, roundSignificant } from "./amounts"
import { normalizePreviewAxes, type NormalizedPreviewAxes } from "./axes"

export type CheckoutPreviewScenario = Pick<
  CheckoutSource,
  "invoice" | "store" | "policies" | "refund"
>

const FIAT_SCALE = 2
const PRICE = "25.00"
const LONG_PRICE = "1234567.89"
const ANY_AMOUNT_SENT_PRICE = "243.00"
const LONG_STORE_NAME = "The Very Long Example Coffee Roasters Store Incorporated"
const NETWORK_COST_PERCENT = "4.6"
const OVERPAID_PERCENT = "120"
const AUTUMN_SALE = { name: "Autumn sale", percent: 10 }

const BTC_ADDRESS = "bc1qpreview7h3t2kq9x8v4m6d5c0n2r7a8s3w9e4f6g"
const LTC_ADDRESS = "ltc1qpreview4d8f2k7m3n9p5q1r6s0t8u2v4w7x3y5z"
const ETH_ADDRESS = "0x5a3b9c2d7e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b"
const USDT_CONTRACT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

const BOLT11 =
  "lnbc432100n1pjpreviewpp5qyvz3k8m4x7r2t9c6w0e5u3a1s8d2f4g6h8j0k2l4m6n8p0q2r4s6t8vdq8w3jhxaqcqzzsxqyz5vqsp5preview"

const LIGHTNING_NODE_ID =
  "03a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90@203.0.113.7:9735"

const TX_HASHES = [
  "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
  "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16",
  "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
]

const LIGHTNING_PAYMENT_HASH = "5c9a1f3e7b2d4086a1e3c5b7d9f02468ace13579bdf02468ace13579bdf02468"
const REFUND_TX_HASH = "9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5"

const SETTLED_ORDER = {
  order_id: "1042",
  paid_date: "2026-09-24T10:06:00+00:00",
  products: ["preview-product"],
  product_names: { "preview-product": "Merino wool socks" },
  product_quantities: { "preview-product": 2 },
}

const POLICIES = makePolicies({ allow_powered_by_bitcart: true })

type PreviewMethodId = CheckoutPreviewMethod | "ltc"

type PreviewMethod = {
  payment: Omit<Partial<bitcartInvoices.InvoicePayment>, "rate" | "name">
  longName: string
  rate: string

  //! The decimals of the amounts the backend sends: 8 for coins, ETH included; a token's own.
  scale: number
  network?: string
  uri: (amount: string) => string
}

const ETHEREUM = "eip155:1"
const TRON = "tron:728126428"

const withAmount = (base: string, amount: string) =>
  amount === "" ? base : `${base}?amount=${trimTrailingZeros(amount)}`

const METHODS: Record<PreviewMethodId, PreviewMethod> = {
  btc: {
    payment: {
      id: "preview-btc",
      symbol: "btc",
      currency: "btc",
      payment_address: BTC_ADDRESS,
      recommended_fee: "4",
      hint: "Send from a wallet you control, not from an exchange account.",
    },

    rate: "57857.00",
    longName: "Bitcoin (Native SegWit, Bech32 address)",
    scale: 8,
    uri: (amount) => withAmount(`bitcoin:${BTC_ADDRESS}`, amount),
  },

  lightning: {
    payment: {
      id: "preview-btc-lightning",
      symbol: "btc",
      currency: "btc",
      lightning: true,
      payment_address: BOLT11,
      node_id: LIGHTNING_NODE_ID,
    },

    rate: "57857.00",
    longName: "Bitcoin over the Lightning Network (BOLT11)",
    scale: 8,
    uri: () => BOLT11,
  },

  eth: {
    payment: {
      id: "preview-eth",
      symbol: "eth",
      currency: "eth",
      divisibility: 8,
      chain_id: 1,
      payment_address: ETH_ADDRESS,
    },

    rate: "3045.00",
    longName: "Ethereum (Mainnet, EIP-1559 transaction)",
    scale: 8,
    network: ETHEREUM,

    uri: (amount) =>
      amount === ""
        ? `ethereum:${ETH_ADDRESS}`
        : `ethereum:${ETH_ADDRESS}?value=${toBaseUnits(amount, 18).toString()}`,
  },

  usdt: {
    payment: {
      id: "preview-usdt",
      symbol: "usdt",
      currency: "eth",
      contract: USDT_CONTRACT,
      divisibility: 6,
      chain_id: 1,
      payment_address: ETH_ADDRESS,
    },

    rate: "1.00",
    longName: "Tether USD (ERC-20 token on Ethereum Mainnet)",
    scale: 6,
    network: ETHEREUM,

    uri: (amount) =>
      amount === ""
        ? `ethereum:${USDT_CONTRACT}@1/transfer?address=${ETH_ADDRESS}`
        : `ethereum:${USDT_CONTRACT}@1/transfer?address=${ETH_ADDRESS}&uint256=${toBaseUnits(amount, 6).toString()}`,
  },

  ltc: {
    payment: {
      id: "preview-ltc",
      symbol: "ltc",
      currency: "ltc",
      payment_address: LTC_ADDRESS,
    },

    rate: "80.00",
    longName: "Litecoin (Native SegWit, Bech32 address)",
    scale: 8,
    uri: (amount) => withAmount(`litecoin:${LTC_ADDRESS}`, amount),
  },
}

const extraMethod = (
  id: string,
  name: string,
  symbol: string,
  rate: string,
  {
    scale = 8,
    address = BTC_ADDRESS,
    scheme = symbol,
    contract = "",
    chainId = null,
    network = chainId === null ? undefined : `eip155:${chainId}`,
  }: {
    scale?: number
    address?: string
    scheme?: string
    contract?: string
    chainId?: number | null
    network?: string
  } = {},
): PreviewMethod => ({
  payment: {
    id: `preview-${id}`,
    symbol,
    currency: symbol,
    payment_address: address,
    contract,
    chain_id: chainId,
    divisibility: scale,
  },

  rate,
  longName: name,
  scale,
  network: network ?? (chainId ? `eip155:${chainId}` : undefined),
  uri: (amount) => withAmount(`${scheme}:${address}`, amount),
})

const evm = { scale: 6, address: ETH_ADDRESS, scheme: "ethereum" }

const MANY_METHODS: PreviewMethod[] = [
  METHODS.lightning,
  METHODS.usdt,

  extraMethod("usdt-trc20", "USDT (TRC20)", "usdt", "1.00", {
    scale: 6,
    contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    network: TRON,
  }),

  extraMethod("usdt-bep20", "USDT (BEP20)", "usdt", "1.00", {
    ...evm,
    contract: "0x55d398326f99059fF775485246999027B3197955",
    chainId: 56,
  }),

  extraMethod("usdc-erc20", "USDC (ERC20)", "usdc", "1.00", {
    ...evm,
    contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: 1,
  }),

  extraMethod("usdc-polygon", "USDC (Polygon)", "usdc", "1.00", {
    ...evm,
    contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    chainId: 137,
  }),

  extraMethod("bch", "BCH", "bch", "350.00"),
  extraMethod("xmr", "XMR", "xmr", "160.00"),
  extraMethod("bnb", "BNB", "bnb", "580.00", { ...evm, scale: 8, chainId: 56 }),
  extraMethod("pol", "POL", "pol", "0.40", { ...evm, scale: 8, chainId: 137 }),
  extraMethod("trx", "TRX", "trx", "0.12", { scale: 6, network: TRON }),
  extraMethod("grs", "GRS", "grs", "0.35"),
  extraMethod("xrg", "XRG", "xrg", "0.05"),
]

const ALTERNATIVE_METHODS: Record<CheckoutPreviewMethod, PreviewMethodId[]> = {
  btc: ["ltc", "eth"],
  lightning: ["btc"],
  eth: ["btc", "ltc"],
  usdt: ["btc", "eth"],
}

const INVOICE_STATUSES: Record<CheckoutPreviewStatus, bitcartInvoices.Invoice["status"]> = {
  new: "pending",
  details: "pending",
  paid: "paid",
  complete: "complete",
  expired: "expired",
  invalid: "invalid",
  refunded: "refunded",
  "refund-unclaimed": "complete",
  "refund-pending": "complete",
  "refund-failed": "complete",
  unknown: "unknown",
  unavailable: "pending",
}

const REFUND_STATUSES: CheckoutPreviewStatus[] = [
  "refunded",
  "refund-unclaimed",
  "refund-pending",
  "refund-failed",
]

const toFiat = (units: bigint, { rate, scale }: PreviewMethod) =>
  divideRounded(units * toBaseUnits(rate, FIAT_SCALE), 10n ** BigInt(scale))

const toCrypto = (price: string, { rate, scale }: PreviewMethod) =>
  divideRounded(
    toBaseUnits(price, FIAT_SCALE) * 10n ** BigInt(scale),
    toBaseUnits(rate, FIAT_SCALE),
  )

const getAmounts = (method: PreviewMethod, price: string, axes: NormalizedPreviewAxes) => {
  const subtotal = axes.anyAmount ? 0n : toCrypto(price, method)
  const networkFee = axes.fee ? roundSignificant(percentOf(subtotal, NETWORK_COST_PERCENT), 1) : 0n

  return { amount: subtotal + networkFee, subtotal, networkFee }
}

const getTransfers = (
  { received, anyAmount }: NormalizedPreviewAxes,
  amount: bigint,
  method: PreviewMethod,
) => {
  const half = roundSignificant(divideRounded(amount, 2n), 1)
  const quarter = roundSignificant(divideRounded(amount, 4n), 1)

  if (received === "partial") {
    return [half]
  } else if (received === "partial-2") {
    return [quarter, quarter]
  } else if (received === "full") {
    return [amount]
  } else if (received === "full-2") {
    return [half, amount - half]
  } else if (received === "over" && anyAmount) {
    return [roundSignificant(toCrypto(ANY_AMOUNT_SENT_PRICE, method), 2)]
  } else if (received === "over") {
    return [roundSignificant(percentOf(amount, OVERPAID_PERCENT), 1)]
  } else return []
}

const getTransferHashes = (method: CheckoutPreviewMethod, count: number) => {
  if (method === "lightning") {
    return [LIGHTNING_PAYMENT_HASH].slice(0, count)
  } else if (count > 1) {
    return TX_HASHES.slice(1, count + 1)
  } else return TX_HASHES.slice(0, count)
}

const buildPayment = (
  method: PreviewMethod,
  price: string,
  axes: NormalizedPreviewAxes,
  { sent = 0n, confirmations = 0, label = "" } = {},
): bitcartInvoices.InvoicePayment => {
  const { amount, subtotal, networkFee } = getAmounts(method, price, axes)
  const due = amount > sent ? amount - sent : 0n
  const crypto = (units: bigint) => fromBaseUnits(units, method.scale)

  return makePayment({
    ...method.payment,
    rate: method.rate,
    confirmations,
    label,
    amount: crypto(amount),
    subtotal: crypto(subtotal),
    network_fee: crypto(networkFee),
    due: crypto(due),
    due_price: fromBaseUnits(toFiat(due, method), FIAT_SCALE),
    effective_price: axes.anyAmount ? "0.00" : price,
    payment_url: method.uri(axes.anyAmount ? "" : crypto(amount)),
    wallet: method.network
      ? {
          network: method.network,
          sender_address_required: axes.senderAddress,
          links: getWalletLinks(method.network),
        }
      : null,
    ...(axes.discount ? { discount: "preview-discount", applied_discount: AUTUMN_SALE } : {}),
  })
}

const PREVIEW_CHECKOUT_URL = "https://checkout.example.com/i/preview-invoice"

const TRUST_WALLET_COIN_IDS: Partial<Record<string, number>> = {
  "eip155:1": 60,
  "eip155:56": 20000714,
  "eip155:137": 966,
  [TRON]: 195,
}

const getWalletLinks = (network: string): WalletLinkOutput[] => {
  const trustCoinId = TRUST_WALLET_COIN_IDS[network]

  const tronLinkParam = JSON.stringify({
    url: PREVIEW_CHECKOUT_URL,
    action: "open",
    protocol: "TronLink",
    version: "1.0",
  })

  return [
    ...(network.startsWith("eip155:")
      ? [
          {
            id: "metamask",
            name: "MetaMask",
            url: `https://link.metamask.io/dapp/${PREVIEW_CHECKOUT_URL.replace("https://", "")}`,
          },
        ]
      : []),

    ...(trustCoinId === undefined
      ? []
      : [
          {
            id: "trust",
            name: "Trust Wallet",
            url: `https://link.trustwallet.com/open_url?coin_id=${trustCoinId}&url=${encodeURIComponent(PREVIEW_CHECKOUT_URL)}`,
          },
        ]),

    ...(network === TRON
      ? [
          {
            id: "tronlink",
            name: "TronLink",
            url: `tronlinkoutside://pull.activity?param=${encodeURIComponent(tronLinkParam)}`,
          },
        ]
      : []),
  ]
}

const CUSTOM_LABEL = "Main store wallet"

const getPreviewLabel = (method: PreviewMethod, axes: NormalizedPreviewAxes) => {
  if (axes.longCoin) {
    return method.longName
  } else if (axes.customLabel) {
    return CUSTOM_LABEL
  } else return ""
}

const nameLikeBackend = (payments: bitcartInvoices.InvoicePayment[]) => {
  const isCounted = ({ label, lightning }: bitcartInvoices.InvoicePayment) =>
    label === "" && !lightning

  const totals = new Map<string, number>()

  for (const payment of payments) {
    if (isCounted(payment)) totals.set(payment.symbol, (totals.get(payment.symbol) ?? 0) + 1)
  }

  const seen = new Map<string, number>()

  return payments.map((payment) => {
    if (isCounted(payment)) seen.set(payment.symbol, (seen.get(payment.symbol) ?? 0) + 1)

    const index = (totals.get(payment.symbol) ?? 0) > 1 ? seen.get(payment.symbol) : undefined
    const base = payment.lightning ? `${payment.symbol} (⚡)` : payment.symbol

    if (payment.label !== "") {
      return { ...payment, name: payment.label }
    } else return { ...payment, name: (index ? `${base} (${index})` : base).toUpperCase() }
  })
}

const getExceptionStatus = ({ status, received }: NormalizedPreviewAxes) => {
  if (received === "partial" || received === "partial-2") {
    return "paid_partial"
  } else if (received === "over") {
    return "paid_over"
  } else if (status === "invalid" && received === "full") {
    return "failed_confirm"
  } else return "none"
}

const getRefund = (
  status: CheckoutPreviewStatus,
  invoice: bitcartInvoices.Invoice,
  payment: bitcartInvoices.InvoicePayment,
): bitcartInvoices.InvoiceRefund | undefined => {
  const base = { id: "preview-refund", invoice_id: invoice.id, amount: invoice.effective_price }

  if (status === "refunded") {
    return makeRefund({
      ...base,
      payout_status: "complete",
      wallet_currency: payment.symbol,
      tx_hash: REFUND_TX_HASH,
    })
  } else if (status === "refund-unclaimed") {
    return makeRefund(base)
  } else if (status === "refund-pending") {
    return makeRefund({ ...base, payout_status: "pending", wallet_currency: payment.symbol })
  } else if (status === "refund-failed") {
    return makeRefund({ ...base, payout_status: "failed", wallet_currency: payment.symbol })
  } else return undefined
}

const getOriginalPrice = (price: string) =>
  fromBaseUnits(
    divideRounded(toBaseUnits(price, FIAT_SCALE) * 100n, BigInt(100 - AUTUMN_SALE.percent)),
    FIAT_SCALE,
  )

export const buildPreviewScenario = (requested: CheckoutPreviewAxes): CheckoutPreviewScenario => {
  const axes = normalizePreviewAxes(requested)
  const { status, received } = axes
  const method = METHODS[axes.method]
  const price = axes.longPrice ? LONG_PRICE : PRICE
  const invoicePrice = axes.anyAmount ? "0.00" : price
  const hasRefund = REFUND_STATUSES.includes(status)

  const transfers = getTransfers(axes, getAmounts(method, price, axes).amount, method)
  const sent = transfers.reduce((total, transfer) => total + transfer, 0n)
  const hashes = getTransferHashes(axes.method, transfers.length)

  const selected = buildPayment(method, price, axes, {
    sent,
    confirmations: status === "paid" ? 1 : 0,
    label: getPreviewLabel(method, axes),
  })

  const duplicate = axes.duplicateCoin
    ? [
        buildPayment(
          { ...method, payment: { ...method.payment, id: `${selected.id}-2` } },
          price,
          axes,
        ),
      ]
    : []

  const alternatives = [
    ...ALTERNATIVE_METHODS[axes.method].map((id) => METHODS[id]),
    ...(axes.manyMethods ? MANY_METHODS : []),
  ]
    .filter((alternative) => alternative !== method)
    .map((alternative) => buildPayment(alternative, price, axes))

  const invoice = makeInvoice({
    id: "preview-invoice",
    currency: "USD",
    redirect_url: "https://shop.example.com/orders/1042",
    price: axes.discount ? getOriginalPrice(price) : invoicePrice,
    effective_price: invoicePrice,
    status: INVOICE_STATUSES[status],
    exception_status: getExceptionStatus(axes),
    time_left: status === "expired" ? 0 : 900,
    payments:
      status === "unavailable" ? [] : nameLikeBackend([selected, ...duplicate, ...alternatives]),
    payment_id: received === "none" ? null : selected.id,
    paid_currency: received === "none" || status === "new" ? null : selected.symbol,
    sent_amount: fromBaseUnits(sent, method.scale),
    sent_price: fromBaseUnits(toFiat(sent, method), FIAT_SCALE),
    tx_hashes: hashes,

    transactions: hashes.map((hash, index) => ({
      tx_hash: hash,
      amount: fromBaseUnits(transfers[index] ?? 0n, method.scale),
    })),

    ...(status === "details" ? { buyer_email: "", shipping_address: "", notes: "" } : {}),
    ...(status === "complete" || hasRefund ? SETTLED_ORDER : {}),
    ...(hasRefund ? { refund_id: "preview-refund" } : {}),
  })

  const store = {
    ...makeStore({
      show_recommended_fee: axes.recommendedFee,
      transaction_speed: 2,
      support_email: "support@example.com",
      include_network_fee: axes.fee,
      ...(status === "details" ? { email_required: true, ask_address: true } : {}),
    }),

    ...(axes.longName ? { name: LONG_STORE_NAME } : {}),
  }

  return { invoice, store, policies: POLICIES, refund: getRefund(status, invoice, selected) }
}
