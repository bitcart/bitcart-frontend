import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"

import { CheckoutCloseButton } from "#/checkout"

export const CheckoutHeader = () => {
  return (
    <div className="py-4 relative flex items-center justify-center">
      <BitcartWordmarkIcon className="h-8" />
      <CheckoutCloseButton className="end-3 absolute" />
    </div>
  )
}
