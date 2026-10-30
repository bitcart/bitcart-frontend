import { Button, LinkButton } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { trackEvent } from "@bitcart/vike-kit/telemetry"
import { Trans, useLingui } from "@lingui/react/macro"
import { Heart, Loader } from "lucide-react"
import { useCallback, useState } from "react"

import { env } from "@/env"

const DONATION_PRICE = 5
const PAID_INVOICE_STATUSES = new Set(["paid", "confirmed", "complete"])

type CheckoutStatus = {
  status: string
  sent_price: string
  currency: string
}

const trackDonationPayment = (checkout: HTMLElement): void => {
  const handleStatus = (event: Event) => {
    const { status, sent_price, currency } = (event as CustomEvent<CheckoutStatus>).detail

    if (PAID_INVOICE_STATUSES.has(status)) {
      checkout.removeEventListener("bitcart:status", handleStatus)
      trackEvent("Donation Paid", { revenue: { amount: sent_price, currency } })
    }
  }

  checkout.addEventListener("bitcart:status", handleStatus)
}

export type AboutSectionProps = {
  className?: string
}

export const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const { t } = useLingui()
  const [donationLoading, setDonationLoading] = useState(false)

  const showDonation = useCallback(async () => {
    trackEvent("Donate Click")
    setDonationLoading(true)

    try {
      const response = await fetch("https://api.bitcart.ai/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: env.BITCART_STORE,
          price: DONATION_PRICE,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create invoice")
      }

      const { id } = (await response.json()) as { id: string }
      const checkout = window.Bitcart?.open(id)

      if (checkout) trackDonationPayment(checkout)
    } finally {
      setDonationLoading(false)
    }
  }, [])

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={cn("gap-6 flex flex-col", className)}
    >
      <h2 id="about-heading" className="text-4xl font-bold">
        <Trans>
          What is <span className="text-accent-foreground">Bitcart</span>
        </Trans>
      </h2>

      <div className="gap-4 text-muted-foreground leading-relaxed flex flex-col">
        <p>
          <Trans>
            Bitcart is a self-hosted, open-source cryptocurrency all-in-one solution. It&apos;s
            secure, private, censorship-resistant and free.
          </Trans>
        </p>

        <p>
          <Trans>
            Receive cryptocurrency and token payments without any fees or third-party involvement.
            You are your own bank. Funds go directly to your wallet, your private key is never
            required.
          </Trans>
        </p>

        <p>
          <Trans>
            We support classical blockchains like Bitcoin, Bitcoin Cash, Litecoin and others, as
            well as smart contract platforms (Ethereum, Binance Smart Chain, Tron) and token
            platforms like ERC20, BEP20, TRC20 and others.
          </Trans>
        </p>
      </div>

      <div className="sm:flex-row gap-4 pt-4 sm:flex-wrap flex flex-col">
        <LinkButton isExternalLink href="https://admin.bitcart.ai" size="lg">
          {t`Live Demo`}
        </LinkButton>

        <Button size="lg" disabled={donationLoading} onClick={showDonation}>
          {donationLoading ? (
            <>
              <Loader className="animate-spin" />
              <span>{t`Loading...`}</span>
            </>
          ) : (
            <>
              <span>{t`Donate`}</span>
              <Heart />
            </>
          )}
        </Button>

        <LinkButton href="/support-us" size="lg">
          {t`Support as a Company`}
        </LinkButton>
      </div>
    </section>
  )
}
