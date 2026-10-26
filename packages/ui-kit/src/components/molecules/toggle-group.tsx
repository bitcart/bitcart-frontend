//* Originally ported from: https://coss.com/ui

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"
import { createContext, use } from "react"

import { cn } from "@/utils"

import { Toggle, type ToggleProps } from "../atoms/toggle"
import { type toggleVariants } from "../atoms/toggle-variants"
import { buttonGroupVariants } from "./button-group-variants"

type ToggleGroupStyle = VariantProps<typeof toggleVariants>

const ToggleGroupContext = createContext<
  ToggleGroupStyle & Pick<ToggleGroupPrimitive.Props, "orientation">
>({})

export type ToggleGroupProps = ToggleGroupPrimitive.Props & ToggleGroupStyle & {}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  children,
  ...props
}) => {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      orientation={orientation}
      className={cn(
        variant === "outline"
          ? buttonGroupVariants({ orientation })
          : ["gap-0.5 flex w-fit", orientation === "vertical" && "flex-col"],

        className,
      )}
      {...props}
    >
      <ToggleGroupContext value={{ variant, size, orientation }}>{children}</ToggleGroupContext>
    </ToggleGroupPrimitive>
  )
}

export type ToggleGroupItemProps = ToggleProps & {}

export const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  className,
  variant,
  size,
  ...props
}) => {
  const context = use(ToggleGroupContext)

  return (
    <Toggle
      data-slot="toggle-group-item"
      variant={context.variant ?? variant}
      size={context.size ?? size}
      className={cn(
        context.orientation === "vertical"
          ? "pointer-coarse:after:min-h-auto"
          : "pointer-coarse:after:min-w-auto",

        className,
      )}
      {...props}
    />
  )
}
