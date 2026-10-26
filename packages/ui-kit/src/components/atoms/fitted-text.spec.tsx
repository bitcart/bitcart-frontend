import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { FittedText } from "./fitted-text"

const STEPS = [
  {},
  { fontSize: "1.5rem", lineHeight: "2rem" },
  { fontSize: "1.25rem", lineHeight: "1.75rem" },
]

//* jsdom has no layout: each character is as wide as its font size says, the box is `boxWidth`.
const CHARACTER_WIDTHS: Record<string, number> = { "": 20, "1.5rem": 15, "1.25rem": 12 }

let boxWidth = 150
let resize: () => void = () => undefined

beforeEach(() => {
  boxWidth = 150

  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return (this.textContent?.length ?? 0) * (CHARACTER_WIDTHS[this.style.fontSize] ?? 0)
  })

  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => boxWidth)

  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback
      }

      observe = vi.fn()
      disconnect = vi.fn()
    },
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const renderPrice = (price: string) =>
  render(
    <FittedText steps={STEPS}>
      <span>{price}</span>
    </FittedText>,
  )

describe("FittedText", () => {
  test("keeps the child's own size when the text fits", () => {
    renderPrice("$1.00")

    expect(screen.getByText("$1.00").style.fontSize).toBe("")
    expect(screen.getByText("$1.00").style.whiteSpace).toBe("nowrap")
  })

  test("steps down to the first size that fits", () => {
    renderPrice("US$25.00")

    expect(screen.getByText("US$25.00").style).toMatchObject({
      fontSize: "1.5rem",
      lineHeight: "2rem",
      whiteSpace: "nowrap",
    })
  })

  test("past the last step, keeps the smallest size and wraps between words only", () => {
    renderPrice("US$1,234,567.89")

    expect(screen.getByText("US$1,234,567.89").style).toMatchObject({
      fontSize: "1.25rem",
      whiteSpace: "normal",
      overflowWrap: "normal",
    })
  })

  test("fits again when the text changes", async () => {
    const { rerender } = renderPrice("$1.00")

    rerender(
      <FittedText steps={STEPS}>
        <span>US$25.00</span>
      </FittedText>,
    )

    await waitFor(() => expect(screen.getByText("US$25.00").style.fontSize).toBe("1.5rem"))
  })

  test("fits again when its box resizes", () => {
    renderPrice("US$25.00")

    boxWidth = 200
    act(() => resize())

    expect(screen.getByText("US$25.00").style.fontSize).toBe("")
  })
})
