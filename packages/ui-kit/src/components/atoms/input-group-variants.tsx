import { cva } from "class-variance-authority"

export const inputGroupAddonVariants = cva(
  `
    text-muted-foreground gap-2 py-1.5 text-sm font-medium
    [&>svg:not([class*='size-'])]:size-4
    flex h-auto cursor-text items-center justify-center select-none
    group-data-[disabled=true]/input-group:opacity-50
    [&>kbd]:rounded-[calc(var(--radius)-5px)]
  `,

  {
    variants: {
      align: {
        "inline-start": "pl-3 order-first has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end": "pr-3 order-last has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",

        "block-start": `
          px-3 pt-3
          [.border-b]:pb-3
          group-has-[>input]/input-group:pt-2.5
          order-first w-full justify-start
        `,

        "block-end": `
          px-3 pb-3
          [.border-t]:pt-3
          group-has-[>input]/input-group:pb-2.5
          order-last w-full justify-start
        `,
      },
    },

    defaultVariants: {
      align: "inline-start",
    },
  },
)

export const inputGroupButtonVariants = cva("text-sm gap-2 flex items-center shadow-none", {
  variants: {
    size: {
      xs: `
        h-6 gap-1 px-2
        [&>svg:not([class*='size-'])]:size-3.5
        has-[>svg]:px-2
        rounded-[calc(var(--radius)-5px)]
      `,

      sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
      "icon-xs": "size-6 p-0 has-[>svg]:p-0 rounded-[calc(var(--radius)-5px)]",
      "icon-sm": "size-8 p-0 has-[>svg]:p-0",
    },
  },

  defaultVariants: {
    size: "xs",
  },
})
