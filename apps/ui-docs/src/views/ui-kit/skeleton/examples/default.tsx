import { Skeleton } from "@bitcart/ui-kit/components"

export const DefaultSkeletonExample: React.FC = () => (
  <div className="gap-3 max-w-xs flex w-full flex-col">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-2/3" />
  </div>
)
