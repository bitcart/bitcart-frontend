//* Originally ported from: https://ui.shadcn.com

import { cn } from "@/utils"

export type SkeletonProps = React.ComponentProps<"div"> & {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
  <div
    data-slot="skeleton"
    className={cn("bg-accent animate-pulse rounded-md", className)}
    {...props}
  />
)
