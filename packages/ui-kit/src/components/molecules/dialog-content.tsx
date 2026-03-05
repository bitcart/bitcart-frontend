import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/utils"

import { DialogOverlay, DialogPortal } from "../atoms/dialog"

export type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}

export const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
  showCloseButton = true,
  ...props
}) => {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          `
            bg-background
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            gap-4 rounded-lg p-6 shadow-lg
            sm:max-w-lg
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-[-50%]
            border duration-200 outline-none
          `,

          className,
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={`
              ring-offset-background top-4 right-4 rounded-xs
              focus:ring-ring
              data-[state=open]:bg-accent data-[state=open]:text-muted-foreground
              [&_svg:not([class*='size-'])]:size-4
              absolute opacity-70 transition-opacity
              hover:opacity-100
              focus:ring-2 focus:ring-offset-2 focus:outline-hidden
              disabled:pointer-events-none
              [&_svg]:pointer-events-none [&_svg]:shrink-0
            `}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}
