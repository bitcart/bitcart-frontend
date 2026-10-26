import { cva } from "class-variance-authority"

export const toggleVariants = cva(
  `
    gap-2 text-sm font-medium rounded-md text-muted-foreground
    pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11
    [&_svg:not-[class*='size-']]:size-4
    hover:bg-accent/40 hover:text-accent-foreground
    data-pressed:bg-accent data-pressed:text-accent-foreground
    focus-visible:border-ring focus-visible:ring-ring/90 focus-visible:outline-ring
    relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap
    transition-all duration-200 outline-none select-none
    after:absolute
    focus-visible:ring-3 focus-visible:outline-2
    disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
    pointer-coarse:after:size-full
    [&_svg]:pointer-events-none [&_svg]:shrink-0
  `,

  {
    variants: {
      variant: {
        default: "border-2 border-transparent bg-transparent",
        outline: "shadow-xs border-input hover:border-ring border-2 bg-transparent",
      },

      size: {
        sm: "h-7 min-w-7 px-2.5",
        default: "h-9 min-w-9 px-3",
        lg: "h-10 min-w-10 px-4",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
