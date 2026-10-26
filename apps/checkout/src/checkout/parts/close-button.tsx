import { CHECKOUT_CLOSE_TESTID } from "@bitcart/qa"
import { Button } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { XIcon } from "lucide-react"

import { useCheckoutAppConfig } from "../hooks"

export const CheckoutCloseButton = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { close } = useCheckoutAppConfig()

  if (!close) {
    return null
  } else
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label={t`Close`}
        data-testid={CHECKOUT_CLOSE_TESTID}
        onClick={close}
        className={className}
      >
        <XIcon />
      </Button>
    )
}
