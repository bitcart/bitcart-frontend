import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Link } from "@bitcart/vike-kit/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { Heart, Loader } from "lucide-react"
import { useCallback, useState } from "react"

import { env } from "@/env"

export type AboutSectionProps = {
  className?: string
}

export const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const { t } = useLingui()
  const [donationLoading, setDonationLoading] = useState(false)

  const showDonation = useCallback(async () => {
    const price = 5 // $5
    setDonationLoading(true)

    const response = await fetch("https://api.bitcart.ai/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        store_id: env.BITCART_STORE,
        price: price,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create invoice")
    }

    const data = (await response.json()) as { id: string }
    setDonationLoading(false)

    window?.bitcart?.showInvoice(data.id)
  }, [])

  return (
    <section id="about" className={cn("gap-6 flex flex-col", className)}>
      <h2 className="text-4xl font-bold">
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
        <Button size="lg" render={<Link href="https://admin.bitcart.ai" />} nativeButton={false}>
          {t`Live Demo`}
        </Button>

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

        <Button size="lg" render={<Link href="/support-us" />} nativeButton={false}>
          {t`Support as a Company`}
        </Button>
      </div>
    </section>
  )
}
