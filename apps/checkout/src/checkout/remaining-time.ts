import { useFormattingLocale } from "./amount-format"
import { useCheckoutCountdown } from "./hooks"

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

type TimeUnit = "day" | "hour" | "minute" | "second"

const formatUnit = (
  value: number,
  unit: TimeUnit,
  unitDisplay: "narrow" | "long",
  locale: string,
) => new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay }).format(value)

const toWholeSeconds = (seconds: number) => Math.max(0, Math.floor(seconds))

const formatClock = (total: number) =>
  [Math.floor(total / MINUTE), total % MINUTE]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")

export const formatRemainingTime = (seconds: number, locale: string): string => {
  const total = toWholeSeconds(seconds)

  if (total <= HOUR) {
    return formatClock(total)
  } else if (total <= 48 * HOUR) {
    return formatUnit(Math.floor(total / HOUR), "hour", "narrow", locale)
  } else return formatUnit(Math.floor(total / DAY), "day", "narrow", locale)
}

const UNITS: { unit: TimeUnit; size: number; within: number }[] = [
  { unit: "day", size: DAY, within: Infinity },
  { unit: "hour", size: HOUR, within: DAY },
  { unit: "minute", size: MINUTE, within: HOUR },
  { unit: "second", size: 1, within: MINUTE },
]

export const describeRemainingTime = (seconds: number, locale: string): string => {
  const total = toWholeSeconds(seconds)

  const parts = UNITS.map(({ unit, size, within }) => ({
    unit,
    value: Math.floor((total % within) / size),
  }))

  const firstNonZero = parts.findIndex(({ value }) => value > 0)
  const largest = firstNonZero === -1 ? parts.length - 1 : firstNonZero

  const shown = parts
    .slice(largest, largest + 2)
    .filter(({ value }, index) => index === 0 || value > 0)

  return new Intl.ListFormat(locale, { type: "unit", style: "long" }).format(
    shown.map(({ unit, value }) => formatUnit(value, unit, "long", locale)),
  )
}

export type CheckoutRemainingTime = {
  text: string
  description: string
}

export const useRemainingTime = (): CheckoutRemainingTime => {
  const { secondsLeft } = useCheckoutCountdown()
  const locale = useFormattingLocale()

  return {
    text: formatRemainingTime(secondsLeft, locale),
    description: describeRemainingTime(secondsLeft, locale),
  }
}
