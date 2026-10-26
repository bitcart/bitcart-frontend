import {
  CheckoutCard,
  CheckoutFooter,
  ExtensionSlot,
  StatusOverlay,
  useAmountFormat,
  useCheckout,
  StoreBrandRow,
  useReceiptPrinter,
} from ".."

export const CheckoutStatusScreen = () => {
  const {
    status,
    exception,
    store,
    invoice,
    received,
    receipt,
    environment,
    isCompletedLive,
    cancelRedirect,
  } = useCheckout("status")

  const format = useAmountFormat()
  const receiptPrinter = useReceiptPrinter()

  const getPrice = (): string | null => {
    if (!invoice.isAnyAmount) {
      return format.fiat(invoice.effectivePrice)
    } else if (received) {
      return format.fiat(received.price)
    } else return null
  }

  const receivedAmount =
    invoice.isAnyAmount && received ? format.crypto(received.amount, received.symbol) : undefined

  const refund =
    receipt?.refund && !environment.terminal
      ? {
          href: `/refunds/${receipt.refund.id}` as const,
          isUnclaimed: receipt.refund.status === "unclaimed",
        }
      : undefined

  return (
    <CheckoutCard>
      <StoreBrandRow className="px-5 py-4 border-border border-b" />
      <ExtensionSlot name="checkout:header-extra" className="px-5 py-3" />

      <StatusOverlay
        status={status}
        exception={exception}
        storeName={store.name}
        storeSupport={store.support}
        invoiceId={invoice.id}
        price={getPrice()}
        receivedAmount={receivedAmount}
        celebrates={isCompletedLive}
        receiptHref={receipt ? `/i/${invoice.id}/receipt` : undefined}
        receiptPrinter={receiptPrinter}
        refund={refund}
        redirectUrl={invoice.redirectUrl ?? ""}
        cancelRedirect={cancelRedirect}
      />

      <CheckoutFooter />
    </CheckoutCard>
  )
}
