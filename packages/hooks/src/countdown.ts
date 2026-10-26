import { useEffect, useEffectEvent, useState } from "react"

const COUNTDOWN_TICK_INTERVAL_MS = 1_000

const toWholeSeconds = (seconds: number): number => Math.max(0, Math.floor(seconds))

/**
 * Counts a number of seconds down to zero, formatted as `mm:ss`.
 *
 *
 * @example
 * ```tsx
 * const { formatted, isExpired } = useCountdown(900);
 * ```
 */
export const useCountdown = (
  initialValueSeconds: number,
  { speed = 1 }: { speed?: number } = {},
): { secondsLeft: number; formatted: string; isExpired: boolean } => {
  const [secondsLeft, setSecondsLeft] = useState(() => toWholeSeconds(initialValueSeconds))
  const [lastInitialValue, setLastInitialValue] = useState(initialValueSeconds)

  //* Adjusted at render time to prevent redundant re-renders.
  if (lastInitialValue !== initialValueSeconds) {
    setLastInitialValue(initialValueSeconds)
    setSecondsLeft(toWholeSeconds(initialValueSeconds))
  }

  const isActive = secondsLeft > 0
  const readSecondsLeft = useEffectEvent(() => secondsLeft)

  useEffect(() => {
    if (!isActive) return void null

    const startedAt = Date.now()
    const startSecondsLeft = readSecondsLeft()

    const interval = setInterval(() => {
      //* Rounded so a tick firing a few milliseconds early or late still counts a whole second.
      const elapsedSeconds = Math.round((Date.now() - startedAt) / COUNTDOWN_TICK_INTERVAL_MS)
      const next = toWholeSeconds(startSecondsLeft - elapsedSeconds * speed)

      setSecondsLeft(next)

      if (next === 0) clearInterval(interval)
    }, COUNTDOWN_TICK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isActive, speed, lastInitialValue])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return { secondsLeft, formatted, isExpired: !isActive }
}
