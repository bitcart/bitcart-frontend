import { cn } from "@bitcart/ui-kit/utils"

import {
  AmountBreakdown,
  ExtensionSlot,
  LightningNodeInfo,
  ManualPaymentDivider,
  MethodHint,
  PartialPaymentProgress,
  PayingWith,
  PaymentAddress,
  PaymentAmountHeading,
  PaymentQr,
  RecommendedFee,
  SenderAddress,
  WalletButton,
  useCheckout,
} from "#/checkout"

import { FlowCard } from "./card"

export const FlowPayment = () => {
  const { environment } = useCheckout("payment")

  return (
    <FlowCard>
      <PayingWith />

      <div className="px-5 pb-5 pt-4">
        <PartialPaymentProgress showAmountDue={false} className="mb-4" />
        <AmountBreakdown className="mb-4" />
        <PaymentAmountHeading className="mb-4" />
        <SenderAddress className="mb-4" />

        {!environment.terminal && (
          <div className="sm:hidden">
            <WalletButton className="rounded-xl w-full" />
            <ManualPaymentDivider className="my-4" />
          </div>
        )}

        <div className={cn("mb-3 flex justify-center", !environment.terminal && "max-sm:hidden")}>
          <PaymentQr />
        </div>

        <PaymentAddress />
        <RecommendedFee className="mt-1 text-xs text-muted-foreground text-center" />
        <LightningNodeInfo className="mt-2" />
        <MethodHint className="mt-3" />
        <WalletButton className="mt-4 rounded-xl max-sm:hidden w-full" />
      </div>

      <ExtensionSlot name="checkout:payment-extra" className="px-5 py-4 border-border border-t" />
    </FlowCard>
  )
}
