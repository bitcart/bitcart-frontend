//* Ported from: https://coss.com/ui

import { cn } from "@/utils"

export type KbdProps = React.ComponentProps<"kbd"> & {}

export const Kbd: React.FC<KbdProps> = ({ className, ...props }) => {
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

export type KbdGroupProps = React.ComponentProps<"kbd"> & {}

export const KbdGroup: React.FC<KbdGroupProps> = ({ className, ...props }) => {
  return (
    <kbd
      className={cn("gap-1 inline-flex items-center", className)}
      data-slot="kbd-group"
      {...props}
    />
  )
}
