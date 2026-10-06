import type { SocketConnectionHandle } from "@bitcart/core/types"
import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { makeModel } from "../fixtures"
import { CheckoutProvider } from "../runtime/provider"
import { CheckoutTestProviders } from "../testing"
import { CheckoutConnectionBanner } from "./connection-banner"

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
      <CheckoutProvider model={makeModel()} connection={reconnecting}>
        <CheckoutConnectionBanner />
      </CheckoutProvider>,
      { wrapper: CheckoutTestProviders },
    )

    expect(screen.getByRole("status")).toHaveTextContent("Connection lost, reconnecting...")
  })

  test("stays hidden without a live connection to report on", () => {
    render(
      <CheckoutProvider model={makeModel()}>
        <CheckoutConnectionBanner />
      </CheckoutProvider>,
      { wrapper: CheckoutTestProviders },
    )

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
