import { act, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { makeInvoice } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"
import { ExpiryProgress } from "./expiry-progress"

afterEach(() => {
  vi.useRealTimers()
})

const renderProgress = (timeLeft: number) =>
  renderCheckout({
    source: { invoice: makeInvoice({ time_left: timeLeft, expiration_seconds: 900 }) },
    screens: { Payment: () => <ExpiryProgress /> },
  })

describe("ExpiryProgress", () => {
  test("shows the time left out of the invoice's lifetime", () => {
    renderProgress(450)

    const bar = screen.getByRole("progressbar", { name: "Time left to pay" })

    expect(bar).toHaveAttribute("aria-valuenow", "450")
    expect(bar).toHaveAttribute("aria-valuemax", "900")
    expect(bar).toHaveAttribute("aria-valuetext", "7 minutes, 30 seconds")
    expect(bar).toHaveStyle({ width: "50%" })
    expect(bar).toHaveClass("bg-primary")
  })

  test("turns urgent once five minutes are left", () => {
    vi.useFakeTimers()
    renderProgress(301)

    expect(screen.getByRole("progressbar")).toHaveClass("bg-primary")

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByRole("progressbar")).toHaveClass("bg-destructive")
  })
})
