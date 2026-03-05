import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { Button } from "./button"
import { Input } from "./input"
import { inputGroupAddonVariants, inputGroupButtonVariants } from "./input-group-variants"
import { Textarea } from "./textarea"

export const InputGroup = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        `
          group/input-group border-input rounded-md shadow-xs h-11 min-w-0 bg-white
          dark:bg-input/30
          has-[>[data-align=inline-start]]:[&>input]:pl-2
          has-[>[data-align=inline-end]]:[&>input]:pr-2
          has-[>[data-align=block-start]]:[&>input]:pb-3
          has-[>[data-align=block-end]]:[&>input]:pt-3
          has-[[data-slot=input-group-control]:focus-visible]:border-ring
          has-[[data-slot=input-group-control]:focus-visible]:ring-ring
          has-[[data-slot][aria-invalid=true]]:ring-destructive/20
          has-[[data-slot][aria-invalid=true]]:border-destructive
          dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40
          relative flex w-full items-center border-2 transition-[color,box-shadow] outline-none
          has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]
          has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col
          has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col
          has-[>textarea]:h-auto
        `,

        className,
      )}
      {...props}
    />
  )
}

export type InputGroupAddonProps = React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants> & {}

export const InputGroupAddon: React.FC<InputGroupAddonProps> = ({
  className,
  align = "inline-start",
  ...props
}) => {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("button")) {
          e.currentTarget.parentElement?.querySelector("input")?.focus()
        }
      }}
      {...props}
    />
  )
}

export const InputGroupButton = ({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) => {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

export const InputGroupText = ({ className, ...props }: React.ComponentProps<"span">) => {
  return (
    <span
      className={cn(
        `
          text-muted-foreground gap-2 text-sm
          [&_svg:not([class*='size-'])]:size-4
          flex items-center
          [&_svg]:pointer-events-none
        `,

        className,
      )}
      {...props}
    />
  )
}

export const InputGroupInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        `
          flex-1 rounded-none border-0 bg-transparent shadow-none
          focus-visible:ring-0
          dark:bg-transparent
        `,

        className,
      )}
      {...props}
    />
  )
}

export const InputGroupTextarea = ({ className, ...props }: React.ComponentProps<"textarea">) => {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        `
          py-3 flex-1 resize-none rounded-none border-0 bg-transparent shadow-none
          focus-visible:ring-0
          dark:bg-transparent
        `,

        className,
      )}
      {...props}
    />
  )
}
