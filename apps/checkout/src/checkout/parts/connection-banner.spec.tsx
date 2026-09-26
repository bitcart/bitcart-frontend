import type { SocketConnectionHandle } from "@bitcart/core/types"
import { render, renderHook, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { useCheckoutModel } from "../model"
import { CheckoutProvider } from "../runtime/provider"
import { makeSource } from "../testing/fixtures"
import { CheckoutConnectionBanner } from "./connection-banner"

const model = () =>
  renderHook(() => useCheckoutModel(makeSource(), { selection: "preselect" })).result.current

const reconnecting: SocketConnectionHandle = {
  isConnected: false,
  isClientOnline: true,
  isReconnecting: true,
  isReconnectLimitReached: false,
  reconnect: vi.fn(),
}

describe("CheckoutConnectionBanner", () => {
  test("reports a lost live connection", () => {
    render(
      <CheckoutProvider model={model()} connection={reconnecting}>
        <CheckoutConnectionBanner />
      </CheckoutProvider>,
    )

    expect(screen.getByRole("status")).toHaveTextContent("Connection lost, reconnecting...")
  })

  test("stays hidden without a live connection to report on", () => {
    render(
      <CheckoutProvider model={model()}>
        <CheckoutConnectionBanner />
      </CheckoutProvider>,
    )

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
