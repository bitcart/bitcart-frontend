import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { useLayoutEffect, useRef } from "react"

import { getCopyOutcome, type CheckoutCopy, type CheckoutCopyTarget } from "../copy-status"
import { CopyAnnouncement, CopyStatusIcon } from "./copy-feedback"

const MARKED_START = 8
const MARKED_END = 8

export const MarkedValue = ({ value, isMarked }: { value: string; isMarked: boolean }) => {
  const startLength = Math.max(0, Math.min(MARKED_START, value.length - MARKED_END))
  const marked = cn(isMarked && "text-foreground font-semibold")

  return (
    <>
      <span className={marked}>{value.slice(0, startLength)}</span>

      <span className={cn(isMarked && "text-muted-foreground")}>
        {value.slice(startLength, -MARKED_END)}
      </span>

      <span className={marked}>{value.slice(-MARKED_END)}</span>
    </>
  )
}

//! `text-wrap: balance` shortens the lines but not the box, so the box is shrunk to its widest
//! line; otherwise the copy icon beside it would float away from the text.
const useShrinkToLines = <T extends HTMLElement>(text: string) => {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const element = ref.current
    const container = element?.closest<HTMLElement>("[data-shrink-root]")

    if (!element || !container) return void null

    const fit = () => {
      element.style.width = ""

      const range = document.createRange()

      range.selectNodeContents(element)

      const rects = [...range.getClientRects()]

      if (rects.length > 0) {
        const left = Math.min(...rects.map((rect) => rect.left))
        const right = Math.max(...rects.map((rect) => rect.right))

        element.style.width = `${Math.ceil(right - left)}px`
      }
    }

    const observer = new ResizeObserver(fit)

    observer.observe(container)
    void document.fonts.ready.then(fit)

    return () => observer.disconnect()
  }, [text])

  return ref
}

export type CopyableValueProps = {
  target: CheckoutCopyTarget
  label: string
  value: string
  copy: CheckoutCopy
  display?: string
  isMarked?: boolean
  isStartAlignedFromSm?: boolean
  testId?: string
  children?: React.ReactNode
}

export const CopyableValue = ({
  target,
  label,
  value,
  copy,
  display = value,
  isMarked = false,
  isStartAlignedFromSm = false,
  testId,
  children,
}: CopyableValueProps) => {
  const { t } = useLingui()
  const shrinkRef = useShrinkToLines<HTMLSpanElement>(display)
  const outcome = getCopyOutcome(copy, target)

  return (
    <>
      <div
        data-shrink-root
        className={cn(
          "gap-1 flex w-full items-center justify-center",
          isStartAlignedFromSm && "sm:justify-start",
        )}
      >
        <button
          type="button"
          aria-label={t`Copy ${label}`}
          onClick={() => copy.copy(target, value)}
          className={cn(
            "gap-2 rounded-md px-2 py-1 hover:bg-muted/50 min-w-0 flex cursor-pointer items-center",

            //* Spans the column with its padding outside it: text on the left edge, icon on the right.
            isStartAlignedFromSm && "sm:-mx-2 sm:w-[calc(100%+1rem)] sm:justify-between",
          )}
        >
          <span
            ref={shrinkRef}
            data-testid={testId}
            className={cn(
              "text-sm font-mono min-w-0 text-center text-balance break-all",
              isStartAlignedFromSm && "sm:text-left",
            )}
          >
            <MarkedValue value={display} isMarked={isMarked} />
          </span>

          <CopyStatusIcon outcome={outcome} />
        </button>

        {children}
      </div>

      <CopyAnnouncement outcome={outcome} label={label} />
    </>
  )
}
