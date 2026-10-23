import { cva } from "class-variance-authority"

export const fieldVariants = cva(
  "group/field gap-3 data-[invalid=true]:text-destructive-foreground flex w-full",

  {
    variants: {
      orientation: {
        vertical: ["flex-col *:w-full [&>.sr-only]:w-auto"],

        horizontal: [
          "flex-row items-center",
          "*:data-[slot=field-label]:flex-auto",

          `
            has-[>[data-slot=field-content]]:items-start
            [&>[role=checkbox],&>[role=radio]]:has-[>[data-slot=field-content]]:mt-px
          `,
        ],

        responsive: [
          `
            @md/field-group:flex-row @md/field-group:items-center
            @md/field-group:[&>*]:w-auto
            flex-col
            *:w-full
            [&>.sr-only]:w-auto
          `,

          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",

          `
            @md/field-group:has-[>[data-slot=field-content]]:items-start
            @md/field-group:[&>[role=checkbox],&>[role=radio]]:has-[>[data-slot=field-content]]:mt-px
          `,
        ],
      },
    },

    defaultVariants: {
      orientation: "vertical",
    },
  },
)
