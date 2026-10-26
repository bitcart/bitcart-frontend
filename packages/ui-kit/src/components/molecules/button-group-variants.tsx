import { cva } from "class-variance-authority"

export const buttonGroupVariants = cva(
  `
    [&>[data-slot=select-trigger]:last-of-type]:has-[>input[aria-hidden=true]:last-child]:rounded-r-md
    has-[>[data-slot=button-group]]:gap-2
    flex w-fit items-stretch
    *:hover:relative *:hover:z-10
    *:focus-visible:relative *:focus-visible:z-10
    [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit
    [&>input]:flex-1
  `,

  {
    variants: {
      orientation: {
        horizontal: `
          [&>*:not(:first-child)]:-ml-0.5 [&>*:not(:first-child)]:rounded-l-none
          [&>*:not(:last-child)]:rounded-r-none
        `,

        vertical: `
          [&>*:not(:first-child)]:-mt-0.5
          flex-col
          [&>*:not(:first-child)]:rounded-t-none
          [&>*:not(:last-child)]:rounded-b-none
        `,
      },
    },

    defaultVariants: {
      orientation: "horizontal",
    },
  },
)
