import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { buttonVariants } from "./button-variants"

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    expandOnHover?: boolean
  }

export const Button: React.FC<ButtonProps> = ({
  expandOnHover = false,
  size,
  variant,
  className,
  ...props
}) => {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), {
        "sm:hover:scale-105 hover:scale-102": expandOnHover,
      })}
      {...props}
    />
  )
}
