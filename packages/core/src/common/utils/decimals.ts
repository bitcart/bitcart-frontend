const toBaseUnits = (amount: string, decimals: number): bigint => {
  const [whole = "0", fraction = ""] = amount.split(".")

  return BigInt(whole + fraction.padEnd(decimals, "0").slice(0, decimals))
}

const fromBaseUnits = (units: bigint, decimals: number): string => {
  const digits = units.toString().padStart(decimals + 1, "0")

  if (decimals === 0) {
    return digits
  } else return `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`
}

/**
 * The part of `total` still owed after `paid`, never below zero, formatted at `decimals`.
 */
export const getRemainingAmount = (total: string, paid: number, decimals: number): string => {
  const remaining = toBaseUnits(total, decimals) - toBaseUnits(paid.toFixed(decimals), decimals)

  return fromBaseUnits(remaining > 0n ? remaining : 0n, decimals)
}

export const formatAmount = (amount: number, decimals: number): string =>
  fromBaseUnits(toBaseUnits(amount.toFixed(decimals), decimals), decimals)
