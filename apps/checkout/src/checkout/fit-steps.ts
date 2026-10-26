import type { FittedTextStep } from "@bitcart/ui-kit/components"

export const CHECKOUT_FIT_STEPS = {
  price: [
    {},
    { fontSize: "1.5rem", lineHeight: "2rem" },
    { fontSize: "1.25rem", lineHeight: "1.75rem" },
  ],

  payAmount: [
    {},
    { fontSize: "1.5rem", lineHeight: "2rem" },
    { fontSize: "1.25rem", lineHeight: "1.75rem" },
    { fontSize: "1.125rem", lineHeight: "1.75rem" },
  ],

  amount: [
    {},
    { fontSize: "1.25rem", lineHeight: "1.75rem" },
    { fontSize: "1.125rem", lineHeight: "1.75rem" },
  ],
} satisfies Record<string, readonly FittedTextStep[]>
