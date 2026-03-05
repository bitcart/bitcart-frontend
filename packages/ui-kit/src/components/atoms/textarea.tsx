import { cn } from "@/utils"

export type TextareaProps = React.ComponentProps<"textarea"> & {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `
          border-input rounded-md min-h-20 px-3 py-2 text-base shadow-xs
          md:text-sm md:py-3
          bg-background/30
          placeholder:text-muted-foreground/80
          focus-visible:border-ring focus-visible:ring-ring/50
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
          dark:bg-input/30
          flex field-sizing-fixed w-full resize-y border-2 transition-[color,box-shadow]
          outline-none
          focus-visible:ring-[3px]
          disabled:cursor-not-allowed disabled:opacity-50
        `,

        className,
      )}
      {...props}
    />
  )
}
