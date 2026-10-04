import { act } from "@testing-library/react"
import confetti from "canvas-confetti"
import { afterEach, describe, expect, test, vi } from "vitest"

import { makeInvoice } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"

afterEach(() => {
  vi.useRealTimers()
})

describe("StatusOverlay", () => {
  test("stops the celebration once the completed invoice leaves the screen", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "Date"] })

    const { unmount } = renderCheckout({
      source: { invoice: makeInvoice({ status: "complete" }) },
      screens: { Payment: () => null },
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(confetti).toHaveBeenCalled()

    unmount()
    vi.mocked(confetti).mockClear()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(confetti).not.toHaveBeenCalled()
    expect(confetti.reset).toHaveBeenCalled()
  })
})
