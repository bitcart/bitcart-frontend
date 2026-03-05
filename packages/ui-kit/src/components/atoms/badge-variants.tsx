import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  `
    px-2 py-0.5 text-xs font-medium gap-1
    [&>svg]:size-3
    focus-visible:border-ring focus-visible:ring-ring/50
    aria-invalid:ring-destructive/20 aria-invalid:border-destructive
    dark:aria-invalid:ring-destructive/40
    inline-flex w-fit shrink-0 items-center justify-center overflow-hidden rounded-full border
    whitespace-nowrap transition-[color,box-shadow]
    focus-visible:ring-[3px]
    [&>svg]:pointer-events-none
  `,

  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/80 border-transparent",

        plain: `
          bg-background text-foreground
          [a&]:hover:bg-accent [a&]:hover:text-accent-foreground
        `,

        secondary: `
          bg-secondary text-secondary-foreground
          [a&]:hover:bg-secondary/80
          border-transparent
        `,

        accent: `bg-accent text-accent-foreground [a&]:hover:bg-accent/80 border-transparent`,

        destructive: `
          bg-destructive text-white
          [a&]:hover:bg-destructive/90
          focus-visible:ring-destructive/20
          dark:focus-visible:ring-destructive/40
          dark:bg-destructive/60
          border-transparent
        `,

        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
)
