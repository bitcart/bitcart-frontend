//* Ported from: https://coss.com/ui

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"

import { cn } from "@/utils"

export type AutocompletePopupProps = AutocompletePrimitive.Popup.Props &
  Partial<
    Pick<
      AutocompletePrimitive.Positioner.Props,
      "align" | "sideOffset" | "alignOffset" | "side" | "anchor"
    >
  > & {}

export const AutocompletePopup: React.FC<AutocompletePopupProps> = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  alignOffset,
  align = "start",
  anchor,
  ...props
}) => {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="autocomplete-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <span
          className={cn(
            `
              bg-popover rounded-lg shadow-lg/5
              before:inset-0
              relative flex max-h-full max-w-[--available-width] min-w-[--anchor-width]
              origin-[--transform-origin] border transition-[scale,opacity]
              not-dark:bg-clip-padding
              before:pointer-events-none before:absolute before:rounded-[calc(var(--radius-lg)-1px)]
              before:shadow-[0_1px_black/4%]
              dark:before:shadow-[0_-1px_white/6%]
            `,

            className,
          )}
        >
          <AutocompletePrimitive.Popup
            className={`
              text-foreground flex max-h-[min(var(--available-height),23rem)] flex-1 flex-col
            `}
            data-slot="autocomplete-popup"
            {...props}
          >
            {children}
          </AutocompletePrimitive.Popup>
        </span>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}
