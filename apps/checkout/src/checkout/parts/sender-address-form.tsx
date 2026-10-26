import { Alert, AlertDescription, Button, FieldError } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { WalletIcon } from "lucide-react"
import { useEffect, useRef } from "react"

import { useCheckout } from "../hooks"
import { SENDER_ADDRESS_FIELD, useSenderAddressForm } from "../sender-address-form"
import { useWalletButtonKind } from "../wallet-pay/button-kind"
import { EthPluginOffer } from "./eth-plugin-offer"
import { LabeledDivider } from "./manual-payment-divider"
import { WalletButton } from "./wallet-button"

export const SenderAddressForm = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const { ethPluginOffer } = useCheckout("address")
  const { form, coin, handleSubmit, submitError } = useSenderAddressForm()
  const formRef = useRef<HTMLFormElement>(null)
  const isOfferShown = ethPluginOffer?.isShown === true
  const wasOfferShownRef = useRef(isOfferShown)
  const hasWalletOption = useWalletButtonKind().kind !== "none"

  useEffect(() => {
    if (wasOfferShownRef.current && !isOfferShown) {
      formRef.current?.querySelector("input")?.focus()
    }

    wasOfferShownRef.current = isOfferShown
  }, [isOfferShown])

  if (isOfferShown) {
    return <EthPluginOffer className={className} />
  } else
    return (
      <div className={className}>
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="gap-4 flex flex-col">
            <p className="text-sm text-muted-foreground">
              {t`Enter the address you'll pay from. Only payments from this address count toward this invoice.`}
            </p>

            <Alert variant="accent">
              <WalletIcon />

              <AlertDescription>
                {t`Send from your own wallet: payments sent straight from an exchange can't be matched to your invoice.`}
              </AlertDescription>
            </Alert>

            <form.AppField name={SENDER_ADDRESS_FIELD}>
              {(field) => (
                <field.TextField
                  required
                  type="text"
                  label={t`Your ${coin} address`}
                  description={t`You can't change it once you continue.`}
                  classNames={{ input: "font-mono" }}
                />
              )}
            </form.AppField>

            {submitError && <FieldError>{submitError}</FieldError>}

            <div className="gap-2 grid">
              <form.AppForm>
                <form.SubmitButton label={t`Continue to payment`} />
              </form.AppForm>

              {ethPluginOffer && (
                <Button type="button" variant="ghost" onClick={ethPluginOffer.show}>
                  {t`Skip`}
                </Button>
              )}
            </div>
          </div>
        </form>

        {hasWalletOption && (
          <>
            <LabeledDivider label={t`or`} className="my-4" />
            <WalletButton className="w-full" />
          </>
        )}
      </div>
    )
}
