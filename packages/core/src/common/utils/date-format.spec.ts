import { afterEach, describe, expect, test, vi } from "vitest"

import { formatDateTime } from "./date-format"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("formatDateTime", () => {
  test("follows the locale's conventions", () => {
    vi.stubEnv("TZ", "UTC")

    expect(formatDateTime("2026-09-24T10:06:00+00:00", "en-US")).toMatch(
      /^Sep 24, 2026, 10:06\sAM$/,
    )

    expect(formatDateTime("2026-09-24T10:06:00+00:00", "de-DE")).toBe("24.09.2026, 10:06")
  })

  test("shows the time in the reader's time zone", () => {
    vi.stubEnv("TZ", "Asia/Tokyo")

    expect(formatDateTime("2026-09-24T10:06:00+00:00", "en-US")).toMatch(/^Sep 24, 2026, 7:06\sPM$/)
  })
})
