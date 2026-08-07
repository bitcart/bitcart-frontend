//* Ported from: https://ui.shadcn.com

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

export type EmptyProps = React.ComponentProps<"div"> & {}

export const Empty: React.FC<EmptyProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="empty"
      className={cn(
        `
          min-w-0 gap-6 rounded-lg p-6
          md:p-12
          flex flex-1 flex-col items-center justify-center border-dashed text-center text-balance
        `,

        className,
      )}
      {...props}
    />
  )
}

export type EmptyHeaderProps = React.ComponentProps<"div"> & {}

export const EmptyHeader: React.FC<EmptyHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="empty-header"
      className={cn("max-w-sm gap-2 flex flex-col items-center text-center", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",

  {
    variants: {
      variant: {
        default: "bg-transparent",

        icon: `
          bg-muted text-foreground size-10 rounded-lg
          [&_svg:not-[class*='size-']]:size-6
          flex shrink-0 items-center justify-center
        `,
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
)

export type EmptyMediaProps = React.ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants> & {}

export const EmptyMedia: React.FC<EmptyMediaProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

export type EmptyTitleProps = React.ComponentProps<"div"> & {}

export const EmptyTitle: React.FC<EmptyTitleProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

export type EmptyDescriptionProps = React.ComponentProps<"p"> & {}

export const EmptyDescription: React.FC<EmptyDescriptionProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        `
          text-muted-foreground text-sm/relaxed
          [&>a:hover]:text-primary
          [&>a]:underline [&>a]:underline-offset-4
        `,

        className,
      )}
      {...props}
    />
  )
}

export type EmptyContentProps = React.ComponentProps<"div"> & {}

export const EmptyContent: React.FC<EmptyContentProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "max-w-sm min-w-0 gap-4 text-sm flex w-full flex-col items-center text-balance",
        className,
      )}
      {...props}
    />
  )
}
