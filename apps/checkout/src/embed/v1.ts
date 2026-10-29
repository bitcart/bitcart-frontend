import { injectedCheckoutUrl } from "./injected-checkout-url"
import { registerBitcartCheckout } from "./register"
import { resolveScriptBase } from "./script-base"

registerBitcartCheckout(injectedCheckoutUrl ?? resolveScriptBase("/embed/v1.js"))
