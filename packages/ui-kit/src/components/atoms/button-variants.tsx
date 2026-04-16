import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  [
    `
      gap-2 font-medium
      [&_svg:not-[class*='size-']]:size-4
      focus-visible:border-ring focus-visible:ring-ring/50
      aria-invalid:ring-destructive/20 aria-invalid:border-destructive
      dark:aria-invalid:ring-destructive/40
      focus-visible:outline-ring
      inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap
      transition-all duration-200 outline-none
      focus-visible:ring-[3px] focus-visible:outline-2
      disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
      [&_svg]:pointer-events-none [&_svg]:shrink-0
    `,
  ],

  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80 focus:bg-primary/80",
        white: "bg-white text-primary hover:bg-gray-100 focus:bg-gray-100",

        secondary: `
          bg-secondary text-secondary-foreground
          hover:bg-secondary/80
          focus:bg-secondary/80
        `,

        accent: "bg-accent text-accent-foreground hover:bg-accent/80 focus:bg-accent/80",

        destructive: `
          bg-destructive text-white
          hover:bg-destructive/90
          focus:bg-destructive/90
          focus-visible:ring-destructive/20
          dark:focus-visible:ring-destructive/40
          dark:bg-destructive/60
        `,

        outline: `
          shadow-xs border-input
          hover:text-accent-foreground
          focus:text-accent-foreground
          text-muted-foreground
          hover:border-ring hover:bg-accent/40
          focus-visible:border-ring
          focus:bg-accent/40
          border-2 bg-transparent
        `,

        ghost: `
          hover:bg-muted/25 hover:text-accent-foreground
          focus:text-accent-foreground
          [&_svg:not-[class*='hover:text-']]:hover:text-accent-foreground
          focus:bg-muted/25
        `,

        link: `
          font-semibold text-accent-foreground
          dark:hover:filter-brightness-130
          dark:focus:filter-brightness-130
          hover:filter-brightness-70
          focus:filter-brightness-70
          underline-offset-3
          hover:underline
          focus:underline
        `,
      },

      size: {
        inline: "font-size-inherit h-fit",

        sm: `
          h-7
          sm:h-7.8
          rounded-md gap-1.5 px-3 py-1.4 pb-1.6 text-sm
          [&_svg:not-[class*='size-']]:size-3
        `,

        default: `
          h-9 text-sm rounded-md px-4 py-2
          has-[>svg]:px-4.5
          [&_svg:not-[class*='size-']]:size-4
        `,

        lg: `
          h-10
          md:h-11
          rounded-md px-6 py-3 font-semibold text-sm
          [&_svg:not-[class*='size-']]:size-4
        `,

        /**
         * A special case intended for websites but not webapps
         */
        xl: `
          h-12
          md:h-14
          py-4 px-6
          lg:px-8
          rounded-lg font-semibold text-sm
          md:text-base
          [&_svg:not-[class*='size-']]:size-4
          [&_svg:not-[class*='size-']]:md:size-5
        `,

        "icon-sm": "p-2 gap-2 size-8 rounded-md [&_svg:not-[class*='size-']]:size-3",
        icon: "p-2 gap-2 size-9 rounded-md [&_svg:not-[class*='size-']]:size-4",
        "icon-lg": "p-2 gap-2 size-10 rounded-md [&_svg:not-[class*='size-']]:size-5",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
