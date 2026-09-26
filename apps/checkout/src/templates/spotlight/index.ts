import { msg } from "@lingui/core/macro"

import { defineCheckoutTemplate } from "#/checkout"

import { SpotlightPayment } from "./payment"
import { SpotlightSelect } from "./select"

/**
 * Spotlight: Command Palette Checkout
 *
 * The checkout opens as a floating palette: the customer searches for a currency first, then pays
 * from the same palette, where typing runs quick actions such as copying the address.
 */
export default defineCheckoutTemplate({
  name: msg`Spotlight`,
  selection: "explicit",
  Select: SpotlightSelect,
  Payment: SpotlightPayment,
})
