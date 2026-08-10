import { Skeleton } from "@bitcart/ui-kit/components"

export const CircleSkeletonExample: React.FC = () => (
  <div className="gap-4 max-w-xs flex w-full items-center">
    <Skeleton className="size-12 rounded-full" />

    <div className="gap-2 flex flex-1 flex-col">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  </div>
)
