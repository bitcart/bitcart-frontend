import { useEffect, useEffectEvent, useRef } from "react"

//! Content changing under a resting pointer makes browsers fire pointer events without the
//! buyer touching anything, so only real travel counts as engagement.
const ENGAGEMENT_DISTANCE_PX = 8

export const useRedirectEngagement = (stop: (() => void) | undefined) => {
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null)

  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape" && stop) {
      event.preventDefault()
      stop()
    }
  })

  const isActive = stop !== undefined

  useEffect(() => {
    if (!isActive) return void null

    const listener = (event: KeyboardEvent) => onEscape(event)

    window.addEventListener("keydown", listener, { capture: true })

    return () => window.removeEventListener("keydown", listener, { capture: true })
  }, [isActive])

  return {
    onPointerMove: ({ clientX, clientY }: React.PointerEvent) => {
      pointerOrigin.current ??= { x: clientX, y: clientY }

      const { x, y } = pointerOrigin.current

      if (Math.hypot(clientX - x, clientY - y) >= ENGAGEMENT_DISTANCE_PX) stop?.()
    },

    onPointerDown: () => stop?.(),
    onFocus: () => stop?.(),
  }
}
