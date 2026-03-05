import { cn } from "@/utils"

export type CardProps = React.ComponentProps<"div"> & {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card"
      className={cn(
        "gap-6 rounded-lg py-6 elevation-1 bg-card color-card-foreground flex flex-col border",
        className,
      )}
      {...props}
    />
  )
}

export type CardHeaderProps = React.ComponentProps<"div"> & {}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        `
          gap-2 px-6
          [.border-b]:pb-6
          @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start
          has-data-[slot=card-action]:grid-cols-[1fr_auto]
        `,

        className,
      )}
      {...props}
    />
  )
}

export type CardTitleProps = React.ComponentProps<"div"> & {}

export const CardTitle: React.FC<CardTitleProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  )
}

export type CardDescriptionProps = React.ComponentProps<"div"> & {}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export type CardActionProps = React.ComponentProps<"div"> & {}

export const CardAction: React.FC<CardActionProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

export type CardContentProps = React.ComponentProps<"div"> & {}

export const CardContent: React.FC<CardContentProps> = ({ className, ...props }) => {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}

export type CardFooterProps = React.ComponentProps<"div"> & {}

export const CardFooter: React.FC<CardFooterProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-footer"
      className={cn("px-6 [.border-t]:pt-6 flex items-center", className)}
      {...props}
    />
  )
}
