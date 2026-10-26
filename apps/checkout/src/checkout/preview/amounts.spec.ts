import { describe, expect, test } from "vitest"

import { percentOf } from "./amounts"

describe("percentOf", () => {
  test.each([
    [43_210n, "4.6", 1_988n],
    [43_210n, "120", 51_852n],
    [43_210n, "100", 43_210n],
    [0n, "4.6", 0n],
  ])("takes %s units times %s%% as %s, rounded half up", (units, percent, expected) => {
    expect(percentOf(units, percent)).toBe(expected)
  })
})
