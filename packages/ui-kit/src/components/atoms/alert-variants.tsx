import { cva } from "class-variance-authority"

export const alertVariants = cva(
  `
    gap-y-0.5 rounded-lg px-4 py-3 text-sm
    has-[>svg]:gap-x-3
    [&>svg]:size-4 [&>svg]:translate-y-0.5
    relative grid w-full grid-cols-[0_1fr] items-start border
    has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]
    [&>svg]:text-current
  `,

  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        accent: "bg-accent text-accent-foreground",

        destructive: `
          text-destructive-foreground bg-card
          *:data-[slot=alert-description]:text-destructive-foreground/90
          [&>svg]:text-current
        `,
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
)
