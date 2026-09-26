import { msg } from "@lingui/core/macro"

import { defineCheckoutTemplate } from "#/checkout"

import { AccordionPayment } from "./payment"

/**
 * Accordion: Progressive Disclosure Checkout
 *
 * Each checkout step has its own collapsible section, opened in order: currency, amount, QR code
 * or copy, then wallet. A completed section collapses with a checkmark, and its header reopens it.
 */
export default defineCheckoutTemplate({
  name: msg`Accordion`,
  Payment: AccordionPayment,
})
