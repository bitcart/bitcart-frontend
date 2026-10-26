import { registerBitcartCheckout } from "./register"
import { resolveScriptBase } from "./script-base"

registerBitcartCheckout(resolveScriptBase("/embed/v1.js"))
