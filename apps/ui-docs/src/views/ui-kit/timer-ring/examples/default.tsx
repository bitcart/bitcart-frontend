import { TimerRing } from "@bitcart/ui-kit/components"
import { useEffect, useState } from "react"

const TOTAL_SECONDS = 10

export const DefaultTimerRingExample: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)

  useEffect(() => {
    const interval = setInterval(
      () => setSecondsLeft((seconds) => (seconds > 0 ? seconds - 1 : TOTAL_SECONDS)),
      1000,
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <TimerRing secondsLeft={secondsLeft} totalSeconds={TOTAL_SECONDS}>
      <span className="text-sm font-semibold text-foreground relative tabular-nums">
        {secondsLeft}
      </span>
    </TimerRing>
  )
}
