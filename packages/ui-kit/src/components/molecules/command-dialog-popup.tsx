//* Ported from: https://coss.com/ui

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/utils"

import { CommandDialogBackdrop, CommandDialogPortal, CommandDialogViewport } from "../atoms/command"

export type CommandDialogPopupProps = CommandDialogPrimitive.Popup.Props & {}

export const CommandDialogPopup: React.FC<CommandDialogPopupProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <CommandDialogPortal>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={cn(
            `
              max-h-105 min-h-0 min-w-0 max-w-xl rounded-lg bg-popover text-popover-foreground
              shadow-lg/5 ease-in-out
              before:inset-0 before:bg-muted/72
              data-nested:data-ending-style:translate-y-8
              data-nested:data-starting-style:translate-y-8
              **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1
              relative row-start-2 flex w-full -translate-y-[calc(1.25rem*var(--nested-dialogs))]
              scale-[calc(1-0.1*var(--nested-dialogs))] flex-col border
              opacity-[calc(1-0.1*var(--nested-dialogs))] transition-[scale,opacity,translate]
              duration-200 will-change-transform outline-none
              not-dark:bg-clip-padding
              before:pointer-events-none before:absolute
              before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_black/4%]
              data-ending-style:scale-98 data-ending-style:opacity-0
              data-nested-dialog-open:origin-top
              data-starting-style:scale-98 data-starting-style:opacity-0
              dark:before:shadow-[0_-1px_white/6%]
            `,

            className,
          )}
          data-slot="command-dialog-popup"
          {...props}
        >
          {children}
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  )
}
