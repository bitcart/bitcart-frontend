import { useLayoutEffect, useRef } from "react"

import { cn } from "@/utils"

export type FittedTextStep = {
  fontSize?: string
  lineHeight?: string
}

export type FittedTextProps = React.ComponentProps<"div"> & {
  steps: readonly FittedTextStep[]
  children: React.ReactElement
}

//! Tries each step in order and keeps the first that fits the text on one line; an empty step keeps
//! the child's own size. Past the last step the text wraps between words only, never inside one,
//! whatever the page's `overflow-wrap`, so a long figure is never split.
export const FittedText: React.FC<FittedTextProps> = ({ steps, className, children, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = ref.current
    const text = container?.firstElementChild

    if (!container || !(text instanceof HTMLElement)) return void null

    const fit = () => {
      Object.assign(text.style, { whiteSpace: "nowrap", overflowWrap: "" })

      const fitting = steps.find((step) => {
        Object.assign(text.style, { fontSize: "", lineHeight: "", ...step })

        return text.scrollWidth <= text.clientWidth
      })

      if (!fitting) {
        Object.assign(text.style, { whiteSpace: "normal", overflowWrap: "normal" })
      }
    }

    fit()

    const resizeObserver = new ResizeObserver(fit)
    const mutationObserver = new MutationObserver(fit)

    resizeObserver.observe(container)
    mutationObserver.observe(text, { childList: true, subtree: true, characterData: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [steps])

  return (
    <div ref={ref} data-slot="fitted-text" className={cn("min-w-0", className)} {...props}>
      {children}
    </div>
  )
}
