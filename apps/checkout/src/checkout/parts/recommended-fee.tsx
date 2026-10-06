import { CHECKOUT_RECOMMENDED_FEE_TESTID } from "@bitcart/qa"
import { useLingui } from "@lingui/react/macro"

import { useCheckout } from "../hooks"

export const RecommendedFee = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { recommendedFee } = useCheckout("payment").payment

  return (
    recommendedFee !== null && (
      <p className={className} data-testid={CHECKOUT_RECOMMENDED_FEE_TESTID}>
        {t`Recommended fee: ${recommendedFee} sat/byte`}
      </p>
    )
  )
}
