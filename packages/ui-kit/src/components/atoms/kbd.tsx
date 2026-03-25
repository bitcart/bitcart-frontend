//* Ported from: https://coss.com/ui

import { cn } from "@/utils"

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">): React.ReactElement {
  return (
    <kbd
      className={cn(
        `
          h-5 min-w-5 gap-1 rounded-sm bg-muted px-1 font-medium font-sans text-muted-foreground
          text-xs
          [&_svg:not-[class*='size-']]:size-3
          pointer-events-none inline-flex items-center justify-center select-none
        `,

        className,
      )}
      data-slot="kbd"
      {...props}
    />
  )
}

export function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">): React.ReactElement {
  return (
    <kbd
      className={cn("gap-1 inline-flex items-center", className)}
      data-slot="kbd-group"
      {...props}
    />
  )
}
