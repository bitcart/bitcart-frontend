import { useEffect, useRef } from "react"
import { getDefaultClassNames, type DayButton } from "react-day-picker"

import { cn } from "@/utils"

import { Button } from "./button"

export type CalendarDayButtonProps = React.ComponentProps<typeof DayButton> & {}

export const CalendarDayButton = ({
  className,
  day,
  modifiers,
  ...props
}: CalendarDayButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null)
  const defaultClassNames = getDefaultClassNames()

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        `
          data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground
          data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground
          data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground
          data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md
          data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground
          data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md
          group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50
          dark:hover:text-accent-foreground
          gap-1 font-normal
          [&>span]:text-xs
          flex aspect-square size-auto w-full min-w-[--cell-size] flex-col leading-none
          group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10
          group-data-[focused=true]/day:ring-[3px]
          data-[range-middle=true]:rounded-none
          [&>span]:opacity-70
        `,
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}
