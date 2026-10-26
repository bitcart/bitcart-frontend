import { BitcartCheckoutElement, CHECKOUT_ELEMENT_TAG, setDefaultCheckoutUrl } from "./element"

export type OpenOptions = { checkoutUrl?: string }

export type BitcartApi = {
  open: (invoiceId: string, options?: OpenOptions) => BitcartCheckoutElement
}

const openCheckout: BitcartApi["open"] = (invoiceId, { checkoutUrl } = {}) => {
  const checkout = document.createElement(CHECKOUT_ELEMENT_TAG)

  checkout.setAttribute("invoice-id", invoiceId)
  if (checkoutUrl) checkout.setAttribute("checkout-url", checkoutUrl)
  checkout.addEventListener("bitcart:close", () => checkout.remove(), { once: true })
  document.body.append(checkout)
  checkout.open()

  return checkout
}

export const registerBitcartCheckout = (defaultCheckoutUrl: string | null): BitcartApi => {
  if (!customElements.get(CHECKOUT_ELEMENT_TAG)) {
    setDefaultCheckoutUrl(defaultCheckoutUrl)
    customElements.define(CHECKOUT_ELEMENT_TAG, BitcartCheckoutElement)
  }

  return (window.Bitcart ??= { open: openCheckout })
}

declare global {
  interface Window {
    Bitcart?: BitcartApi
  }
}
