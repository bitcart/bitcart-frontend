import { fireEvent, render } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { useEmbedEscapeClose } from "./hooks"

const close = vi.fn()

vi.mock("./host", () => ({ getEmbedHost: () => ({ close }) }))

const Checkout = ({ isEmbedded = true }: { isEmbedded?: boolean }) => {
  useEmbedEscapeClose(isEmbedded)

  return <p>Checkout</p>
}

describe("useEmbedEscapeClose", () => {
  beforeEach(() => {
    close.mockClear()
  })

  test("closes the modal on an Escape nothing else handled", () => {
    render(<Checkout />)

    const handled = new KeyboardEvent("keydown", { key: "Escape", cancelable: true })

    handled.preventDefault()
    window.dispatchEvent(handled)

    expect(close).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: "Escape" })

    expect(close).toHaveBeenCalledOnce()
  })

  test("does nothing outside a modal", () => {
    render(<Checkout isEmbedded={false} />)
    fireEvent.keyDown(window, { key: "Escape" })

    expect(close).not.toHaveBeenCalled()
  })
})
