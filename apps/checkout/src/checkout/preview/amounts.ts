import { toBaseUnits } from "@bitcart/core/utils"

export const divideRounded = (numerator: bigint, denominator: bigint): bigint =>
  (numerator * 2n + denominator) / (denominator * 2n)

export const percentOf = (units: bigint, percent: string): bigint =>
  divideRounded(units * toBaseUnits(percent, 2), 10_000n)

export const roundSignificant = (units: bigint, digits: number): bigint => {
  const length = units.toString().length

  if (length > digits) {
    const factor = 10n ** BigInt(length - digits)

    return divideRounded(units, factor) * factor
  } else return units
}
