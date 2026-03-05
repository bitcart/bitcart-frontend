import { cn } from "@/utils"

export type InputProps = React.ComponentProps<"input"> & {}

export const Input: React.FC<InputProps> = ({ className, type, ...props }) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          file:text-foreground file:h-9.5 file:text-sm file:font-medium
          bg-background/30 border-input h-11 min-w-0 rounded-md px-3 py-2 shadow-xs
          md:py-3
          leading-5
          placeholder:text-muted-foreground/80
          selection:bg-primary selection:text-primary-foreground
          dark:bg-input/30
          focus:border-ring focus:ring-ring
          focus-visible:border-ring focus-visible:ring-ring
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
          w-full border-2 transition-[color,box-shadow] outline-none
          file:inline-flex file:border-0 file:bg-transparent
          focus:ring-2
          focus-visible:ring-2
          disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
        `,

        className,
      )}
      {...props}
    />
  )
}
