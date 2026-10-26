import { Skeleton } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import { CheckoutCard } from "#/checkout"

const LoadingCard = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLingui()

  return (
    <CheckoutCard>
      <div role="status" aria-busy>
        <span className="sr-only">{t`Loading…`}</span>
        <div aria-hidden>{children}</div>
      </div>
    </CheckoutCard>
  )
}

const FooterPlaceholder = () => (
  <div className="px-5 py-3 border-border flex items-center justify-between border-t">
    <Skeleton className="h-5 w-28" />
    <Skeleton className="h-5 w-32" />
  </div>
)

export const LoadingFallback = () => (
  <LoadingCard>
    <div className="px-5 pt-4 pb-5 border-border border-b">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="size-8 rounded-full" />
      </div>

      <div className="mt-4 gap-4 flex items-center">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-40" />
        </div>

        <Skeleton className="size-16 rounded-full" />
      </div>
    </div>

    <div className="px-5 py-5 space-y-3">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
    </div>

    <FooterPlaceholder />
  </LoadingCard>
)

const ReceiptRowPlaceholder = () => (
  <div className="py-1 flex items-center justify-between">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-28" />
  </div>
)

export const ReceiptLoadingFallback = () => (
  <LoadingCard>
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <Skeleton className="mt-4 h-7 w-28" />
      <Skeleton className="mt-1 h-4 w-36" />

      <div className="mt-4">
        <ReceiptRowPlaceholder />
        <ReceiptRowPlaceholder />
        <ReceiptRowPlaceholder />
      </div>

      <div className="mt-3 pt-3 border-border border-t">
        <ReceiptRowPlaceholder />
        <ReceiptRowPlaceholder />
      </div>

      <div className="mt-3 pt-3 border-border border-t">
        <ReceiptRowPlaceholder />
        <ReceiptRowPlaceholder />
      </div>

      <Skeleton className="mt-6 h-10 rounded-md" />
    </div>

    <FooterPlaceholder />
  </LoadingCard>
)

export const RefundLoadingFallback = () => (
  <LoadingCard>
    <div className="px-6 pt-6">
      <Skeleton className="h-8 w-32" />
    </div>

    <div className="px-8 pb-8 pt-6 flex flex-col items-center">
      <Skeleton className="size-14 rounded-full" />
      <Skeleton className="mt-5 h-7 w-56" />
      <Skeleton className="mt-1 h-8 w-28" />
      <Skeleton className="mt-1 h-4 w-32" />
      <Skeleton className="mt-4 h-10 rounded-md w-full" />
      <Skeleton className="mt-5 h-10 rounded-md w-full" />
    </div>

    <FooterPlaceholder />
  </LoadingCard>
)
