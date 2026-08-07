//* Ported from: https://ui.shadcn.com

import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { alertVariants } from "./alert-variants"

export type AlertProps = React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & {}

export const Alert: React.FC<AlertProps> = ({ className, variant, ...props }) => {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

export type AlertTitleProps = React.ComponentProps<"div"> & {}

export const AlertTitle: React.FC<AlertTitleProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="alert-title"
      className={cn("min-h-4 font-medium tracking-tight col-start-2 line-clamp-1", className)}
      {...props}
    />
  )
}

export type AlertDescriptionProps = React.ComponentProps<"div"> & {}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className, ...props }) => {
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
