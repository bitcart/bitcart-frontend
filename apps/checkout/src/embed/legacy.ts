import type { EmbedInvoiceState } from "#/common/integrations/embed/protocol"

import { listen, type BitcartCheckoutElement } from "./element"
import type { BitcartApi } from "./register"
import { stripTrailingSlashes } from "./script-base"

export type LegacyStatusMessage = Pick<
  EmbedInvoiceState,
  "invoice_id" | "status" | "exception_status" | "sent_amount" | "paid_currency" | "payment_id"
>

type LegacyMessage = "loaded" | "close" | LegacyStatusMessage

export type LegacyBitcart = {
  showInvoice: (invoiceId: string) => void
  showFrame: () => void
  hideFrame: () => void
  onModalWillEnter: (callback: () => void) => void
  onModalWillLeave: (callback: () => void) => void
  onModalReceiveMessage: (callback: (event: MessageEvent<LegacyMessage>) => void) => void
  setAdminUrlPrefix: (urlPrefix: string) => void
}

const toLegacyStatusMessage = ({
  invoice_id,
  status,
  exception_status,
  sent_amount,
  paid_currency,
  payment_id,
}: EmbedInvoiceState): LegacyStatusMessage => ({
  invoice_id,
  status,
  exception_status,
  sent_amount,
  paid_currency,
  payment_id,
})

export const createLegacyBitcart = ({
  checkoutUrl: initialCheckoutUrl,
  openCheckout,
}: {
  checkoutUrl: string | null
  openCheckout: BitcartApi["open"]
}): LegacyBitcart => {
  let checkoutUrl = initialCheckoutUrl
  let checkout: BitcartCheckoutElement | null = null
  let invoiceId: string | null = null
  let onModalWillEnter: (() => void) | null = null
  let onModalWillLeave: (() => void) | null = null
  let onModalReceiveMessage: ((event: MessageEvent<LegacyMessage>) => void) | null = null

  const showInvoice = (nextInvoiceId: string) => {
    if (!checkoutUrl) {
      throw new Error("bitcart: the checkout URL is unknown, call setAdminUrlPrefix")
    }

    const { origin } = new URL(checkoutUrl)
    let lastStatus: string | null = null

    const deliver = (data: LegacyMessage) => {
      const event = new MessageEvent("message", { data, origin })

      window.dispatchEvent(event)
      onModalReceiveMessage?.(event)
    }

    //* Closed first: each open checkout restores the page scroll it found.
    checkout?.close()

    const opened = openCheckout(nextInvoiceId, { checkoutUrl })

    checkout = opened
    invoiceId = nextInvoiceId

    listen(opened, "bitcart:ready", ({ detail }) => {
      lastStatus = detail.status
      showFrame()
      deliver("loaded")
    })

    //* Legacy reported status changes only: bitcart-store hides the modal on any status message,
    //* so a partial payment, which keeps the status, must not post one.
    listen(opened, "bitcart:status", ({ detail }) => {
      if (detail.status !== lastStatus) {
        lastStatus = detail.status
        deliver(toLegacyStatusMessage(detail))
      }
    })

    listen(opened, "bitcart:close", ({ detail: { reason } }) => {
      if (checkout === opened) checkout = null

      if (reason !== "api") {
        onModalWillLeave?.()
        deliver("close")
      }
    })
  }

  const showFrame = () => {
    if (!checkout && invoiceId) showInvoice(invoiceId)

    onModalWillEnter?.()
  }

  return {
    showInvoice,
    showFrame,

    hideFrame: () => {
      onModalWillLeave?.()
      checkout?.close()
    },

    onModalWillEnter: (callback) => {
      onModalWillEnter = callback
    },

    onModalWillLeave: (callback) => {
      onModalWillLeave = callback
    },

    onModalReceiveMessage: (callback) => {
      onModalReceiveMessage = callback
    },

    setAdminUrlPrefix: (urlPrefix) => {
      checkoutUrl = stripTrailingSlashes(urlPrefix)
    },
  }
}
