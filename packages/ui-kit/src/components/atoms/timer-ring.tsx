import { clamp } from "remeda"

import { cn } from "@/utils"

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const FULL_RING_OPACITY = 0.5

export type TimerRingProps = React.ComponentProps<"div"> & {
  secondsLeft: number
  totalSeconds: number
}

//* The arc empties as the seconds run out and grows more opaque on the way. It eases over a full
//* second, so a countdown ticking once a second moves it continuously.
export const TimerRing: React.FC<TimerRingProps> = ({
  secondsLeft,
  totalSeconds,
  className,
  children,
  ...props
}) => {
  const remaining = totalSeconds > 0 ? clamp(secondsLeft / totalSeconds, { min: 0, max: 1 }) : 0

  return (
    <div
      data-slot="timer-ring"
      className={cn("size-16 text-primary relative grid shrink-0 place-items-center", className)}
      {...props}
    >
      <svg viewBox="0 0 56 56" className="inset-0 absolute size-full -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={RADIUS} fill="none" className="stroke-muted" strokeWidth={4} />

        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - remaining)}
          strokeOpacity={1 - (1 - FULL_RING_OPACITY) * remaining}
          className="motion-safe:transition-all motion-safe:duration-1000 motion-safe:ease-linear"
        />
      </svg>

      {children}
    </div>
  )
}
