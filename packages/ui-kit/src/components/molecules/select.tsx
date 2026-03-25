//* Ported from: https://ui.shadcn.com

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/utils"

import { SelectScrollDownButton, SelectScrollUpButton } from "../atoms/select"

export const SelectTrigger = ({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        `
          border-input gap-2 rounded-md px-3 py-2
          md:py-3
          text-sm shadow-xs bg-background/30
          data-placeholder:text-muted-foreground
          [&_svg:not-[class*='text-']]:text-muted-foreground
          focus-visible:border-ring focus-visible:ring-ring/50
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
          dark:bg-input/30
          dark:hover:bg-input/50
          data-[size=default]:h-11
          data-[size=sm]:h-9
          *:data-[slot=select-value]:gap-2
          [&_svg:not-[class*='size-']]:size-4
          flex w-full items-center justify-between border-2 whitespace-nowrap
          transition-[color,box-shadow] outline-none
          focus-visible:ring-[3px]
          disabled:cursor-not-allowed disabled:opacity-50
          *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex
          *:data-[slot=select-value]:items-center
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon render={<ChevronDownIcon className="size-4 opacity-50" />} />
    </SelectPrimitive.Trigger>
  )
}

export const SelectContent = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50 select-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            `
              bg-popover text-popover-foreground p-1
              data-closed:fade-out-0
              data-open:fade-in-0
              data-closed:zoom-out-95
              data-open:zoom-in-95
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
              rounded-md shadow-md
              data-open:animate-in
              data-closed:animate-out
              relative z-50 max-h-[--available-height] w-[--anchor-width] min-w-[8rem]
              origin-[--transform-origin] overflow-x-hidden overflow-y-auto border-2 bg-clip-padding
            `,

            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

export const SelectItem = ({ className, children, ...props }: SelectPrimitive.Item.Props) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        `
          focus:bg-accent focus:text-accent-foreground
          [&_svg:not-[class*='text-']]:text-muted-foreground
          gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm
          [&_svg:not-[class*='size-']]:size-4
          *:[span]:last:gap-2
          relative flex w-full cursor-default items-center outline-hidden select-none
          data-disabled:pointer-events-none data-disabled:opacity-50
          [&_svg]:pointer-events-none [&_svg]:shrink-0
          *:[span]:last:flex *:[span]:last:items-center
        `,

        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="gap-2 flex flex-1 shrink-0 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator
        render={
          <span
            data-slot="select-item-indicator"
            className="right-2 size-4 pointer-events-none absolute flex items-center justify-center"
          />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
