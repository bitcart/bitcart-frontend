import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useMemo } from "react"
import { DayPicker, getDefaultClassNames, type CustomComponents } from "react-day-picker"

import { cn } from "@/utils"

import { type ButtonProps } from "../atoms/button"
import { buttonVariants } from "../atoms/button-variants"
import { CalendarDayButton } from "../atoms/calendar-day-button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: ButtonProps["variant"]
}

export const Calendar: React.FC<CalendarProps> = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters: customFormatters,
  components: customComponents,
  ...props
}) => {
  const formatters = useMemo(
    () => ({
      formatMonthDropdown: (date: Date) => date.toLocaleString("default", { month: "short" }),
      ...customFormatters,
    }),
    [customFormatters],
  )

  const rootClassNames = useMemo(() => {
    const defaultClassNames = getDefaultClassNames()

    return {
      root: cn("w-fit", defaultClassNames.root),
      months: cn("gap-4 md:flex-row relative flex flex-col", defaultClassNames.months),
      month: cn("gap-4 flex w-full flex-col", defaultClassNames.month),

      nav: cn(
        "gap-1 top-0 inset-x-0 absolute flex w-full items-center justify-between",
        defaultClassNames.nav,
      ),

      button_previous: cn(
        buttonVariants({ variant: buttonVariant }),
        "p-0 size-[--cell-size] select-none aria-disabled:opacity-50",
        defaultClassNames.button_previous,
      ),

      button_next: cn(
        buttonVariants({ variant: buttonVariant }),
        "p-0 size-[--cell-size] select-none aria-disabled:opacity-50",
        defaultClassNames.button_next,
      ),

      month_caption: cn(
        "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
        defaultClassNames.month_caption,
      ),

      dropdowns: cn(
        "text-sm font-medium gap-1.5 flex h-[--cell-size] w-full items-center justify-center",
        defaultClassNames.dropdowns,
      ),

      dropdown_root: cn(
        `
          has-focus:border-ring has-focus:ring-ring/50
          border-input shadow-xs rounded-md relative border
          has-focus:ring-[3px]
        `,

        defaultClassNames.dropdown_root,
      ),

      dropdown: cn("bg-popover inset-0 absolute opacity-0", defaultClassNames.dropdown),

      caption_label: cn(
        "font-medium select-none",

        captionLayout === "label"
          ? "text-sm"
          : `
            rounded-md pl-2 pr-1 gap-1 text-sm h-8
            [&>svg]:text-muted-foreground [&>svg]:size-3.5
            flex items-center
          `,

        defaultClassNames.caption_label,
      ),

      table: "w-full border-collapse",
      weekdays: cn("flex", defaultClassNames.weekdays),

      weekday: cn(
        "text-muted-foreground rounded-md font-normal flex-1 text-[0.8rem] select-none",
        defaultClassNames.weekday,
      ),

      week: cn("mt-2 flex w-full", defaultClassNames.week),
      week_number_header: cn("w-[--cell-size] select-none", defaultClassNames.week_number_header),

      week_number: cn(
        "text-muted-foreground text-[0.8rem] select-none",
        defaultClassNames.week_number,
      ),

      day: cn(
        `
          p-0 group/day
          [&:last-child[data-selected=true]_button]:rounded-r-md
          relative aspect-square size-full text-center select-none
        `,

        props.showWeekNumber
          ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
          : "[&:first-child[data-selected=true]_button]:rounded-l-md",
        defaultClassNames.day,
      ),

      range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
      range_middle: cn("rounded-none", defaultClassNames.range_middle),
      range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),

      today: cn(
        "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
        defaultClassNames.today,
      ),

      outside: cn(
        "text-muted-foreground aria-selected:text-muted-foreground",
        defaultClassNames.outside,
      ),

      disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),

      hidden: cn("invisible", defaultClassNames.hidden),
      ...classNames,
    }
  }, [buttonVariant, captionLayout, classNames, props.showWeekNumber])

  const components: Partial<CustomComponents> = useMemo(
    () => ({
      Root: ({ rootRef, ...elementProps }) => {
        return <div data-slot="calendar" ref={rootRef} {...elementProps} />
      },

      Chevron: ({ className: elementClassName, orientation, ...elementProps }) => {
        if (orientation === "left") {
          return <ChevronLeftIcon className={cn("size-4", elementClassName)} {...elementProps} />
        }

        if (orientation === "right") {
          return <ChevronRightIcon className={cn("size-4", elementClassName)} {...elementProps} />
        }

        return <ChevronDownIcon className={cn("size-4", elementClassName)} {...elementProps} />
      },

      DayButton: CalendarDayButton,

      WeekNumber: ({ children, ...elementProps }) => {
        return (
          <td {...elementProps}>
            <div className="flex size-[--cell-size] items-center justify-center text-center">
              {children}
            </div>
          </td>
        )
      },

      ...customComponents,
    }),
    [customComponents],
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        `
          bg-background group/calendar p-3 [--cell-size:--spacing(8)]
          in-data-[slot=card-content]:bg-transparent
          in-data-[slot=popover-content]:bg-transparent
        `,

        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={formatters}
      components={components}
      classNames={rootClassNames}
      {...props}
    />
  )
}
