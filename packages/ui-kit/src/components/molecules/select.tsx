import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/utils"

import { SelectScrollDownButton, SelectScrollUpButton } from "../atoms/select"

export const SelectTrigger = ({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
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
          data-[placeholder]:text-muted-foreground
          [&_svg:not([class*='text-'])]:text-muted-foreground
          focus-visible:border-ring focus-visible:ring-ring/50
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
          dark:bg-input/30
          dark:hover:bg-input/50
          data-[size=default]:h-11
          data-[size=sm]:h-9
          *:data-[slot=select-value]:gap-2
          [&_svg:not([class*='size-'])]:size-4
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

      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export const SelectContent = ({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          `
            bg-popover text-popover-foreground
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
            rounded-md shadow-md
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem]
            origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto
            border
          `,

          position === "popper" &&
            `
              data-[side=bottom]:translate-y-1
              data-[side=left]:-translate-x-1
              data-[side=right]:translate-x-1
              data-[side=top]:-translate-y-1
            `,

          className,
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />

        <SelectPrimitive.Viewport
          className={cn(
            "p-1",

            position === "popper" &&
              `
                scroll-my-1 h-(--radix-select-trigger-height) w-full
                min-w-(--radix-select-trigger-width)
              `,
          )}
        >
          {children}
        </SelectPrimitive.Viewport>

        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export const SelectItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        `
          focus:bg-accent focus:text-accent-foreground
          [&_svg:not([class*='text-'])]:text-muted-foreground
          gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm
          [&_svg:not([class*='size-'])]:size-4
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
      <span
        data-slot="select-item-indicator"
        className="right-2 size-3.5 absolute flex items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
