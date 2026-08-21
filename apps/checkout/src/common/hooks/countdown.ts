import { useEffect, useState } from "react"

export const useCountdown = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor(initialSeconds)))
  const isActive = secondsLeft > 0

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)

          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return { secondsLeft, formatted, isExpired: !isActive }
}
