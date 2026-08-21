import { Skeleton } from "@bitcart/ui-kit/components"

import { CheckoutCard } from "./checkout-card"
import { CheckoutHeader } from "./checkout-header"

export const LoadingFallback = () => {
  return (
    <CheckoutCard>
      <CheckoutHeader />
      <Skeleton className="h-9 rounded-none" />

      <div className="px-4 py-3 flex items-center justify-between border-b">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="px-4 py-3 border-b">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 ml-auto" />
            <Skeleton className="h-3 w-24 ml-auto" />
          </div>
        </div>
      </div>

      <div className="flex">
        <Skeleton className="h-10 flex-1 rounded-none" />
        <Skeleton className="h-10 flex-1 rounded-none" />
      </div>

      <div className="px-4 py-6 flex justify-center">
        <Skeleton className="h-56 w-56 rounded-lg" />
      </div>

      <div className="px-4 py-4 flex justify-center">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="px-4 py-4 flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
    </CheckoutCard>
  )
}
