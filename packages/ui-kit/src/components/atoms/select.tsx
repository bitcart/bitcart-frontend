//* Originally ported from: https://ui.shadcn.com

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/utils"

export type SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = SelectPrimitive.Root.Props<Value, Multiple> & {}

export const Select = <Value, Multiple extends boolean | undefined = false>({
  ...props
}: SelectProps<Value, Multiple>) => {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

export type SelectGroupProps = SelectPrimitive.Group.Props & {}

export const SelectGroup: React.FC<SelectGroupProps> = ({ className, ...props }) => {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

export type SelectValueProps = SelectPrimitive.Value.Props & {}

export const SelectValue: React.FC<SelectValueProps> = ({ className, ...props }) => {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

export type SelectLabelProps = SelectPrimitive.GroupLabel.Props & {}

export const SelectLabel: React.FC<SelectLabelProps> = ({ className, ...props }) => {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

export type SelectSeparatorProps = SelectPrimitive.Separator.Props & {}

export const SelectSeparator: React.FC<SelectSeparatorProps> = ({ className, ...props }) => {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 pointer-events-none h-px", className)}
      {...props}
    />
  )
}

export type SelectScrollUpButtonProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollUpArrow
> & {}

export const SelectScrollUpButton: React.FC<SelectScrollUpButtonProps> = ({
  className,
  ...props
}) => {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 bg-popover py-1 z-10 flex w-full cursor-default items-center justify-center",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

export type SelectScrollDownButtonProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollDownArrow
> & {}

export const SelectScrollDownButton: React.FC<SelectScrollDownButtonProps> = ({
  className,
  ...props
}) => {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 bg-popover py-1 z-10 flex w-full cursor-default items-center justify-center",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  )
}
