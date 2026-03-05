import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { buttonVariants } from "./button-variants"

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    expandOnHover?: boolean
    asChild?: boolean
  }

export const Button: React.FC<ButtonProps> = ({
  asChild = false,
  expandOnHover = false,
  size,
  variant,
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), {
        "hover:scale-105": expandOnHover,
      })}
      {...props}
    />
  )
}
