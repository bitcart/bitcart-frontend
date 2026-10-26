import { createLegacyBitcart, type LegacyBitcart } from "./legacy"
import { registerBitcartCheckout } from "./register"
import { resolveScriptBase } from "./script-base"

declare global {
  interface Window {
    bitcart?: LegacyBitcart
  }
}

if (!window.bitcart) {
  const checkoutUrl = resolveScriptBase("/modal/bitcart.js")

  console.warn(
    "Bitcart: /modal/bitcart.js is deprecated. Load /embed/v1.js and use Bitcart.open() instead.",
  )

  const { open } = registerBitcartCheckout(checkoutUrl)

  window.bitcart = createLegacyBitcart({ checkoutUrl, openCheckout: open })
}
