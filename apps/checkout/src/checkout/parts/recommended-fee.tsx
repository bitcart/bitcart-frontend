import { CHECKOUT_RECOMMENDED_FEE_TESTID } from "@bitcart/qa"
import { useLingui } from "@lingui/react/macro"

import { useAmountFormat } from "../amount-format"
import { useCheckout } from "../hooks"

export const RecommendedFee = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const format = useAmountFormat()
  const { recommendedFee } = useCheckout("payment").payment

  return (
    recommendedFee !== null && (
      <p className={className} data-testid={CHECKOUT_RECOMMENDED_FEE_TESTID}>
        {t`Recommended fee: ${format.number(recommendedFee)} sat/byte`}
      </p>
    )
  )
}
