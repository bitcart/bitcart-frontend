//* Ported from: https://coss.com/ui

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/utils"

export type ScrollBarProps = ScrollAreaPrimitive.Scrollbar.Props & {}

export const ScrollBar: React.FC<ScrollBarProps> = ({
  className,
  orientation = "vertical",
  ...props
}) => {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        `
          m-1
          data-[orientation=horizontal]:h-1.5
          data-[orientation=vertical]:w-1.5
          flex opacity-0 transition-opacity delay-300
          data-hovering:opacity-100 data-hovering:delay-0 data-hovering:duration-100
          data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-100
          data-[orientation=horizontal]:flex-col
        `,

        className,
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className="bg-foreground/20 relative flex-1 rounded-full"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  scrollFade?: boolean
  scrollbarGutter?: boolean
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  className,
  children,
  scrollFade = false,
  scrollbarGutter = false,
  ...props
}) => {
  return (
    <ScrollAreaPrimitive.Root className={cn("min-h-0 size-full", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        className={cn(
          `
            focus-visible:ring-ring focus-visible:ring-offset-background
            h-full rounded-[inherit] transition-shadow outline-none
            focus-visible:ring-2 focus-visible:ring-offset-1
            data-has-overflow-x:overscroll-x-contain
            data-has-overflow-y:overscroll-y-contain
          `,

          scrollFade &&
            `
              mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start)))]
              mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end)))]
              mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end)))]
              mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start)))]
              [--fade-size:1.5rem]
            `,

          scrollbarGutter && "data-has-overflow-y:pe-2.5 data-has-overflow-x:pb-2.5",
        )}
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  )
}
