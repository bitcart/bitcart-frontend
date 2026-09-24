import { useEffect, useState } from "react"

const COUNTDOWN_TICK_INTERVAL_MS = 1_000

const toWholeSeconds = (seconds: number): number => Math.max(0, Math.floor(seconds))

/**
 * Counts a number of seconds down to zero, formatted as `mm:ss`.
 *
 * A change to the starting value restarts the count from it.
 *
 * @example
 * ```tsx
 * const { formatted, isExpired } = useCountdown(900);
 * ```
 */
export const useCountdown = (
  initialValueSeconds: number,
): { secondsLeft: number; formatted: string; isExpired: boolean } => {
  const [secondsLeft, setSecondsLeft] = useState(() => toWholeSeconds(initialValueSeconds))
  const [lastInitialValue, setLastInitialValue] = useState(initialValueSeconds)

  //* Adjusted at render time to prevent redundant re-renders.
  if (lastInitialValue !== initialValueSeconds) {
    setLastInitialValue(initialValueSeconds)
    setSecondsLeft(toWholeSeconds(initialValueSeconds))
  }

  const isActive = secondsLeft > 0

  useEffect(() => {
    if (!isActive) return void null

    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          clearInterval(interval)

          return 0
        }

        return previous - 1
      })
    }, COUNTDOWN_TICK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isActive])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return { secondsLeft, formatted, isExpired: !isActive }
}
