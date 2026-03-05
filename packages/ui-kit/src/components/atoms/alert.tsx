import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { alertVariants } from "./alert-variants"

export const Alert = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) => {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

export const AlertTitle = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="alert-title"
      className={cn("min-h-4 font-medium tracking-tight col-start-2 line-clamp-1", className)}
      {...props}
    />
  )
}

export const AlertDescription = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        `
          text-muted-foreground gap-1 text-sm
          [&_p]:leading-relaxed
          col-start-2 grid justify-items-start
        `,
        className,
      )}
      {...props}
    />
  )
}
