import { CHECKOUT_REFUND_TESTID } from "@bitcart/qa"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  FieldError,
  LinkButton,
} from "@bitcart/ui-kit/components"
import type { IconComponent } from "@bitcart/ui-kit/types"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { CheckIcon, ClockIcon, RotateCcwIcon, XIcon, ZapIcon } from "lucide-react"
import { useEffect, useRef } from "react"

import {
  CheckoutCard,
  CheckoutFooter,
  ExternalLink,
  formatRefundAmount,
  StoreBrand,
  useAmountFormat,
  useCanOpenExternalLinks,
  useCheckout,
} from ".."
import type { CheckoutReceiptRefundStatus } from "../model"
import { MarkedValue } from "../parts/copyable-value"
import { useRefundForm } from "./form"
import { isConvertedRefund, type CheckoutRefundPage } from "./page"

const STATUS_ICONS: Record<CheckoutReceiptRefundStatus, { Icon: IconComponent; color: string }> = {
  unclaimed: { Icon: RotateCcwIcon, color: "text-warning" },
  pending: { Icon: ClockIcon, color: "text-muted-foreground" },
  sent: { Icon: CheckIcon, color: "text-success" },
  failed: { Icon: XIcon, color: "text-destructive-foreground" },
}

const Address = ({ value, className }: { value: string; className?: string }) => (
  <p className={cn("font-mono break-all", className)}>
    <MarkedValue value={value} isMarked />
  </p>
)

const RefundForm = ({ page }: { page: CheckoutRefundPage }) => {
  const { t } = useLingui()
  const { store } = useCheckout()
  const { form, step, coin, editAddress, handleSubmit, submitError } = useRefundForm(page)
  const containerRef = useRef<HTMLFormElement>(null)
  const previousStepRef = useRef(step)
  const { method, refund } = page

  useEffect(() => {
    if (previousStepRef.current !== step) {
      previousStepRef.current = step

      containerRef.current
        ?.querySelector<HTMLElement>(step === "review" ? "[data-review-heading]" : "input")
        ?.focus()
    }
  }, [step])

  const rateNote =
    method && isConvertedRefund(refund, method)
      ? t`Sent in ${method.symbol.toUpperCase()} at the exchange rate on the day the store sends it.`
      : null

  return (
    <form ref={containerRef} onSubmit={handleSubmit} noValidate>
      {step === "address" ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground text-balance">
            {t`${store.name} issued you a refund. Enter your address to receive it.`}
          </p>

          {method?.lightning && coin && (
            <Alert variant="accent" className="mt-5 text-left">
              <ZapIcon />
              <AlertTitle>{t`Refunds are sent on-chain`}</AlertTitle>

              <AlertDescription>
                {t`You paid with Lightning, but refunds go to a regular address. Enter an on-chain ${coin} address, not a Lightning invoice.`}
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <p
          data-review-heading
          tabIndex={-1}
          className="mt-2 text-sm text-muted-foreground text-balance outline-none"
        >
          {coin
            ? t`Refunds can't be reversed. Make sure this is your own ${coin} address.`
            : t`Refunds can't be reversed. Make sure this is your own address.`}
        </p>
      )}

      <div hidden={step !== "address"} className="mt-5 text-left">
        <form.AppField name="destination">
          {(field) => (
            <field.TextField
              required
              type="text"
              label={coin ? t`Your ${coin} address` : t`Your address`}
              description={rateNote ?? undefined}
              classNames={{ input: "font-mono" }}
            />
          )}
        </form.AppField>
      </div>

      {step === "address" ? (
        <div className="mt-5 grid">
          <form.AppForm>
            <form.SubmitButton label={t`Continue`} />
          </form.AppForm>
        </div>
      ) : (
        <>
          <div className="mt-5 p-4 rounded-xl bg-muted text-left">
            <p className="text-xs text-muted-foreground">
              {coin ? t`Your ${coin} address` : t`Your address`}
            </p>

            <form.Subscribe selector={(state) => state.values.destination}>
              {(destination) => <Address value={destination.trim()} className="mt-1 text-base" />}
            </form.Subscribe>
          </div>

          {rateNote && <p className="mt-3 text-xs text-muted-foreground">{rateNote}</p>}

          <div className="mt-5 gap-3 grid grid-cols-2">
            <Button type="button" variant="outline" size="lg" onClick={editAddress}>
              {t`Edit address`}
            </Button>

            <form.AppForm>
              <form.SubmitButton label={t`Submit refund`} />
            </form.AppForm>
          </div>

          {submitError && <FieldError className="mt-3">{submitError}</FieldError>}
        </>
      )}
    </form>
  )
}

const SubmittedRefund = ({
  page,
  status,
  amount,
}: {
  page: CheckoutRefundPage
  status: Exclude<CheckoutReceiptRefundStatus, "unclaimed">
  amount: string
}) => {
  const { t } = useLingui()
  const { store } = useCheckout()
  const canOpenExternalLinks = useCanOpenExternalLinks()
  const { refund, destination } = page
  const contactSupport = canOpenExternalLinks ? store.support : null

  const explanation = {
    pending: t`${store.name} will send ${amount} to this address. This page updates once it's sent.`,
    sent: t`${store.name} sent your refund.`,
    failed: t`${store.name} couldn't send this refund. Contact them about it.`,
  }[status]

  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground text-balance">{explanation}</p>

      {status === "pending" && destination && (
        <Address value={destination} className="mt-4 text-xs" />
      )}

      {status === "sent" && refund.transaction && (
        <div className="mt-4 text-xs">
          <p className="text-muted-foreground">{t`Transaction`}</p>

          <p className="font-mono break-all">
            {refund.transaction.explorerUrl ? (
              <ExternalLink
                href={refund.transaction.explorerUrl}
                linkClassName="hover:text-primary underline underline-offset-2"
              >
                {refund.transaction.hash}
              </ExternalLink>
            ) : (
              refund.transaction.hash
            )}
          </p>
        </div>
      )}

      {status === "failed" && contactSupport?.kind === "url" && (
        <LinkButton isExternalLink href={contactSupport.href} variant="outline" className="mt-6">
          {t`Contact store`}
        </LinkButton>
      )}

      {status === "failed" && contactSupport?.kind === "email" && (
        <LinkButton href={contactSupport.href} variant="outline" className="mt-6">
          {t`Contact store`}
        </LinkButton>
      )}
    </>
  )
}

export const CheckoutRefundScreen = ({ page }: { page: CheckoutRefundPage }) => {
  const { t } = useLingui()
  const { store, invoice } = useCheckout()
  const format = useAmountFormat()
  const { refund } = page
  const amount = formatRefundAmount(format, refund, invoice.currency)

  const { Icon, color } = STATUS_ICONS[refund.status]

  const title = {
    unclaimed: t`Refund from ${store.name}`,
    pending: t`Refund requested`,
    sent: t`Refund sent`,
    failed: t`Refund not sent`,
  }[refund.status]

  return (
    <CheckoutCard>
      <div data-testid={CHECKOUT_REFUND_TESTID}>
        <div className="px-6 pt-6">
          <StoreBrand />
        </div>

        <div className="px-8 pb-8 pt-6 text-center">
          <Icon className={cn("size-14 mx-auto", color)} strokeWidth={1.5} />
          <h1 className="mt-5 text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{amount}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {t`Invoice`} #{invoice.id}
          </p>

          {refund.status === "unclaimed" ? (
            <RefundForm page={page} />
          ) : (
            <SubmittedRefund page={page} status={refund.status} amount={amount} />
          )}
        </div>
      </div>

      <CheckoutFooter />
    </CheckoutCard>
  )
}
