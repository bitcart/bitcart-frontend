//* Originally ported from: https://coss.com/ui

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

import { toggleVariants } from "./toggle-variants"

export type ToggleProps = TogglePrimitive.Props & VariantProps<typeof toggleVariants> & {}

export const Toggle: React.FC<ToggleProps> = ({ className, variant, size, ...props }) => {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}
