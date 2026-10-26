import { msg } from "@lingui/core/macro"

import { defineCheckoutTemplate } from "#/checkout"

import { messages as sourceMessages } from "./locales/en.po"
import { FlowPayment } from "./payment"
import { FlowSelect } from "./select"

/**
 * Flow: Choose, Then Pay
 *
 * One card walks the customer from choosing a payment method to paying with it. The chosen
 * method stays on top as a row that changes it, above the amount and the ways to pay.
 */
export default defineCheckoutTemplate({
  name: msg`Flow`,
  sourceMessages,
  selection: "explicit",
  Select: FlowSelect,
  Payment: FlowPayment,
})
