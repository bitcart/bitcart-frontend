import { useCopyStatus } from "@bitcart/hooks"

export type CheckoutCopyTarget = "address" | "amount" | "contract" | "nodeId"

/**
 * The copy state of the payment values on a page. A template that copies a value from elsewhere,
 * such as a command, passes it to the part showing that value, which then confirms the copy.
 */
export type CheckoutCopy = ReturnType<typeof useCopyStatus<CheckoutCopyTarget>>

export const useCheckoutCopyStatus = (): CheckoutCopy => useCopyStatus<CheckoutCopyTarget>()

export const getCopyOutcome = (copy: CheckoutCopy, target: CheckoutCopyTarget) =>
  copy.status?.key === target ? copy.status.outcome : null
