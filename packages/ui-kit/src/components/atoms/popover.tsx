import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/utils"

export const Popover = ({ ...props }: PopoverPrimitive.Root.Props) => {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

export const PopoverTrigger = ({ ...props }: PopoverPrimitive.Trigger.Props) => {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

export const PopoverContent = ({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            `
              bg-popover text-popover-foreground
              data-closed:fade-out-0
              data-open:fade-in-0
              data-closed:zoom-out-95
              data-open:zoom-in-95
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
              w-72 rounded-md p-4 shadow-md
              data-open:animate-in
              data-closed:animate-out
              z-50 origin-[--transform-origin] border outline-hidden
            `,
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}
