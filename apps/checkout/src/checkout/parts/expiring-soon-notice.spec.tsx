import { act, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { makeInvoice } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"
import { ExpiringSoonNotice } from "./expiring-soon-notice"

afterEach(() => {
  vi.useRealTimers()
})

const renderNotice = (timeLeft: number, lifetime = 900) =>
  renderCheckout({
    source: { invoice: makeInvoice({ time_left: timeLeft, expiration_seconds: lifetime }) },
    screens: { Payment: () => <ExpiringSoonNotice /> },
  })

describe("ExpiringSoonNotice", () => {
  test("appears in the status region once five minutes are left", () => {
    vi.useFakeTimers()
    renderNotice(301)

    expect(screen.getByRole("status")).toBeEmptyDOMElement()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByRole("status")).toHaveTextContent("This invoice is about to expire")
  })

  test("stays quiet in a long invoice's last hours", () => {
    renderNotice(3600, 172_800)

    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })

  test("waits for half of a short invoice's lifetime", () => {
    vi.useFakeTimers()
    renderNotice(121, 240)

    expect(screen.getByRole("status")).toBeEmptyDOMElement()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByRole("status")).toHaveTextContent("This invoice is about to expire")
  })

  test("goes away once the invoice has run out of time", () => {
    renderNotice(0)

    expect(screen.getByRole("status")).toBeEmptyDOMElement()
  })
})
