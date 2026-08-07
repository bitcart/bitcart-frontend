//* Ported from: https://ui.shadcn.com

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/utils"

export type DialogProps = DialogPrimitive.Root.Props & {}

export const Dialog: React.FC<DialogProps> = ({ ...props }) => {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export type DialogTriggerProps = DialogPrimitive.Trigger.Props & {}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ ...props }) => {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

export type DialogPortalProps = DialogPrimitive.Portal.Props & {}

export const DialogPortal: React.FC<DialogPortalProps> = ({ ...props }) => {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

export type DialogCloseProps = DialogPrimitive.Close.Props & {}

export const DialogClose: React.FC<DialogCloseProps> = ({ ...props }) => {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

export type DialogOverlayProps = DialogPrimitive.Backdrop.Props & {}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({ className, ...props }) => {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        `
          data-open:animate-in
          data-closed:animate-out data-closed:fade-out-0
          data-open:fade-in-0
          inset-0 bg-black/50 absolute z-50
        `,
        className,
      )}
      {...props}
    />
  )
}

export type DialogHeaderProps = React.ComponentProps<"div"> & {}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="dialog-header"
      className={cn("gap-2 sm:text-left flex flex-col text-center", className)}
      {...props}
    />
  )
}

export type DialogFooterProps = React.ComponentProps<"div"> & {}

export const DialogFooter: React.FC<DialogFooterProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("gap-2 sm:flex-row sm:justify-end flex flex-col-reverse", className)}
      {...props}
    />
  )
}

export type DialogTitleProps = DialogPrimitive.Title.Props & {}

export const DialogTitle: React.FC<DialogTitleProps> = ({ className, ...props }) => {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  )
}

export type DialogDescriptionProps = DialogPrimitive.Description.Props & {}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ className, ...props }) => {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}
