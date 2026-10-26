import { describe, expect, test } from "vitest"

import { compareAmounts, fromBaseUnits, toBaseUnits, trimTrailingZeros } from "./decimals"

describe("compareAmounts", () => {
  test("compares amounts written at different scales", () => {
    expect(compareAmounts("25.00", "25")).toBe(0)
    expect(compareAmounts("24.999", "25")).toBe(-1)
    expect(compareAmounts("0.000000000000000002", "0.000000000000000001")).toBe(1)
  })

  test("compares raw decimals against zero", () => {
    expect(compareAmounts("1.5", "0")).toBe(1)
    expect(compareAmounts("0", "0")).toBe(0)
  })
})

describe("toBaseUnits", () => {
  test.each([
    ["25.00", 2, 2500n],
    ["0.00043210", 8, 43_210n],
    ["1.5", 8, 150_000_000n],
    ["12", 2, 1200n],
    ["0.123456789", 8, 12_345_678n],
  ])("writes %s at %i decimals as %s units", (amount, decimals, units) => {
    expect(toBaseUnits(amount, decimals)).toBe(units)
  })
})

describe("fromBaseUnits", () => {
  test.each([
    [2500n, 2, "25.00"],
    [43_210n, 8, "0.00043210"],
    [0n, 2, "0.00"],
    [1200n, 0, "1200"],
  ])("writes %s units at %i decimals as %s", (units, decimals, amount) => {
    expect(fromBaseUnits(units, decimals)).toBe(amount)
  })
})

describe("trimTrailingZeros", () => {
  test.each([
    ["0.000143000000000000", "0.000143"],
    ["25.00", "25"],
    ["1200", "1200"],
    ["0.0", "0"],
  ])("writes %s as %s", (amount, trimmed) => {
    expect(trimTrailingZeros(amount)).toBe(trimmed)
  })
})
