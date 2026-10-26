import { act, renderHook } from "@testing-library/react"
import { useEffect } from "react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { useCountdown } from "./countdown"

const advanceSeconds = async (seconds: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(seconds * 1_000)
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useCountdown", () => {
  describe("initial value", () => {
    test("floors a fractional value", () => {
      const { result } = renderHook(() => useCountdown(90.7))

      expect(result.current.secondsLeft).toBe(90)
    })

    test("clamps a negative value to zero", () => {
      const { result } = renderHook(() => useCountdown(-5))

      expect(result.current).toMatchObject({ secondsLeft: 0, isExpired: true })
    })
  })

  describe("formatting", () => {
    test.each([
      [0, "00:00"],
      [59, "00:59"],
      [60, "01:00"],
      [125, "02:05"],

      //* Minutes are never carried into hours.
      [3_600, "60:00"],
    ])("renders %i seconds as %s", (seconds, expected) => {
      const { result } = renderHook(() => useCountdown(seconds))

      expect(result.current.formatted).toBe(expected)
    })
  })

  describe("counting", () => {
    test("counts one second down per tick", async () => {
      const { result } = renderHook(() => useCountdown(10))

      await advanceSeconds(3)

      expect(result.current).toMatchObject({ secondsLeft: 7, formatted: "00:07" })
    })

    test("stops at zero and reports expiry", async () => {
      const { result } = renderHook(() => useCountdown(2))

      await advanceSeconds(5)

      expect(result.current).toMatchObject({ secondsLeft: 0, isExpired: true })
    })

    test("follows the clock when ticks arrive late", async () => {
      const { result } = renderHook(() => useCountdown(900))

      //* A background tab's timers are throttled: a minute passes before the next tick fires.
      vi.setSystemTime(Date.now() + 60_000)
      await advanceSeconds(1)

      expect(result.current.secondsLeft).toBe(839)
    })

    test("reports an active count as unexpired", () => {
      const { result } = renderHook(() => useCountdown(1))

      expect(result.current.isExpired).toBe(false)
    })
  })

  describe("speed", () => {
    test("counts `speed` seconds per real second", async () => {
      const { result } = renderHook(() => useCountdown(900, { speed: 10 }))

      await advanceSeconds(3)

      expect(result.current.secondsLeft).toBe(870)
    })

    test("keeps the seconds left when the speed changes", async () => {
      const { result, rerender } = renderHook(({ speed }) => useCountdown(900, { speed }), {
        initialProps: { speed: 1 },
      })

      await advanceSeconds(4)
      rerender({ speed: 5 })
      await advanceSeconds(2)

      expect(result.current.secondsLeft).toBe(886)
    })

    test("follows the clock at speed when ticks arrive late", async () => {
      const { result } = renderHook(() => useCountdown(900, { speed: 10 }))

      vi.setSystemTime(Date.now() + 10_000)
      await advanceSeconds(1)

      expect(result.current.secondsLeft).toBe(790)
    })
  })

  describe("resync", () => {
    test("never reports the superseded count after a change", async () => {
      const reportedCounts: number[] = []

      const { rerender } = renderHook(
        ({ initialValueSeconds }) => {
          const countdown = useCountdown(initialValueSeconds)

          useEffect(() => {
            reportedCounts.push(countdown.secondsLeft)
          })

          return countdown
        },
        { initialProps: { initialValueSeconds: 900 } },
      )

      await advanceSeconds(4)

      const reportedBeforeChange = reportedCounts.length

      rerender({ initialValueSeconds: 600 })

      expect(reportedCounts.slice(reportedBeforeChange)).toEqual([600])
    })

    test("restarts from a changed initial value", async () => {
      const { result, rerender } = renderHook(
        ({ initialValueSeconds }) => useCountdown(initialValueSeconds),
        { initialProps: { initialValueSeconds: 900 } },
      )

      await advanceSeconds(4)
      expect(result.current.secondsLeft).toBe(896)

      rerender({ initialValueSeconds: 600 })

      expect(result.current).toMatchObject({ secondsLeft: 600, formatted: "10:00" })
    })

    test("keeps counting from a restarted value", async () => {
      const { result, rerender } = renderHook(
        ({ initialValueSeconds }) => useCountdown(initialValueSeconds),
        { initialProps: { initialValueSeconds: 900 } },
      )

      rerender({ initialValueSeconds: 600 })
      await advanceSeconds(2)

      expect(result.current.secondsLeft).toBe(598)
    })

    test("ignores a rerender carrying an unchanged initial value", async () => {
      const { result, rerender } = renderHook(
        ({ initialValueSeconds }) => useCountdown(initialValueSeconds),
        { initialProps: { initialValueSeconds: 900 } },
      )

      await advanceSeconds(4)
      rerender({ initialValueSeconds: 900 })

      expect(result.current.secondsLeft).toBe(896)
    })

    test("resumes counting after a value revives an expired count", async () => {
      const { result, rerender } = renderHook(
        ({ initialValueSeconds }) => useCountdown(initialValueSeconds),
        { initialProps: { initialValueSeconds: 1 } },
      )

      await advanceSeconds(2)
      expect(result.current.isExpired).toBe(true)

      rerender({ initialValueSeconds: 30 })
      await advanceSeconds(3)

      expect(result.current).toMatchObject({ secondsLeft: 27, isExpired: false })
    })
  })
})
