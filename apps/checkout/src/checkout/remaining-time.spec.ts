import { describe, expect, test } from "vitest"

import { describeRemainingTime, formatRemainingTime } from "./remaining-time"

const HOUR = 3600
const DAY = 24 * HOUR

describe("formatRemainingTime", () => {
  test.each([
    [0, "00:00"],
    [59, "00:59"],
    [125, "02:05"],
    [HOUR, "60:00"],
    [HOUR + 1, "1h"],
    [2 * HOUR - 1, "1h"],
    [2 * HOUR, "2h"],
    [48 * HOUR, "48h"],
    [48 * HOUR + 1, "2d"],
    [7 * DAY - 1, "6d"],
  ])("shows %i seconds as %s, never more than is left", (seconds, expected) => {
    expect(formatRemainingTime(seconds, "en")).toBe(expected)
  })

  test("treats negative and fractional seconds as whole seconds left", () => {
    expect(formatRemainingTime(-5, "en")).toBe("00:00")
    expect(formatRemainingTime(59.9, "en")).toBe("00:59")
  })

  test("writes hours and days in the locale's own short units", () => {
    expect(formatRemainingTime(23 * HOUR, "de")).toBe("23h")
    expect(formatRemainingTime(13 * DAY, "de")).toBe("13 T")
    expect(formatRemainingTime(23 * HOUR, "ru")).toBe("23 ч")
  })
})

describe("describeRemainingTime", () => {
  test.each([
    [0, "0 seconds"],
    [45, "45 seconds"],
    [125, "2 minutes, 5 seconds"],
    [HOUR, "1 hour"],
    [2 * HOUR - 60, "1 hour, 59 minutes"],
    [DAY + 3 * HOUR + 59, "1 day, 3 hours"],
  ])("tells %i seconds as %s, to the two largest units", (seconds, expected) => {
    expect(describeRemainingTime(seconds, "en")).toBe(expected)
  })

  test("follows the locale", () => {
    expect(describeRemainingTime(2 * HOUR - 60, "de")).toBe("1 Stunde, 59 Minuten")
  })
})
