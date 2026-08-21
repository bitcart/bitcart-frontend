import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"

import { BRAND_UMBRELLA_NAME } from "#/common/constants"

export const CheckoutHeader = () => {
  return (
    <div className="py-4 flex items-center justify-center">
      <BitcartWordmarkIcon role="img" aria-label={BRAND_UMBRELLA_NAME} className="h-8" />
    </div>
  )
}
