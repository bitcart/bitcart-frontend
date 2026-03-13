import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { Separator } from "../atoms/separator"
import { buttonGroupVariants } from "./button-group-variants"

export type ButtonGroupProps = React.ComponentProps<"div"> &
  VariantProps<typeof buttonGroupVariants> & {}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ className, orientation, ...props }) => {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

export type ButtonGroupTextProps = React.ComponentProps<"div"> & {
  asChild?: boolean
}

export const ButtonGroupText: React.FC<ButtonGroupTextProps> = ({
  className,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        `
          bg-muted gap-2 rounded-md px-4 text-sm font-medium shadow-xs
          [&_svg:not([class*='size-'])]:size-4
          flex items-center border
          [&_svg]:pointer-events-none
        `,
        className,
      )}
      {...props}
    />
  )
}

export type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator> & {}

export const ButtonGroupSeparator: React.FC<ButtonGroupSeparatorProps> = ({
  className,
  orientation = "vertical",
  ...props
}) => {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input m-0! relative self-stretch data-[orientation=vertical]:h-auto",
        className,
      )}
      {...props}
    />
  )
}
