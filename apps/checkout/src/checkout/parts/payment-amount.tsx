import { useLingui } from "@lingui/react/macro"

import { useCheckout } from "../hooks"

export const PaymentAmount = ({ unitClassName }: { unitClassName?: string }) => {
  const { t } = useLingui()
  const { invoice, payment } = useCheckout("payment")

  if (invoice.isAnyAmount) {
    return t`Any amount`
  } else {
    return (
      <>
        {payment.amount}
        <span className={unitClassName}>{payment.symbol.toUpperCase()}</span>
      </>
    )
  }
}
