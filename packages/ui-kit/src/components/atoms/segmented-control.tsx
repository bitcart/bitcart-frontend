//* Originally ported from: https://coss.com/ui

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/utils"

export type SegmentedControlSize = "default" | "lg" | "sm"

const ITEM_SIZE_CLASS_NAMES: Record<SegmentedControlSize, string> = {
  default: "h-8.5 sm:h-7.5 px-[calc(var(--spacing)*2.5-1px)]",
  lg: "h-9.5 sm:h-8.5 px-[calc(var(--spacing)*3-1px)]",
  sm: "h-7.5 sm:h-6.5 px-[calc(var(--spacing)*2-1px)]",
}

const ACTIVE_ITEM_SELECTOR =
  ':scope > [data-checked], :scope > [aria-current="page"], :scope > [data-pressed]'

const OBSERVED_ATTRIBUTES = ["data-checked", "aria-current", "data-pressed"]

const MAX_LAYOUT_ROUNDING_ERROR = 2

const SegmentedControlContext = createContext<SegmentedControlSize>("default")

type ActiveItemRect = {
  height: number
  left: number
  top: number
  width: number
}

const isSameRect = (a: ActiveItemRect | null, b: ActiveItemRect | null): boolean =>
  a?.left === b?.left && a?.top === b?.top && a?.width === b?.width && a?.height === b?.height

//* Fractional CSS sizes keep the indicator from drifting by a subpixel, unless a transform has
//* scaled the element and its offset size is the reliable one.
const getCssSize = (element: HTMLElement): { height: number; width: number } => {
  const style = getComputedStyle(element)
  const width = Number.parseFloat(style.width) || 0
  const height = Number.parseFloat(style.height) || 0

  if (Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight) {
    return { height: element.offsetHeight, width: element.offsetWidth }
  } else return { height, width }
}

const measureItem = (item: HTMLElement, root: HTMLElement): ActiveItemRect => {
  const { width, height } = getCssSize(item)
  const rootSize = getCssSize(root)
  const itemRect = item.getBoundingClientRect()
  const rootRect = root.getBoundingClientRect()
  const scaleX = rootSize.width > 0 ? rootRect.width / rootSize.width : 1
  const scaleY = rootSize.height > 0 ? rootRect.height / rootSize.height : 1
  const left = (itemRect.left - rootRect.left) / scaleX - root.clientLeft + root.scrollLeft
  const top = (itemRect.top - rootRect.top) / scaleY - root.clientTop + root.scrollTop

  const isUndistorted =
    Math.abs(left - item.offsetLeft) <= MAX_LAYOUT_ROUNDING_ERROR &&
    Math.abs(top - item.offsetTop) <= MAX_LAYOUT_ROUNDING_ERROR

  return {
    height,
    left: isUndistorted ? left : item.offsetLeft,
    top: isUndistorted ? top : item.offsetTop,
    width,
  }
}

const SegmentedControlIndicator: React.FC = () => {
  const ref = useRef<HTMLSpanElement>(null)
  const [rect, setRect] = useState<ActiveItemRect | null>(null)

  useLayoutEffect(() => {
    const root = ref.current?.parentElement

    if (!root) return void null

    const update = () => {
      const item = root.querySelector<HTMLElement>(ACTIVE_ITEM_SELECTOR)
      const next = item ? measureItem(item, root) : null

      setRect((previous) => (isSameRect(previous, next) ? previous : next))
    }

    const resizeObserver = new ResizeObserver(update)

    const mutationObserver = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) observeItems()

      update()
    })

    const observeItems = () => {
      resizeObserver.disconnect()
      resizeObserver.observe(root)

      for (const child of root.children) {
        resizeObserver.observe(child)
        mutationObserver.observe(child, { attributeFilter: OBSERVED_ATTRIBUTES, attributes: true })
      }
    }

    update()
    mutationObserver.observe(root, { childList: true })
    observeItems()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <span
      ref={ref}
      aria-hidden
      hidden={!rect}
      data-slot="segmented-control-indicator"
      className={cn(`
        top-0 left-0 rounded-md
        bg-background shadow-sm/5
        dark:bg-input ease-in-out
        pointer-events-none absolute -z-1
        h-[var(--active-item-height)]
        w-[var(--active-item-width)] translate-x-[var(--active-item-left)] translate-y-[var(--active-item-top)] transition-[width,height,translate] duration-200
        motion-reduce:transition-none
      `)}
      style={
        {
          "--active-item-height": `${rect?.height ?? 0}px`,
          "--active-item-left": `${rect?.left ?? 0}px`,
          "--active-item-top": `${rect?.top ?? 0}px`,
          "--active-item-width": `${rect?.width ?? 0}px`,
        } as React.CSSProperties
      }
    />
  )
}

export type SegmentedControlProps = useRender.ComponentProps<"div"> & {
  size?: SegmentedControlSize
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  className,
  children,
  render,
  size = "default",
  ...props
}) => {
  const defaultProps = {
    children: (
      <>
        {children}
        <SegmentedControlIndicator />
      </>
    ),

    className: cn(
      "gap-0.5 rounded-lg bg-muted p-0.5 relative z-0 flex w-fit items-center",
      className,
    ),

    "data-size": size,
    "data-slot": "segmented-control",
  }

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })

  return <SegmentedControlContext value={size}>{element}</SegmentedControlContext>
}

export type SegmentedControlItemProps = useRender.ComponentProps<"button"> & {
  size?: SegmentedControlSize
}

export const SegmentedControlItem: React.FC<SegmentedControlItemProps> = ({
  className,
  render,
  size,
  ...props
}) => {
  const contextSize = useContext(SegmentedControlContext)
  const resolvedSize = size ?? contextSize

  const defaultProps = {
    className: cn(
      `
            rounded-md text-base font-medium text-muted-foreground
            hover:text-foreground focus-visible:outline-ring
            sm:text-sm
            data-checked:bg-background
            data-checked:text-foreground
            data-checked:shadow-sm/5
            dark:data-checked:bg-input aria-[current=page]:bg-background aria-[current=page]:text-foreground
            aria-[current=page]:shadow-sm/5
            dark:aria-[current=page]:bg-input data-pressed:bg-background
            data-pressed:text-foreground
            data-pressed:shadow-sm/5
            dark:data-pressed:bg-input gap-1.5 [&_svg:not([class*='size-'])]:size-4.5
            sm:[&_svg:not([class*='size-'])]:size-4
            [&_svg]:-mx-0.5
            relative
            inline-flex
            shrink-0
            cursor-pointer
            items-center
            justify-center
            border border-transparent whitespace-nowrap outline-2 outline-transparent transition-[color,outline-color] select-none
            hover:bg-transparent disabled:pointer-events-none disabled:opacity-64 data-disabled:pointer-events-none
            data-disabled:opacity-64 [&_svg]:pointer-events-none
            [&_svg]:shrink-0
            [&_svg:not([class*='opacity-'])]:opacity-80
            [:has(>[data-slot=segmented-control-indicator]:not([hidden]))>&]:bg-transparent! [:has(>[data-slot=segmented-control-indicator]:not([hidden]))>&]:shadow-none!
          `,

      ITEM_SIZE_CLASS_NAMES[resolvedSize],
      className,
    ),

    "data-size": resolvedSize,
    "data-slot": "segmented-control-item",
    ...(render ? {} : { type: "button" as const }),
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  })
}
