import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { ZapIcon } from "lucide-react"

import { useCheckout } from "../hooks"
import type { CheckoutMethod } from "../model"
import { getMethodNetwork, getNetworkLabels } from "../networks"

const LIGHTNING_ICON_CLASS_NAME = "size-2.5 fill-[#F59E0B] text-[#F59E0B]"

const MethodBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-sm px-1 py-0.5 bg-muted text-muted-foreground font-semibold inline-flex items-center text-[10px]">
    {children}
  </span>
)

export const MethodTitle = ({
  method,
  className,
}: {
  method: CheckoutMethod
  className?: string
}) => {
  const { t } = useLingui()
  const { methods } = useCheckout()
  const network = getMethodNetwork(method)

  const peers = methods.filter(
    (other) =>
      other.id !== method.id &&
      other.label === null &&
      other.symbol === method.symbol &&
      other.lightning === method.lightning,
  )

  // TODO: handle it backend side
  const hasTwin =
    method.label === null && peers.some((other) => getMethodNetwork(other) === network)

  const hasPeerElsewhere = peers.some((other) => getMethodNetwork(other) !== network)

  const networkLabels =
    !method.lightning && (method.contract !== null || hasPeerElsewhere)
      ? getNetworkLabels(network)
      : null

  const networkName = networkLabels?.name
  const chainBadge = networkLabels?.badge

  if (method.label !== null) {
    return <span className={cn("min-w-0 truncate", className)}>{method.label}</span>
  } else if (hasTwin) {
    return <span className={cn("min-w-0 truncate", className)}>{method.name}</span>
  } else
    return (
      <>
        <span className={className}>{method.symbol.toUpperCase()}</span>

        {method.lightning && (
          <MethodBadge>
            <ZapIcon aria-hidden className={LIGHTNING_ICON_CLASS_NAME} />
            <span className="sr-only">{t`Lightning`}</span>
          </MethodBadge>
        )}

        {networkLabels && (
          <MethodBadge>
            <span aria-hidden>{networkLabels.badge}</span>
            <span className="sr-only">
              {networkName ? t`on ${networkName}` : t`on chain ${chainBadge}`}
            </span>
          </MethodBadge>
        )}
      </>
    )
}
