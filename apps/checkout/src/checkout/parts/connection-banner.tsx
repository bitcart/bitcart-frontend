import { SocketConnectionStatusBanner } from "@bitcart/ui-kit/components"

import { useCheckoutConnection } from "../hooks"

export const CheckoutConnectionBanner = () => {
  const connection = useCheckoutConnection()

  return connection && <SocketConnectionStatusBanner connectionHandle={connection} />
}
