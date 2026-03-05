import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/utils"

export type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> & {}

export const Separator: React.FC<SeparatorProps> = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) => {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        `
          bg-border shrink-0
          data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full
          data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px
        `,

        className,
      )}
      {...props}
    />
  )
}
