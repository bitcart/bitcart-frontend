"use client"

import { cn } from "@/utils"

import { Command } from "../atoms/command"
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "../atoms/dialog"
import { DialogContent } from "../molecules/dialog-content"

export type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}

export const CommandDialog: React.FC<CommandDialogProps> = ({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}) => (
  <Dialog {...props}>
    <DialogHeader className="sr-only">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>

    <DialogContent
      className={cn("p-0 overflow-hidden", className)}
      showCloseButton={showCloseButton}
    >
      <Command
        className={`
          [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2
          [&_[cmdk-group-heading]]:font-medium
          **:data-[slot=command-input-wrapper]:h-12
          [&_[cmdk-group]]:px-2
          [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0
          [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5
          [&_[cmdk-input]]:h-12
          [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3
          [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5
        `}
      >
        {children}
      </Command>
    </DialogContent>
  </Dialog>
)
