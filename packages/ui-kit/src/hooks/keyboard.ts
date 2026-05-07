import { useEffect } from "react"
import { useIsClient } from "usehooks-ts"

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
