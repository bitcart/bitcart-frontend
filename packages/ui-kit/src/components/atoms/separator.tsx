//* Originally ported from: https://ui.shadcn.com

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/utils"

export type SeparatorProps = SeparatorPrimitive.Props & {}

export const Separator: React.FC<SeparatorProps> = ({
  className,
  orientation = "horizontal",
  ...props
}) => {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        `
          bg-border shrink-0
          data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full
          data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch
        `,

        className,
      )}
      {...props}
    />
  )
}
