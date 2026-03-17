import { cva } from "class-variance-authority"

export const navigationMenuTriggerStyle = cva(
  `
    group h-9 rounded-md bg-background px-4 py-2 text-sm font-medium
    hover:bg-accent hover:text-accent-foreground
    focus:bg-accent focus:text-accent-foreground
    data-popup-open:hover:bg-accent
    data-popup-open:text-accent-foreground data-popup-open:bg-accent/50
    data-popup-open:focus:bg-accent
    data-open:hover:bg-accent
    data-open:text-accent-foreground data-open:bg-accent/50
    data-open:focus:bg-accent
    focus-visible:ring-ring/50
    inline-flex w-max items-center justify-center transition-[color,box-shadow] outline-none
    focus-visible:ring-[3px] focus-visible:outline-1
    disabled:pointer-events-none disabled:opacity-50
  `,
)
