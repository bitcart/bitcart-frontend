//* Ported from: https://ui.shadcn.com

import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/utils"

export type PopoverProps = PopoverPrimitive.Root.Props & {}

export const Popover: React.FC<PopoverProps> = ({ modal: isModal = true, ...props }) => {
  return <PopoverPrimitive.Root modal={isModal} data-slot="popover" {...props} />
}

export type PopoverTriggerProps = PopoverPrimitive.Trigger.Props & {}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ ...props }) => {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

export type PopoverBackdropProps = PopoverPrimitive.Backdrop.Props & {}

export const PopoverBackdrop: React.FC<PopoverBackdropProps> = ({ className, ...props }) => {
  return (
    <PopoverPrimitive.Backdrop
      className={cn(
        `
          inset-0 bg-black/32 absolute z-50 transition-opacity duration-450
          ease-[cubic-bezier(0.32,0.72,0,1)]
          data-[ending-style]:opacity-0
          data-[starting-style]:opacity-0
        `,

        className,
      )}
      data-slot="popover-backdrop"
      {...props}
    />
  )
}
