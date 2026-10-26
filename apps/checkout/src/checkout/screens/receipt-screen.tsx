import { formatDateTime } from "@bitcart/core/utils"
import { CHECKOUT_RECEIPT_TESTID } from "@bitcart/qa"
import { LinkButton } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import {
  CheckoutCard,
  CheckoutFooter,
  ExternalLink,
  formatRefundAmount,
  getRefundStatusLabel,
  PrintReceiptButton,
  PrintReceiptFailure,
  ReceiptStatusBadge,
  StoreBrand,
  useAmountFormat,
  useCheckout,
  useFormattingLocale,
  useReceiptPrinter,
} from ".."
import type { CheckoutReceipt, CheckoutReceiptTransaction } from "../model"

//! Pinned to black: browsers drop backgrounds when printing, which leaves dark mode's light text on
//! white paper.
const PRINT_TEXT_CLASS_NAME = "print:**:text-black"

const Row = ({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) => (
  <div className={cn("gap-4 py-1 flex items-baseline justify-between", className)}>
    <dt className="text-muted-foreground shrink-0">{label}</dt>
    <dd className="min-w-0 text-right">{children}</dd>
  </div>
)

const TransactionRow = ({
  label,
  amount,
  hash,
  explorerUrl,
}: Omit<CheckoutReceiptTransaction, "amount"> & { label: string; amount?: string }) => (
  <div className="py-1">
    <dt className="gap-4 text-muted-foreground flex justify-between">
      {label}
      {amount && <span className="text-foreground">{amount}</span>}
    </dt>

    <dd className="mt-0.5 text-xs font-mono break-all">
      {explorerUrl ? (
        <ExternalLink
          href={explorerUrl}
          linkClassName="hover:text-primary underline underline-offset-2"
        >
          {hash}
        </ExternalLink>
      ) : (
        hash
      )}
    </dd>
  </div>
)

const SECTION_CLASS_NAME = "mt-3 pt-3 text-sm border-border border-t"

const Section = ({ children }: { children: React.ReactNode }) => (
  <dl className={SECTION_CLASS_NAME}>{children}</dl>
)

export const CheckoutReceiptScreen = ({ receipt }: { receipt: CheckoutReceipt }) => {
  const { t, i18n } = useLingui()
  const { invoice, store, environment } = useCheckout("status")
  const format = useAmountFormat()
  const locale = useFormattingLocale()
  const printer = useReceiptPrinter()
  const { items, discount, payment, refund } = receipt

  const formatDate = (isoDate: string) => formatDateTime(isoDate, locale)

  return (
    <CheckoutCard className="print:max-w-none print:border-none print:shadow-none">
      <div data-testid={CHECKOUT_RECEIPT_TESTID} className={cn("px-6 py-6", PRINT_TEXT_CLASS_NAME)}>
        <div className="gap-4 flex items-start justify-between">
          <div className="min-w-0 flex flex-1">
            <StoreBrand />
          </div>

          <ReceiptStatusBadge />
        </div>

        <h1 className="mt-4 text-xl font-semibold">{t`Receipt`}</h1>
        <p className="text-sm text-muted-foreground">{store.name}</p>

        <dl className="mt-4 text-sm">
          <Row label={t`Invoice`}>
            <span className="font-mono break-all">{invoice.id}</span>
          </Row>

          {invoice.orderId && <Row label={t`Order`}>{invoice.orderId}</Row>}
          <Row label={t`Issued`}>{formatDate(receipt.createdAt)}</Row>
          {receipt.paidAt && <Row label={t`Paid on`}>{formatDate(receipt.paidAt)}</Row>}
        </dl>

        {items.length > 0 && (
          <ul className={SECTION_CLASS_NAME}>
            {items.map(({ id, name, quantity }) => (
              <li key={id} className="gap-4 py-1 flex items-baseline justify-between">
                <span className="min-w-0">{name}</span>
                <span className="text-muted-foreground shrink-0">×{quantity}</span>
              </li>
            ))}
          </ul>
        )}

        <Section>
          {discount && (
            <>
              <Row label={t`Price`}>
                <s>{format.fiat(discount.originalPrice)}</s>
              </Row>

              <Row label={t`Discount`}>
                {discount.name} −{discount.percent}%
              </Row>
            </>
          )}

          <Row label={t`Total`} className="font-semibold">
            {format.fiat(receipt.total)}
          </Row>

          {receipt.amountPaid && (
            <Row label={t`Amount paid`}>
              {format.fiat(receipt.amountPaid)}

              {payment && (
                <span className="text-muted-foreground block">
                  {format.crypto(payment.amount, payment.symbol)}
                </span>
              )}
            </Row>
          )}
        </Section>

        {payment && (
          <Section>
            <Row label={t`Payment method`}>{payment.name}</Row>
            <Row label={t`Exchange rate`}>{format.rate(payment.rate, payment.symbol)}</Row>

            {payment.networkCost && (
              <Row label={t`Network cost`}>
                {format.crypto(payment.networkCost, payment.symbol)}
              </Row>
            )}

            {payment.transactions.map(({ hash, amount, explorerUrl }) => (
              <TransactionRow
                key={hash}
                label={payment.lightning ? t`Payment hash` : t`Transaction`}
                hash={hash}
                explorerUrl={explorerUrl}
                amount={
                  payment.transactions.length > 1 && amount !== null
                    ? format.crypto(amount, payment.symbol)
                    : undefined
                }
              />
            ))}
          </Section>
        )}

        {refund && (
          <Section>
            <Row label={t`Refund`}>{formatRefundAmount(format, refund, invoice.currency)}</Row>

            <Row label={t`Refund status`}>{getRefundStatusLabel(i18n, refund.status)}</Row>
            <Row label={t`Refund issued`}>{formatDate(refund.createdAt)}</Row>

            {refund.transaction && (
              <TransactionRow label={t`Refund transaction`} {...refund.transaction} />
            )}

            {!environment.terminal && (
              <div className="mt-2 print:hidden">
                <LinkButton
                  href={`/refunds/${refund.id}`}
                  variant={refund.status === "unclaimed" ? "default" : "outline"}
                  size="sm"
                >
                  {refund.status === "unclaimed" ? t`Claim refund` : t`View refund`}
                </LinkButton>
              </div>
            )}
          </Section>
        )}

        {store.support && (
          <p className="mt-3 pt-3 text-sm text-muted-foreground border-border border-t">
            {t`Questions about this payment?`}{" "}
            <ExternalLink
              href={store.support.href}
              newTab={store.support.kind === "url"}
              className="text-foreground"
              linkClassName="hover:text-primary underline underline-offset-2"
            >
              {store.support.kind === "url" ? store.support.href : store.support.address}
            </ExternalLink>
          </p>
        )}

        <PrintReceiptButton printer={printer} className="mt-6 print:hidden" />
        <PrintReceiptFailure printer={printer} className="print:hidden" />
      </div>

      <CheckoutFooter className="print:hidden" />
    </CheckoutCard>
  )
}
