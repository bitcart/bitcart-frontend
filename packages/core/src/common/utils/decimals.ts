export const toBaseUnits = (amount: string, decimals: number): bigint => {
  const [whole = "0", fraction = ""] = amount.split(".")

  return BigInt(whole + fraction.padEnd(decimals, "0").slice(0, decimals))
}

export const fromBaseUnits = (units: bigint, decimals: number): string => {
  const digits = units.toString().padStart(decimals + 1, "0")

  if (decimals > 0) {
    return `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`
  } else return digits
}

export const trimTrailingZeros = (amount: string): string =>
  amount.includes(".") ? amount.replace(/\.?0+$/u, "") : amount

export const getDecimalPlaces = (amount: string): number => amount.split(".")[1]?.length ?? 0

export const compareAmounts = (a: string, b: string): number => {
  const scale = Math.max(getDecimalPlaces(a), getDecimalPlaces(b))

  return Math.sign(Number(toBaseUnits(a, scale) - toBaseUnits(b, scale)))
}
