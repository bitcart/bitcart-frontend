import { Button, LinkButton } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Trans, useLingui } from "@lingui/react/macro"
import { useEffect, useRef } from "react"

import { useCheckout } from "../hooks"
import { ExternalLink } from "./external-link"

const ETH_PLUGIN_DOCS_URL = "https://docs.bitcart.ai/guides/eth-payments-plugin"
const ETH_PLUGIN_DEMO_URL = "https://testnet.bitcart.ai"

export const EthPluginOffer = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { ethPluginOffer } = useCheckout("address")
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => headingRef.current?.focus(), [])

  return (
    ethPluginOffer && (
      <div className={cn("text-center", className)}>
        <h2 ref={headingRef} tabIndex={-1} className="text-base font-semibold outline-none">
          {t`For server owners`}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground text-balance">
          {t`Buy the ETH payments plugin to remove this step for ETH, POL, TRX, BNB and tokens such as USDT and USDC.`}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          <Trans>
            Try it on{" "}
            <ExternalLink
              href={ETH_PLUGIN_DEMO_URL}
              linkClassName="text-primary underline-offset-2 hover:underline"
            >
              testnet.bitcart.ai
            </ExternalLink>
          </Trans>
        </p>

        <div className="mt-5 gap-2 flex flex-wrap justify-center">
          <Button type="button" variant="outline" onClick={ethPluginOffer.hide}>
            {t`Back`}
          </Button>

          {ethPluginOffer.buyUrl && (
            <LinkButton isExternalLink href={ethPluginOffer.buyUrl}>
              {t`Buy plugin`}
            </LinkButton>
          )}

          <LinkButton isExternalLink href={ETH_PLUGIN_DOCS_URL} variant="outline">
            {t`Docs`}
          </LinkButton>
        </div>
      </div>
    )
  )
}
