//* Ported from: https://coss.com/ui

import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/utils"

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "size"
> & {
  size?: "sm" | "default" | "lg" | number
  unstyled?: boolean
  nativeInput?: boolean
}

export const Input: React.FC<InputProps> = ({
  className,
  size = "default",
  unstyled = false,
  nativeInput = false,
  ...props
}) => {
  const inputClassName = cn(
    `
      h-8.5 min-w-0 leading-8.5
      placeholder:text-muted-foreground/72
      sm:h-7.5 sm:leading-7.5
      w-full rounded-[inherit] px-[calc(var(--spacing)*3-1px)] outline-none
      [transition:background-color_5000000s_ease-in-out_0s]
    `,

    {
      "h-7.5 leading-7.5 sm:h-6.5 sm:leading-6.5 px-[calc(var(--spacing)*2.5-1px)]": size === "sm",
      "h-9.5 leading-9.5 sm:h-8.5 sm:leading-8.5": size === "lg",

      [`
        [&::-webkit-search-cancel-button]:appearance-none
        [&::-webkit-search-decoration]:appearance-none
        [&::-webkit-search-results-button]:appearance-none
        [&::-webkit-search-results-decoration]:appearance-none
      `]: props.type === "search",

      [`
        text-muted-foreground
        file:me-3 file:font-medium file:text-foreground file:text-sm file:bg-transparent
      `]: props.type === "file",
    },
  )

  return (
    <span
      className={cn(
        {
          [`
            rounded-lg border-input bg-background text-base text-foreground shadow-xs/5 ring-ring/24
            before:inset-0
            has-focus-visible:has-aria-invalid:border-destructive/64
            has-focus-visible:has-aria-invalid:ring-destructive/16
            has-aria-invalid:border-destructive/36
            has-focus-visible:border-ring
            has-autofill:bg-foreground/4
            sm:text-sm
            dark:bg-input/32
            dark:has-autofill:bg-foreground/8
            dark:has-aria-invalid:ring-destructive/24
            relative inline-flex w-full border transition-shadow
            not-dark:bg-clip-padding
            before:pointer-events-none before:absolute before:rounded-[calc(var(--radius-lg)-1px)]
            not-has-disabled:not-has-focus-visible:before:shadow-[0_1px_black/4%]
            has-focus-visible:ring-[3px]
            has-disabled:opacity-64
            has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none
            dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_white/6%]
          `]: !unstyled,
        },

        className,
      )}
      data-size={size}
      data-slot="input-control"
    >
      {nativeInput ? (
        <input
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          {...props}
        />
      ) : (
        <InputPrimitive
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          {...props}
        />
      )}
    </span>
  )
}
