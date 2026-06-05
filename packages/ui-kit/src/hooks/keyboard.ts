import { useIsClient } from "@bitcart/hooks"
import { useCallback, useEffect } from "react"

import type { ArrowKeyNavigationParams } from "@/types"

import { useCurrentBreakpoint } from "./breakpoints"

const SOFT_KEYBOARD_HEIGHT_THRESHOLD_PX = 100

/**
 * Toggles a `data-soft-keyboard` attribute on `<html>` while an on-screen
 * keyboard is overlapping the visual viewport, on `sm` viewports only.
 *
 * Uses the Visual Viewport API to distinguish soft keyboards from external
 * (Bluetooth / Smart Connector) ones, which don't shrink the visual viewport
 * and so should not engage focus-driven UI adjustments.
 */
export const useSoftKeyboardTracker = (): void => {
  const isClient = useIsClient()
  const currentBreakpoint = useCurrentBreakpoint()

  useEffect(() => {
    if (isClient && currentBreakpoint === "sm" && window.visualViewport) {
      const { visualViewport } = window

      const updateDataAttribute = () => {
        const heightDelta = window.innerHeight - visualViewport.height

        document.documentElement.toggleAttribute(
          "data-soft-keyboard",
          heightDelta > SOFT_KEYBOARD_HEIGHT_THRESHOLD_PX,
        )
      }

      updateDataAttribute()
      visualViewport.addEventListener("resize", updateDataAttribute)

      return () => {
        visualViewport.removeEventListener("resize", updateDataAttribute)
        document.documentElement.removeAttribute("data-soft-keyboard")
      }
    }
  }, [currentBreakpoint, isClient])
}

/**
 * Returns a callback ref that wires roving arrow-key focus across the
 * interactive descendants (links/buttons) of the element it's attached to.
 * `prevKey`/`nextKey` move focus backward/forward, wrapping at the ends.
 *
 * The listener is bound imperatively on the container rather than via an
 * `onKeyDown` JSX prop: focus already lives on the interactive children, so
 * the container is only a delegation surface — attaching here keeps it a pure
 * landmark and avoids `jsx-a11y/no-noninteractive-element-interactions`.
 */
export const useArrowKeyNavigation = ({
  prevKey,
  nextKey,
}: ArrowKeyNavigationParams): React.RefCallback<HTMLElement> =>
  useCallback(
    (node) => {
      if (node) {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === prevKey || e.key === nextKey) {
            const classFilter = ":not([aria-hidden='true']):not([disabled])"

            const items = Array.from(
              node.querySelectorAll<HTMLElement>(`a${classFilter}, button${classFilter}`),
            )

            if (items.length) {
              const currentIndex = items.indexOf(document.activeElement as HTMLElement)
              const direction = e.key === nextKey ? 1 : -1

              const nextIndex =
                currentIndex < 0 ? 0 : (currentIndex + direction + items.length) % items.length

              e.preventDefault()
              items[nextIndex].focus()
            }
          }
        }

        node.addEventListener("keydown", handleKeyDown)

        return () => node.removeEventListener("keydown", handleKeyDown)
      }
    },
    [prevKey, nextKey],
  )
