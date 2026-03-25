//* Ported from: https://ui.shadcn.com

import { cn } from "@/utils"

export type LabelProps = React.ComponentProps<"label"> & {}

export const Label: React.FC<LabelProps> = ({ className, htmlFor, ...props }) => {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(
        `
          gap-2 text-sm font-medium flex items-center leading-none select-none
          group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50
          peer-disabled:cursor-not-allowed peer-disabled:opacity-50
        `,

        className,
      )}
      {...props}
    />
  )
}
